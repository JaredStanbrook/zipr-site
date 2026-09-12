import { Hono } from "hono";
import { and, desc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import type { AppEnv } from "@server/types";
import { release, releaseAsset } from "@server/schema/release.schema";
import type { Platform, ReleaseWithAssets } from "@server/schema/release.schema";
import { enquiry, enquiryFormSchema } from "@server/schema/enquiry.schema";
import { PLATFORM_INFO } from "@server/content/site";

import { HomePage } from "@views/pages/Home";
import { FeaturesPage } from "@views/pages/Features";
import { PricingPage } from "@views/pages/Pricing";
import { DocsPage } from "@views/pages/Docs";
import { DownloadsPage } from "@views/pages/Downloads";
import { ContactPage, ContactForm, ContactSuccess } from "@views/pages/Contact";

/**
 * Every page a signed-out visitor can reach.
 *
 * No guard on this router — that is the point of it. The only write it accepts
 * is the contact form, which is rate-limited at the edge and validated here.
 */
export const siteRoute = new Hono<AppEnv>();

// ==========================================
// STATIC PAGES
// ==========================================

siteRoute.get("/", (c) =>
  c.render(<HomePage />, {
    // The home page is the site's own entry in search results, so it takes the
    // site name alone rather than a "Home ·" prefix.
    title: undefined,
    description:
      "One catalogue of the things your team launches. A free, offline-first desktop client, and a self-hosted API for when the work has to be shared.",
    type: "website",
  }),
);

siteRoute.get("/features", (c) =>
  c.render(<FeaturesPage />, {
    title: "Features",
    description:
      "Items, actions, offline editing, three-way merge, revision history and plugins — what runs on your machine and what needs a deployment.",
  }),
);

siteRoute.get("/pricing", (c) =>
  c.render(<PricingPage app={c.var.app} />, {
    title: "Pricing",
    description:
      "The Zipr client is free permanently. A self-hosted API licence is $6 per person per month, and this page says what the infrastructure costs too.",
  }),
);

siteRoute.get("/docs", (c) =>
  c.render(<DocsPage />, {
    title: "How it works",
    description:
      "Zipr's architecture, the two supported deployment shapes, optional capabilities, and what to know before writing your own client.",
  }),
);

// ==========================================
// DOWNLOADS
// ==========================================

/**
 * Guess which installer to lead with.
 *
 * Only ever used to add a "looks like your system" badge and ring — every
 * platform's button is rendered either way, because a user-agent is a hint and
 * a person on a work laptop downloading for their home machine is not an edge
 * case.
 */
const detectPlatform = (userAgent: string | undefined): Platform | null => {
  if (!userAgent) return null;
  for (const info of PLATFORM_INFO) {
    if (info.uaMatch.test(userAgent)) return info.id;
  }
  return null;
};

/**
 * Published releases, newest first, with their installers attached.
 *
 * Two queries rather than a join: D1 charges per row read, a join would repeat
 * the release columns once per asset, and stitching two small result sets in
 * the worker costs nothing at this size.
 */
const listPublishedReleases = async (
  db: AppEnv["Variables"]["db"],
  limit: number,
): Promise<ReleaseWithAssets[]> => {
  const releases = await db
    .select()
    .from(release)
    .where(and(isNotNull(release.publishedAt), isNull(release.deletedAt)))
    .orderBy(desc(release.publishedAt))
    .limit(limit);

  if (releases.length === 0) return [];

  const assets = await db
    .select()
    .from(releaseAsset)
    .where(
      inArray(
        releaseAsset.releaseId,
        releases.map((r) => r.id),
      ),
    );

  return releases.map((rel) => ({
    ...rel,
    assets: assets.filter((asset) => asset.releaseId === rel.id),
  }));
};

siteRoute.get("/downloads", async (c) => {
  // One more than we show, so "is there an archive" needs no second query.
  const releases = await listPublishedReleases(c.var.db, 11);
  const [latest, ...previous] = releases;

  return c.render(
    <DownloadsPage
      latest={latest ?? null}
      previous={previous}
      detected={detectPlatform(c.req.header("User-Agent"))}
      app={c.var.app}
    />,
    {
      title: "Downloads",
      description:
        "Download the Zipr desktop client for Windows or macOS. Free, no account, and no network request until you point it at a deployment.",
    },
  );
});

/**
 * Hand over an installer.
 *
 * The bucket is never public: bytes are streamed through the worker so that a
 * download can be counted, an unpublished release cannot be fetched by
 * guessing an id, and the storage layout stays an implementation detail.
 */
siteRoute.get("/downloads/:assetId", async (c) => {
  const assetId = Number(c.req.param("assetId"));
  if (!Number.isInteger(assetId)) return c.notFound();

  const [row] = await c.var.db
    .select({ asset: releaseAsset, publishedAt: release.publishedAt, deletedAt: release.deletedAt })
    .from(releaseAsset)
    .innerJoin(release, eq(releaseAsset.releaseId, release.id))
    .where(eq(releaseAsset.id, assetId));

  // A draft or soft-deleted release is a 404, not a 403: whether it exists is
  // not something an anonymous visitor gets to learn.
  if (!row || !row.publishedAt || row.deletedAt) return c.notFound();

  const object = await c.env.R2.get(row.asset.r2Key);
  if (!object) {
    // The row says there are bytes and the bucket disagrees. That is an
    // operator problem, not a missing page, and it should read as one.
    console.error(`[downloads] asset ${assetId} has no object at ${row.asset.r2Key}`);
    return c.text("That installer is temporarily unavailable.", 503);
  }

  // Counted before the body is handed over, because once it is streaming there
  // is no later. An abandoned download counting as one is the cheaper error.
  //
  // Wrapped in an async function rather than handed the query builder directly:
  // Drizzle's builder is lazy and thenable, so whether the statement ever runs
  // depends on the host actually awaiting it — and a counter that silently
  // stops counting is worse than no counter. The catch is because a failed
  // count must never cost somebody their download.
  const countDownload = async () => {
    try {
      await c.var.db
        .update(releaseAsset)
        .set({ downloadCount: sql`${releaseAsset.downloadCount} + 1` })
        .where(eq(releaseAsset.id, assetId));
    } catch (err) {
      console.error(`[downloads] could not count asset ${assetId}: ${String(err)}`);
    }
  };

  // `executionCtx` throws rather than returning undefined where it is absent,
  // so the fallback is awaiting the write before responding.
  try {
    c.executionCtx.waitUntil(countDownload());
  } catch {
    await countDownload();
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": row.asset.contentType,
      "Content-Length": String(row.asset.sizeBytes),
      // `attachment` so a .dmg or .exe is saved rather than navigated to, and
      // the filename is the one we published rather than the object key.
      "Content-Disposition": `attachment; filename="${row.asset.filename}"`,
      // Installers are immutable once published — a new build is a new row.
      "Cache-Control": "public, max-age=31536000, immutable",
      ...(row.asset.sha256 ? { "X-Checksum-Sha256": row.asset.sha256 } : {}),
    },
  });
});

// ==========================================
// CONTACT
// ==========================================

siteRoute.get("/contact", (c) =>
  c.render(<ContactPage topic={c.req.query("topic")} />, {
    title: "Contact",
    description:
      "Ask about a Zipr licence, get help with a self-hosted deployment, or report a security issue.",
  }),
);

siteRoute.post(
  "/contact",
  zValidator("form", enquiryFormSchema, (result, c) => {
    // Re-render the form with what they typed still in it. Handing someone an
    // empty form back after they wrote five paragraphs is how an enquiry is
    // lost — and they do not send it a second time.
    if (!result.success) {
      // `result.data` on a failure is the raw input, not the parsed output, so
      // its inferred type is the one the schema *would* have produced.
      const values = result.data as unknown as Record<string, string>;
      return c.html(
        <ContactForm values={values} errors={z.flattenError(result.error).fieldErrors} />,
        422,
      );
    }
  }),
  async (c) => {
    const data = c.req.valid("form");

    // Honeypot. Answer as though it worked — telling a bot it was caught only
    // teaches whoever wrote it which field to skip next time.
    if (data.website) {
      return c.html(<ContactSuccess name={data.name} />);
    }

    await c.var.db.insert(enquiry).values({
      name: data.name,
      email: data.email,
      organisation: data.organisation || null,
      topic: data.topic,
      seats: data.seats,
      message: data.message,
      updatedAt: new Date().toISOString(),
    });

    return c.html(<ContactSuccess name={data.name} />);
  },
);
