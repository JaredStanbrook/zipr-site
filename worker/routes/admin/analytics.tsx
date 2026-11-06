import { Hono } from "hono";
import { and, desc, gte, ne, sql } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import type { AppEnv } from "@server/types";
import { pageViewDaily, INTERNAL_SOURCE } from "@server/schema/analytics.schema";
import { releaseAsset } from "@server/schema/release.schema";
import { AccessControl } from "@server/services/access.service";
import { addDays, today } from "@server/lib/dates";
import { AnalyticsPage, RANGES } from "@views/admin/Analytics";

/** Cookieless traffic counts. Mounted under the admin sub-app. */
export const analyticsRoute = new Hono<AppEnv>();

const access = new AccessControl();

const rangeSchema = z.object({
  days: z.coerce
    .number()
    .refine((n) => RANGES.includes(n as (typeof RANGES)[number]))
    .optional()
    .default(30)
    .catch(30),
});

analyticsRoute.get("/", zValidator("query", rangeSchema), async (c) => {
  access.authorize(c.var.auth.user!, "analytics", "read");

  const { days } = c.req.valid("query");
  const end = today(c.var.app.timezone);
  const start = addDays(end, -(days - 1));
  const inRange = gte(pageViewDaily.day, start);
  const views = sql<number>`sum(${pageViewDaily.views})`;
  const db = c.var.db;

  // Each breakdown is its own small grouped query; at this table's size that is
  // cheaper and clearer than one wide query split up in JavaScript.
  const top = (column: SQLiteColumn, limit: number, external = false) =>
    db
      .select({ key: column, views })
      .from(pageViewDaily)
      .where(external ? and(inRange, ne(pageViewDaily.source, INTERNAL_SOURCE)) : inRange)
      .groupBy(column)
      .orderBy(desc(views))
      .limit(limit);

  const [daily, [totals], pages, sources, countries, devices, downloads] = await Promise.all([
    db
      .select({ day: pageViewDaily.day, views })
      .from(pageViewDaily)
      .where(inRange)
      .groupBy(pageViewDaily.day),
    db
      .select({
        views,
        entries: sql<number>`sum(case when ${pageViewDaily.source} != ${INTERNAL_SOURCE} then ${pageViewDaily.views} else 0 end)`,
      })
      .from(pageViewDaily)
      .where(inRange),
    top(pageViewDaily.path, 15),
    top(pageViewDaily.source, 15, true),
    top(pageViewDaily.country, 10),
    top(pageViewDaily.device, 3),
    db
      .select({
        key: releaseAsset.platform,
        views: sql<number>`sum(${releaseAsset.downloadCount})`,
      })
      .from(releaseAsset)
      .groupBy(releaseAsset.platform)
      .orderBy(desc(sql`sum(${releaseAsset.downloadCount})`)),
  ]);

  // Every day in the range, zeros included, so a quiet day reads as a gap.
  const byDay = new Map(daily.map((row) => [row.day, Number(row.views)]));
  const series = Array.from({ length: days }, (_, i) => {
    const day = addDays(start, i);
    return { day, views: byDay.get(day) ?? 0 };
  });

  const rows = (list: { key: string; views: number }[]) =>
    list.map((row) => ({ key: row.key, views: Number(row.views) }));

  return c.render(
    <AnalyticsPage
      app={c.var.app}
      days={days}
      series={series}
      totalViews={Number(totals?.views ?? 0)}
      entries={Number(totals?.entries ?? 0)}
      pages={rows(pages)}
      sources={rows(sources)}
      countries={rows(countries)}
      devices={rows(devices)}
      downloads={rows(downloads)}
    />,
    { title: "Analytics" },
  );
});
