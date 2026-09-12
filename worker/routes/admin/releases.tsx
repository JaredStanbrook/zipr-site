import { Hono } from "hono";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

import type { AppEnv } from "@server/types";
import {
  release,
  releaseAsset,
  releaseFormSchema,
  assetFormSchema,
  type ReleaseWithAssets,
} from "@server/schema/release.schema";
import { AccessControl } from "@server/services/access.service";
import { htmxToast, flashToast } from "@server/lib/htmx-helpers";
import { ReleasesPage, ReleaseCard } from "@views/admin/Releases";

/**
 * Publishing the desktop client.
 *
 * Creating a release, attaching installers, and making the whole thing visible
 * are three separate acts on purpose: a release that appeared the moment it was
 * created would spend the upload window offering a version number and no button.
 */
export const releasesRoute = new Hono<AppEnv>();

const access = new AccessControl();

const live = () => isNull(release.deletedAt);

/** One release with its assets, ready to re-render after any change. */
const loadRelease = async (
  db: AppEnv["Variables"]["db"],
  id: number,
): Promise<ReleaseWithAssets | null> => {
  const [row] = await db
    .select()
    .from(release)
    .where(and(eq(release.id, id), live()));

  if (!row) return null;

  const assets = await db
    .select()
    .from(releaseAsset)
    .where(eq(releaseAsset.releaseId, id))
    .orderBy(releaseAsset.platform);

  return { ...row, assets };
};

const loadAll = async (db: AppEnv["Variables"]["db"]): Promise<ReleaseWithAssets[]> => {
  const releases = await db.select().from(release).where(live()).orderBy(desc(release.createdAt));

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

  return releases.map((row) => ({
    ...row,
    assets: assets.filter((asset) => asset.releaseId === row.id),
  }));
};

// ==========================================
// LIST
// ==========================================
releasesRoute.get("/", async (c) => {
  access.authorize(c.var.auth.user!, "releases", "read");

  return c.render(
    <ReleasesPage
      releases={await loadAll(c.var.db)}
      app={c.var.app}
      error={c.req.query("error")}
    />,
    { title: "Releases" },
  );
});

// ==========================================
// CREATE
// ==========================================
releasesRoute.post(
  "/",
  zValidator("form", releaseFormSchema, (result, c) => {
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "That release could not be created.";
      return c.redirect(`/admin/releases?error=${encodeURIComponent(message)}`);
    }
  }),
  async (c) => {
    const user = c.var.auth.user!;
    access.authorize(user, "releases", "create");

    const data = c.req.valid("form");

    // The version carries a unique index, so a duplicate is a constraint
    // violation rather than a silent second row. Caught here so the operator
    // gets a sentence instead of a 500.
    const [existing] = await c.var.db
      .select({ id: release.id })
      .from(release)
      .where(eq(release.version, data.version));

    if (existing) {
      return c.redirect(
        `/admin/releases?error=${encodeURIComponent(`Version ${data.version} already exists.`)}`,
      );
    }

    await c.var.db.insert(release).values({
      version: data.version,
      channel: data.channel,
      notes: data.notes || null,
      updatedAt: new Date().toISOString(),
    });

    flashToast(c, `Release ${data.version} created as a draft`);
    return c.redirect("/admin/releases");
  },
);

// ==========================================
// UPLOAD AN INSTALLER
// ==========================================
releasesRoute.post("/:id/assets", zValidator("form", assetFormSchema), async (c) => {
  const user = c.var.auth.user!;
  access.authorize(user, "releases", "update");

  const id = Number(c.req.param("id"));
  const target = await loadRelease(c.var.db, id);
  if (!target) return c.notFound();

  const { platform, arch } = c.req.valid("form");

  const body = await c.req.parseBody();
  const file = body.file;

  if (!(file instanceof File) || file.size === 0) {
    htmxToast(c, "Choose a file to upload", { type: "error" });
    return c.html(<ReleaseCard item={target} app={c.var.app} />, 422);
  }

  // Key includes the version and platform so the bucket is browsable by a
  // human, and a random suffix so re-uploading the same build twice cannot
  // silently overwrite bytes something is already serving.
  const key = `releases/${target.version}/${platform}-${arch}-${crypto.randomUUID().slice(0, 8)}-${file.name}`;

  /*
   * Read once, then hash and store the same bytes.
   *
   * The obvious clever version tees the file stream into Workers'
   * `crypto.DigestStream` so the bytes reach R2 and the hash at the same time,
   * with peak memory of one buffer. It buys nothing here: `parseBody()` above
   * has already materialised the entire upload in memory to produce this
   * `File`, so the buffer exists either way — and `DigestStream` is a workerd
   * global that does not exist under `vite dev`, which would make the one
   * admin action that matters impossible to exercise locally.
   *
   * The checksum is computed here rather than accepted from the form, because
   * a hash supplied by whoever supplied the file attests to nothing.
   */
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  const sha256 = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  await c.env.R2.put(key, bytes, {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });

  await c.var.db.insert(releaseAsset).values({
    releaseId: id,
    platform,
    arch,
    filename: file.name,
    r2Key: key,
    contentType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    sha256,
    updatedAt: new Date().toISOString(),
  });

  htmxToast(c, `${file.name} uploaded`);
  return c.html(<ReleaseCard item={(await loadRelease(c.var.db, id))!} app={c.var.app} />);
});

// ==========================================
// PUBLISH / UNPUBLISH
// ==========================================
const setPublished = async (c: any, publish: boolean) => {
  const user = c.var.auth.user!;
  access.authorize(user, "releases", "update");

  const id = Number(c.req.param("id"));
  const target = await loadRelease(c.var.db, id);
  if (!target) return c.notFound();

  if (publish && target.assets.length === 0) {
    htmxToast(c, "Attach at least one installer before publishing", { type: "error" });
    return c.html(<ReleaseCard item={target} app={c.var.app} />, 422);
  }

  await c.var.db
    .update(release)
    .set({
      publishedAt: publish ? new Date().toISOString() : null,
      publishedBy: publish ? user.id : null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(release.id, id));

  htmxToast(c, publish ? `${target.version} is live` : `${target.version} is back to a draft`);
  return c.html(<ReleaseCard item={(await loadRelease(c.var.db, id))!} app={c.var.app} />);
};

releasesRoute.post("/:id/publish", (c) => setPublished(c, true));
releasesRoute.post("/:id/unpublish", (c) => setPublished(c, false));

// ==========================================
// DELETE
// ==========================================

/**
 * A release is soft-deleted: it leaves the site, its rows and its R2 objects
 * stay. Someone who downloaded an installer last week and wants to check its
 * checksum should still be able to.
 */
releasesRoute.delete("/:id", async (c) => {
  access.authorize(c.var.auth.user!, "releases", "delete");

  const id = Number(c.req.param("id"));
  const target = await loadRelease(c.var.db, id);
  if (!target) return c.notFound();

  await c.var.db
    .update(release)
    .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(release.id, id));

  htmxToast(c, `${target.version} removed from the site`);
  return c.body(null, 200);
});

/**
 * An asset, by contrast, is really deleted — row and object together.
 *
 * The row is dropped first: an orphaned object costs storage, while a row
 * pointing at bytes that are gone is a download button that 503s.
 */
releasesRoute.delete("/assets/:assetId", async (c) => {
  access.authorize(c.var.auth.user!, "releases", "delete");

  const assetId = Number(c.req.param("assetId"));

  const [existing] = await c.var.db.select().from(releaseAsset).where(eq(releaseAsset.id, assetId));

  if (!existing) return c.notFound();

  await c.var.db.delete(releaseAsset).where(eq(releaseAsset.id, assetId));
  await c.env.R2.delete(existing.r2Key);

  htmxToast(c, `${existing.filename} deleted`);
  return c.body(null, 200);
});
