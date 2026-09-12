import { Hono } from "hono";

import type { AppEnv } from "@server/types";
import { robotsTxt, sitemapXml, type SitemapEntry } from "@server/lib/seo";

export const seoRoute = new Hono<AppEnv>();

/**
 * The pages a crawler should know about.
 *
 * Add a route here when you add a public page. Anything behind `requireUser`
 * does not belong — a crawler cannot reach it, and listing it just produces
 * redirects in Search Console.
 *
 * For content that lives in the database (published posts, public profiles),
 * query it in the handler below and concatenate. Keep the list under ~50,000
 * URLs; past that, sitemaps have to be split and indexed.
 */
const STATIC_ROUTES: SitemapEntry[] = [
  { loc: "/", changefreq: "weekly", priority: 1.0 },
  { loc: "/features", changefreq: "monthly", priority: 0.8 },
  { loc: "/pricing", changefreq: "monthly", priority: 0.9 },
  { loc: "/downloads", changefreq: "weekly", priority: 0.9 },
  { loc: "/docs", changefreq: "monthly", priority: 0.7 },
  { loc: "/contact", changefreq: "yearly", priority: 0.5 },
];

seoRoute.get("/robots.txt", (c) =>
  c.text(robotsTxt(c.var.app, c.env.ENVIRONMENT), 200, {
    // Crawlers re-fetch this often; a day of caching is plenty and keeps the
    // Worker off the critical path for something that rarely changes.
    "Cache-Control": "public, max-age=86400",
  }),
);

seoRoute.get("/sitemap.xml", async (c) => {
  const entries: SitemapEntry[] = [...STATIC_ROUTES];

  // Releases are deliberately absent. Every published one is already reachable
  // from /downloads, and an installer is a file rather than a page — listing
  // per-asset URLs would ask a crawler to fetch several hundred megabytes to
  // learn nothing it cannot read off the downloads page.

  return c.body(sitemapXml(entries, c.var.app), 200, {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});
