import { Hono } from "hono";
import { and, desc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import type { AppEnv } from "@server/types";
import { release, releaseAsset } from "@server/schema/release.schema";
import type { Platform, ReleaseWithAssets } from "@server/schema/release.schema";
import { issue, issueFormSchema } from "@server/schema/issue.schema";
import { PLATFORM_INFO } from "@server/content/site";
import { PRICING_FAQ, TIERS } from "@server/content/pricing";
import { formatPrice } from "@views/lib/utils";
import { faqSchema, softwareSchema, websiteSchema } from "@server/lib/structured-data";

import { HomePage } from "@views/pages/Home";
import { FeaturesPage } from "@views/pages/Features";
import { PricingPage } from "@views/pages/Pricing";
import { SecurityPage, REVIEW_FAQ } from "@views/pages/Security";
import { PrivacyPage } from "@views/pages/Privacy";
import { LicencePage } from "@views/pages/Licence";
import { DownloadsPage } from "@views/pages/Downloads";
import { ContactPage } from "@views/pages/Contact";
import { ReportPage, ReportForm, ReportSuccess } from "@views/pages/Report";

/**
 * Every page a signed-out visitor can reach.
 *
 * No guard on this router — that is the point of it. It accepts exactly one
 * write, the bug report, which exists because the source repositories are
 * private and there is therefore no public tracker to send anyone to. That one
 * endpoint is rate-limited at the edge and honeypotted; everything else here
 * only reads.
 */
/** Shared by the home page's meta description and its SoftwareApplication. */
const HOME_DESCRIPTION =
  "Zipr is a free desktop launcher for Windows and macOS. Chain commands, links, apps and prompts into one-click items, then share them with your team.";

/** The hosted per-person price, from the pricing data rather than retyped. */
const hostedFrom = (app: AppEnv["Variables"]["app"]) => {
  const cents = TIERS.find((tier) => tier.id === "cloud")?.annualMonthlyCents ?? 0;
  return formatPrice(cents, app.locale, app.currency);
};

export const siteRoute = new Hono<AppEnv>();

// ==========================================
// STATIC PAGES
// ==========================================

siteRoute.get("/", (c) =>
  c.render(<HomePage app={c.var.app} />, {
    // Says what Zipr is, not "Home": the site name alone told a searcher who
    // had not heard of Zipr nothing about whether to click.
    title: "Desktop launcher for commands, links and apps",
    description: HOME_DESCRIPTION,
    jsonLd: [websiteSchema(c.var.app), softwareSchema(c.var.app, HOME_DESCRIPTION)],
    type: "website",
  }),
);

siteRoute.get("/features", (c) =>
  c.render(<FeaturesPage />, {
    title: "Features: step types, sharing and history",
    description:
      "What the free Zipr app does on its own, what a team server adds, and the twelve step types every item is built from.",
  }),
);

siteRoute.get("/pricing", (c) =>
  c.render(<PricingPage app={c.var.app} />, {
    title: `Pricing: free app, team plans from ${hostedFrom(c.var.app)}`,
    description: `Zipr is free for one person, for good. Team sharing is hosted from ${hostedFrom(c.var.app)} per person a month, or self-hosted and priced per deployment. Compare every feature.`,
    jsonLd: [faqSchema(PRICING_FAQ)],
  }),
);

siteRoute.get("/security", (c) =>
  c.render(<SecurityPage />, {
    title: "Security and data handling",
    description:
      "Where your data lives, what leaves your network, and why Zipr never runs your commands on a server. Short answers for your security review.",
    jsonLd: [faqSchema(REVIEW_FAQ)],
  }),
);

siteRoute.get("/licence", (c) =>
  c.render(<LicencePage app={c.var.app} />, {
    title: "Licence for the desktop app",
    description:
      "The Zipr Licence: free to install and use, on any number of devices, for personal use or work.",
  }),
);

siteRoute.get("/privacy", (c) =>
  c.render(<PrivacyPage app={c.var.app} />, {
    title: "Privacy notice",
    description:
      "What the Zipr website and app collect, why, who else sees it, and how to ask for a copy or have it deleted.",
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
      title: "Download for Windows and macOS",
      description:
        "Download the free Zipr desktop app for Windows 10+ or macOS 12+. No account needed, and no network requests until you connect it to a team server.",
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
    title: "Contact: team setup, quotes and support",
    description:
      "Get your team set up, ask about self-hosting, get help, or report a security issue privately. Every message reaches a person.",
    // `?topic=` only highlights one card on the same page. Canonical to
    // /contact consolidates it; noindex on top would send a conflicting signal.
    noindex: false,
  }),
);

// ==========================================
// BUG REPORTS
// ==========================================

siteRoute.get("/report", (c) =>
  c.render(<ReportPage product={c.req.query("product")} />, {
    title: "Report a bug",
    description:
      "Tell us what broke in the Zipr desktop app, a deployment, or this website. No account needed.",
    // `?product=` only preselects the dropdown; same reasoning as /contact.
    noindex: false,
  }),
);

siteRoute.post(
  "/report",
  /**
   * The one public write on the site, so it gets the edge throttle the auth
   * API uses. Skipped when the binding is absent so `npm run dev` and the
   * tests still work — the binding only exists where Wrangler provides one.
   */
  async (c, next) => {
    const limiter = c.env.RATE_LIMITER;
    if (!limiter) return next();

    const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";
    const { success } = await limiter.limit({ key: `report:${ip}` });

    if (!success) {
      return c.html(
        <p role="alert" class="text-sm font-medium text-destructive">
          That is a lot of reports at once. Give it a minute and try again.
        </p>,
        429,
      );
    }

    await next();
  },
  zValidator("form", issueFormSchema, (result, c) => {
    // Hand back what they typed. Someone who has just described a bug in five
    // sentences does not write it a second time.
    if (!result.success) {
      const values = result.data as unknown as Record<string, string>;
      return c.html(
        <ReportForm values={values} errors={z.flattenError(result.error).fieldErrors} />,
        422,
      );
    }
  }),
  async (c) => {
    const data = c.req.valid("form");

    // Honeypot. Answer as though it worked — telling a bot it was caught only
    // teaches whoever wrote it which field to skip next time.
    if (data.website) return c.html(<ReportSuccess />);

    await c.var.db.insert(issue).values({
      product: data.product,
      summary: data.summary,
      detail: data.detail,
      email: data.email,
      version: data.version || null,
      platform: data.platform || null,
      updatedAt: new Date().toISOString(),
    });

    return c.html(<ReportSuccess />);
  },
);
