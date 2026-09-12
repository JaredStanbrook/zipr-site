// worker/schema/release.schema.ts
//
// What the Downloads page serves. A release is a version of the desktop
// client; a release asset is one installer file for one platform, stored in
// R2 and streamed back through the worker so the count is real and the bucket
// stays private.

import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

import { users } from "./auth.schema";
import { timestampColumns } from "./common";

/**
 * The platforms the client is built for.
 *
 * `linux` is here although the client's Tauri config names only `nsis`, `app`
 * and `dmg` under `bundle.targets` — so no Linux installer is produced today
 * and the Downloads page says "build from source" for it. The value exists so
 * that shipping one later is an upload rather than a migration.
 */
export const PLATFORMS = ["windows", "macos", "linux"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const ARCHITECTURES = ["x64", "arm64", "universal"] as const;
export type Architecture = (typeof ARCHITECTURES)[number];

export const CHANNELS = ["stable", "beta"] as const;
export type Channel = (typeof CHANNELS)[number];

export const release = sqliteTable(
  "release",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Semver, without a leading `v`. Matches the Tauri bundle version. */
    version: text("version").notNull(),
    channel: text("channel", { enum: CHANNELS }).default("stable").notNull(),
    /** Free text shown under the version on the downloads page. */
    notes: text("notes"),
    /**
     * Null means draft: uploaded, checksummed, and invisible to the public.
     * Publishing is a separate act from uploading so a half-populated release
     * never appears with two of its four installers.
     */
    publishedAt: text("published_at"),
    /**
     * Who published it. `set null` rather than a cascade — a release must
     * outlive the account that pushed it.
     */
    publishedBy: text("published_by").references(() => users.id, { onDelete: "set null" }),
    deletedAt: text("deleted_at"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("release_version_idx").on(table.version),
    index("release_published_idx").on(table.publishedAt),
  ],
);

export const releaseAsset = sqliteTable(
  "release_asset",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    releaseId: integer("release_id")
      .references(() => release.id, { onDelete: "cascade" })
      .notNull(),
    platform: text("platform", { enum: PLATFORMS }).notNull(),
    arch: text("arch", { enum: ARCHITECTURES }).default("x64").notNull(),
    /** The name the file is offered to the browser under. */
    filename: text("filename").notNull(),
    /** Object key in the R2 bucket. Unique, so two rows can never share bytes. */
    r2Key: text("r2_key").notNull(),
    contentType: text("content_type").default("application/octet-stream").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    /**
     * Hex SHA-256, computed by the worker as the upload streams past — never
     * taken from the uploader, or it attests to nothing.
     */
    sha256: text("sha256"),
    downloadCount: integer("download_count").default(0).notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("release_asset_key_idx").on(table.r2Key),
    index("release_asset_release_idx").on(table.releaseId),
  ],
);

export const releaseRelations = relations(release, ({ many, one }) => ({
  assets: many(releaseAsset),
  publisher: one(users, {
    fields: [release.publishedBy],
    references: [users.id],
  }),
}));

export const releaseAssetRelations = relations(releaseAsset, ({ one }) => ({
  release: one(release, {
    fields: [releaseAsset.releaseId],
    references: [release.id],
  }),
}));

// ==========================================
// VALIDATION
// ==========================================

export const insertReleaseSchema = createInsertSchema(release);
export const selectReleaseSchema = createSelectSchema(release);
export const selectReleaseAssetSchema = createSelectSchema(releaseAsset);

/** What the admin "new release" form posts. */
export const releaseFormSchema = z.object({
  version: z
    .string()
    .trim()
    .min(1, "Version is required")
    .max(40)
    .regex(/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/, "Use a semver like 1.2.0 or 1.2.0-beta.1"),
  channel: z.enum(CHANNELS).optional().default("stable"),
  notes: z.string().max(10_000).optional().default(""),
});

/**
 * The upload form. The file itself is validated in the route rather than here
 * — Zod can assert it is a `File`, but not that the body actually arrived, and
 * the route needs the stream to hash it anyway.
 */
export const assetFormSchema = z.object({
  platform: z.enum(PLATFORMS),
  arch: z.enum(ARCHITECTURES).optional().default("x64"),
});

// ==========================================
// TYPES
// ==========================================

export type SelectRelease = z.infer<typeof selectReleaseSchema>;
export type SelectReleaseAsset = z.infer<typeof selectReleaseAssetSchema>;
export type ReleaseForm = z.infer<typeof releaseFormSchema>;
export type AssetForm = z.infer<typeof assetFormSchema>;

/** A release with its installers attached, which is how every view wants it. */
export type ReleaseWithAssets = SelectRelease & { assets: SelectReleaseAsset[] };
