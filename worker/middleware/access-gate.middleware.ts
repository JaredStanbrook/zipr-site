import { createMiddleware } from "hono/factory";
import { deleteCookie, getCookie } from "hono/cookie";

import type { AppEnv } from "../types";
import { htmxRedirect } from "@server/lib/htmx-helpers";
import { ACCESS_COOKIE, isGateEnabled, liveLink } from "@server/services/access-gate.service";

const OPEN_PREFIXES = ["/api/", "/static/", "/fonts/"];

/**
 * Lock the public site to invited visitors while ACCESS_GATE is "true".
 *
 * Mounted in app.tsx after sign-in, admin and the link routes, so those stay
 * reachable without a link. A signed-in admin sees everything. Anyone else
 * needs a live `site_access` cookie, which only `/a/:token` hands out.
 */
export const accessGate = createMiddleware<AppEnv>(async (c, next) => {
  if (!isGateEnabled(c.env)) return next();
  if (c.var.auth.user?.roles.includes("admin")) return next();

  // The JSON API has its own auth. Only the files the "nothing to see here"
  // page itself needs stay open; screenshots, media, the share image and the
  // translation catalogues are gated like the pages. Keep this in step with
  // `run_worker_first` in wrangler.jsonc.
  const path = c.req.path;
  if (OPEN_PREFIXES.some((prefix) => path.startsWith(prefix)) || path === "/favicon.svg") {
    return next();
  }

  const token = getCookie(c, ACCESS_COOKIE);
  if (token && (await liveLink(c.var.db, token))) {
    c.set("accessGranted", true);
    return next();
  }

  if (token) deleteCookie(c, ACCESS_COOKIE, { path: "/" });
  if (c.req.header("HX-Request")) return htmxRedirect(c, "/gone");
  return c.redirect("/gone");
});
