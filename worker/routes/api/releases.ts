import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import type { AppEnv } from "@server/types";
import {
  ARCHITECTURES,
  EXPERIMENTAL_VERSION,
  PLATFORMS,
  release,
  releaseAsset,
  type SelectRelease,
} from "@server/schema/release.schema";
import { constantTimeEqual } from "@server/lib/crypto";

/**
 * The release pipeline's way in: experimental builds only.
 *
 * A build machine has no browser and no person to sign in, so it holds a
 * token instead — `RELEASE_TOKEN`, a Worker secret. What the token can do is
 * deliberately narrower than what an admin can:
 *
 * - it creates **experimental** releases, and only under a pre-release
 *   version (`0.2.0-experimental.14`), so it can never take a version number
 *   a stable release will want;
 * - it uploads installers to a release that is still a draft, and publishes
 *   it once they are all there;
 * - it never sees, changes or publishes a stable release, and cannot delete
 *   anything. Stable stays a person's act at /admin/releases.
 *
 *   PUT  /api/releases/:version                    create the draft (idempotent)
 *   PUT  /api/releases/:version/assets/:filename   one installer, as the raw body
 *   POST /api/releases/:version/publish            make it visible
 *   GET  /api/releases/:version                    what the site holds
 *
 * Installers are streamed: hashed and stored as they arrive, never held whole
 * in memory, because an AppImage alone is most of a Worker's 128 MB.
 */
export const apiReleases = new Hono<AppEnv>();

const requireReleaseToken = createMiddleware<AppEnv>(async (c, next) => {
  const expected = c.env.RELEASE_TOKEN;
  if (!expected) {
    return c.json({ error: "Release uploads are not configured on this site." }, 503);
  }
  const header = c.req.header("Authorization") ?? "";
  const presented = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  if (!presented || !constantTimeEqual(presented, expected)) {
    return c.json({ error: "That release token is not valid." }, 401);
  }
  return next();
});

apiReleases.use("*", requireReleaseToken);

/** The installer types a browser should be told about, by extension. */
const CONTENT_TYPES: Record<string, string> = {
  exe: "application/vnd.microsoft.portable-executable",
  msi: "application/x-msi",
  dmg: "application/x-apple-diskimage",
  deb: "application/vnd.debian.binary-package",
  rpm: "application/x-rpm",
  appimage: "application/vnd.appimage",
};

export const contentTypeFor = (filename: string) =>
  CONTENT_TYPES[filename.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";

/** A plain file name, as a bundler writes one: no path, nothing to escape. */
const FILENAME = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,199}$/;

const assetQuery = z.object({
  platform: z.enum(PLATFORMS),
  arch: z.enum(ARCHITECTURES).optional().default("x64"),
});

const createBody = z.object({ notes: z.string().max(10_000).optional() });

type Db = AppEnv["Variables"]["db"];

const findRelease = async (db: Db, version: string): Promise<SelectRelease | null> => {
  const [row] = await db.select().from(release).where(eq(release.version, version));
  return row ?? null;
};

/**
 * Why the pipeline may not write to this release, if it may not: anything
 * stable, removed or already published is not the pipeline's to change.
 */
const refusal = (row: SelectRelease): string | null => {
  if (row.channel === "stable") return `${row.version} is a stable release.`;
  if (row.deletedAt) return `${row.version} was removed from the site.`;
  if (row.publishedAt)
    return `${row.version} is already published, and a published build does not change.`;
  return null;
};

const describe = async (db: Db, row: SelectRelease) => {
  const assets = await db
    .select({
      id: releaseAsset.id,
      platform: releaseAsset.platform,
      arch: releaseAsset.arch,
      filename: releaseAsset.filename,
      sizeBytes: releaseAsset.sizeBytes,
      sha256: releaseAsset.sha256,
    })
    .from(releaseAsset)
    .where(eq(releaseAsset.releaseId, row.id));
  return {
    version: row.version,
    channel: row.channel,
    published: row.publishedAt !== null,
    publishedAt: row.publishedAt,
    assets,
  };
};

const toHex = (digest: ArrayBuffer) =>
  [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

type DigestStreamLike = WritableStream<ArrayBufferView> & { digest: Promise<ArrayBuffer> };

/**
 * Store a body in R2 under `key`, hashing it on the way through.
 *
 * In workerd the body is never held whole: each chunk goes to a SHA-256
 * `DigestStream` and on to R2 through a `FixedLengthStream`, which R2 needs to
 * know the length up front and which fails the put if the body is shorter or
 * longer than it claimed. Neither stream exists under `vite dev` or Node, so
 * there the body is read into memory instead — fine for a developer's test
 * file, and the only way the route can be exercised off Cloudflare at all.
 */
export const storeHashed = async (
  bucket: R2Bucket,
  key: string,
  body: ReadableStream<Uint8Array>,
  length: number,
  contentType: string,
): Promise<{ sha256: string; sizeBytes: number }> => {
  const DigestStream = (crypto as unknown as { DigestStream?: new (a: string) => DigestStreamLike })
    .DigestStream;
  const Fixed = (globalThis as unknown as { FixedLengthStream?: typeof FixedLengthStream })
    .FixedLengthStream;

  if (DigestStream && Fixed) {
    const digest = new DigestStream("SHA-256");
    const writer = digest.getWriter();
    let seen = 0;
    // Into the digest first, then on to R2, so a stream further down that
    // takes ownership of a chunk cannot pull it out from under the hash.
    const tap = new TransformStream<Uint8Array, Uint8Array>({
      async transform(chunk, controller) {
        seen += chunk.byteLength;
        await writer.write(chunk);
        controller.enqueue(chunk);
      },
      async flush() {
        await writer.close();
      },
    });
    const fixed = new Fixed(length);
    await Promise.all([
      bucket.put(key, fixed.readable, { httpMetadata: { contentType } }),
      body.pipeThrough(tap).pipeTo(fixed.writable),
    ]);
    return { sha256: toHex(await digest.digest), sizeBytes: seen };
  }

  const bytes = await new Response(body).arrayBuffer();
  if (bytes.byteLength !== length) {
    throw new Error(`the body was ${bytes.byteLength} bytes, not the ${length} it said`);
  }
  const sha256 = toHex(await crypto.subtle.digest("SHA-256", bytes));
  await bucket.put(key, bytes, { httpMetadata: { contentType } });
  return { sha256, sizeBytes: bytes.byteLength };
};

// ==========================================
// READ
// ==========================================
apiReleases.get("/:version", async (c) => {
  const row = await findRelease(c.var.db, c.req.param("version"));
  // A stable release is not the pipeline's to read about either.
  if (!row || row.channel === "stable") return c.json({ error: "No such release." }, 404);
  return c.json(await describe(c.var.db, row));
});

// ==========================================
// CREATE (idempotent)
// ==========================================
apiReleases.put("/:version", async (c) => {
  const version = c.req.param("version");
  if (!EXPERIMENTAL_VERSION.test(version)) {
    return c.json(
      {
        error:
          "An experimental build needs a pre-release version, such as 0.2.0-experimental.1, so it never takes a number a stable release will want.",
      },
      422,
    );
  }

  const parsed = createBody.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success)
    return c.json({ error: "Release notes are at most 10,000 characters." }, 422);
  const notes = parsed.data.notes?.trim() || null;

  const existing = await findRelease(c.var.db, version);
  if (existing) {
    const refused = refusal(existing);
    // Already published is not an error for a create: a re-run of a finished
    // pipeline finds the build it made. Uploading to it is refused below.
    if (
      refused &&
      !(existing.publishedAt && existing.channel !== "stable" && !existing.deletedAt)
    ) {
      return c.json({ error: refused }, 409);
    }
    if (notes !== null && !existing.publishedAt) {
      await c.var.db
        .update(release)
        .set({ notes, updatedAt: new Date().toISOString() })
        .where(eq(release.id, existing.id));
    }
    return c.json(await describe(c.var.db, (await findRelease(c.var.db, version))!), 200);
  }

  await c.var.db.insert(release).values({
    version,
    channel: "experimental",
    notes,
    updatedAt: new Date().toISOString(),
  });
  return c.json(await describe(c.var.db, (await findRelease(c.var.db, version))!), 201);
});

// ==========================================
// UPLOAD ONE INSTALLER
// ==========================================
apiReleases.put("/:version/assets/:filename", async (c) => {
  const row = await findRelease(c.var.db, c.req.param("version"));
  if (!row || row.channel === "stable") return c.json({ error: "No such release." }, 404);
  const refused = refusal(row);
  if (refused) return c.json({ error: refused }, 409);

  const filename = c.req.param("filename");
  if (!FILENAME.test(filename)) {
    return c.json({ error: "Use the installer's own file name, with no path." }, 422);
  }

  const query = assetQuery.safeParse(c.req.query());
  if (!query.success) {
    return c.json(
      {
        error: `Say which platform it is for: platform=${PLATFORMS.join("|")}, and arch=${ARCHITECTURES.join("|")}.`,
      },
      422,
    );
  }
  const { platform, arch } = query.data;

  const length = Number(c.req.header("Content-Length"));
  if (!Number.isSafeInteger(length) || length <= 0) {
    return c.json({ error: "Send the installer as the request body, with its length." }, 411);
  }
  const body = c.req.raw.body;
  if (!body) return c.json({ error: "Send the installer as the request body." }, 400);

  // A re-run of a failed job uploads the same file again: the new bytes
  // replace the old, row and object together, rather than sitting beside them.
  const [previous] = await c.var.db
    .select()
    .from(releaseAsset)
    .where(and(eq(releaseAsset.releaseId, row.id), eq(releaseAsset.filename, filename)));
  if (previous) {
    await c.var.db.delete(releaseAsset).where(eq(releaseAsset.id, previous.id));
    await c.env.R2.delete(previous.r2Key);
  }

  // As the admin form keys them: browsable by version, and a random part so
  // two uploads can never share an object.
  const key = `releases/${row.version}/${platform}-${arch}-${crypto.randomUUID().slice(0, 8)}-${filename}`;
  const contentType = contentTypeFor(filename);

  let stored: { sha256: string; sizeBytes: number };
  try {
    stored = await storeHashed(c.env.R2, key, body, length, contentType);
  } catch (err) {
    await c.env.R2.delete(key).catch(() => {});
    console.error(`[api/releases] upload of ${filename} failed: ${String(err)}`);
    return c.json({ error: "The upload did not arrive whole. Send it again." }, 400);
  }

  const [inserted] = await c.var.db
    .insert(releaseAsset)
    .values({
      releaseId: row.id,
      platform,
      arch,
      filename,
      r2Key: key,
      contentType,
      sizeBytes: stored.sizeBytes,
      sha256: stored.sha256,
      updatedAt: new Date().toISOString(),
    })
    .returning({ id: releaseAsset.id });

  return c.json(
    {
      id: inserted?.id,
      filename,
      platform,
      arch,
      sizeBytes: stored.sizeBytes,
      sha256: stored.sha256,
    },
    201,
  );
});

// ==========================================
// PUBLISH
// ==========================================
apiReleases.post("/:version/publish", async (c) => {
  const row = await findRelease(c.var.db, c.req.param("version"));
  if (!row || row.channel === "stable") return c.json({ error: "No such release." }, 404);
  if (row.publishedAt && !row.deletedAt) return c.json(await describe(c.var.db, row), 200);
  const refused = refusal(row);
  if (refused) return c.json({ error: refused }, 409);

  const state = await describe(c.var.db, row);
  if (state.assets.length === 0) {
    return c.json({ error: "Upload at least one installer before publishing." }, 409);
  }

  await c.var.db
    .update(release)
    .set({
      publishedAt: new Date().toISOString(),
      publishedBy: null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(release.id, row.id));

  return c.json(await describe(c.var.db, (await findRelease(c.var.db, row.version))!), 200);
});
