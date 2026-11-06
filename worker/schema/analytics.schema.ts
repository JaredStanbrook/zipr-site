// worker/schema/analytics.schema.ts
//
// Cookieless page-view counts. One row per (day, page, source, country,
// device), with a counter. Nothing in a row can tell one visitor from another:
// no IP, no user agent string, no cookie, no ID. That is what keeps this out of
// consent territory — and it is also why there is no "unique visitors" figure.

import { sqliteTable, text, integer, primaryKey, index } from "drizzle-orm/sqlite-core";

/** Referrer value for a view that came from another page on this site. */
export const INTERNAL_SOURCE = "(internal)";
/** Referrer value for a view with no referrer: typed, bookmarked, or an app. */
export const DIRECT_SOURCE = "(direct)";

export const DEVICES = ["desktop", "mobile", "tablet"] as const;
export type Device = (typeof DEVICES)[number];

export const pageViewDaily = sqliteTable(
  "page_view_daily",
  {
    /** YYYY-MM-DD in APP_TIMEZONE. */
    day: text("day").notNull(),
    /** Path only. The query string is dropped so nothing typed into a URL is kept. */
    path: text("path").notNull(),
    /** `utm_source`, else the referring host, else DIRECT_SOURCE / INTERNAL_SOURCE. */
    source: text("source").notNull(),
    /** ISO 3166 alpha-2 from Cloudflare, or "XX" when unknown. */
    country: text("country").notNull(),
    device: text("device", { enum: DEVICES }).notNull(),
    views: integer("views").default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.day, table.path, table.source, table.country, table.device] }),
    index("page_view_daily_day_idx").on(table.day),
  ],
);

export type PageViewDaily = typeof pageViewDaily.$inferSelect;
