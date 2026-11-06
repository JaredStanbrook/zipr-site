import { sql } from "drizzle-orm";

import type { AppEnv } from "@server/types";
import {
  pageViewDaily,
  DIRECT_SOURCE,
  INTERNAL_SOURCE,
  type Device,
} from "@server/schema/analytics.schema";

type Db = AppEnv["Variables"]["db"];

export interface PageView {
  day: string;
  path: string;
  source: string;
  country: string;
  device: Device;
}

/** Pages that are staff tools, auth forms or machinery rather than the product. */
const SKIP_PREFIXES = ["/admin", "/dev", "/api", "/login", "/register", "/profile", "/static"];

const BOT = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|curl|wget|python/i;

export const shouldCount = (path: string, userAgent: string) =>
  !SKIP_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`)) && !BOT.test(userAgent);

export const deviceFrom = (userAgent: string): Device =>
  /iPad|Tablet/i.test(userAgent)
    ? "tablet"
    : /Mobi|Android/i.test(userAgent)
      ? "mobile"
      : "desktop";

/**
 * Where the view came from, reduced to a campaign tag or a bare host.
 *
 * `utm_source` wins so links you hand out (`?utm_source=linkedin`) are
 * attributed even when the referrer is stripped. The full referrer URL is
 * never kept: its path and query can carry someone's search or account.
 */
export const sourceFrom = (url: URL, referer: string | undefined): string => {
  const tag = url.searchParams.get("utm_source")?.trim().toLowerCase();
  if (tag) return tag.slice(0, 40);
  if (!referer) return DIRECT_SOURCE;
  try {
    const host = new URL(referer).hostname.replace(/^www\./, "");
    return host === url.hostname.replace(/^www\./, "") ? INTERNAL_SOURCE : host.slice(0, 80);
  } catch {
    return DIRECT_SOURCE;
  }
};

/** Add one to the day's counter for this combination. */
export const recordPageView = (db: Db, view: PageView) =>
  db
    .insert(pageViewDaily)
    .values({ ...view, views: 1 })
    .onConflictDoUpdate({
      target: [
        pageViewDaily.day,
        pageViewDaily.path,
        pageViewDaily.source,
        pageViewDaily.country,
        pageViewDaily.device,
      ],
      set: { views: sql`${pageViewDaily.views} + 1` },
    });
