import { createMiddleware } from "hono/factory";

import type { AppEnv } from "../types";
import { today } from "@server/lib/dates";
import {
  deviceFrom,
  recordPageView,
  shouldCount,
  sourceFrom,
} from "@server/services/analytics.service";

/**
 * Count a page view after it has been served. Cookieless: it reads the request
 * headers it is sent anyway and stores only the aggregate counter, so it needs
 * no consent. See worker/schema/analytics.schema.ts.
 *
 * Counted: a GET that returned an HTML page with 200, including hx-boost
 * navigations. Not counted: HTMX fragments, staff pages, bots, and signed-in
 * admins (you looking at your own site is not a visitor).
 */
export const countPageViews = createMiddleware<AppEnv>(async (c, next) => {
  await next();

  if (c.req.method !== "GET" || c.res.status !== 200) return;
  if (!(c.res.headers.get("Content-Type") ?? "").includes("text/html")) return;
  if (c.req.header("HX-Request") && !c.req.header("HX-Boosted")) return;
  if (c.var.auth?.user?.roles.includes("admin")) return;

  const userAgent = c.req.header("User-Agent") ?? "";
  if (!shouldCount(c.req.path, userAgent)) return;

  const url = new URL(c.req.url);
  const write = Promise.resolve()
    .then(() =>
      recordPageView(c.var.db, {
        day: today(c.var.app.timezone),
        path: c.req.path,
        source: sourceFrom(url, c.req.header("Referer")),
        country: ((c.req.raw as any).cf?.country as string | undefined) ?? "XX",
        device: deviceFrom(userAgent),
      }),
    )
    .catch((err: unknown) => console.warn(`[analytics] not recorded: ${String(err)}`));

  // After the response, so a slow write never delays a page. Tests and some
  // dev setups have no execution context; there the write is simply awaited.
  try {
    c.executionCtx.waitUntil(write);
  } catch {
    await write;
  }
});
