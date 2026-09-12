import { Hono } from "hono";

import { globalRenderer } from "./middleware/renderer.middleware.tsx";
import { requireUser, requireRole } from "./middleware/guard.middleware.ts";

import { ProfilePage } from "./views/pages/Profile";
import type { SafeUser } from "./schema/auth.schema.ts";

import { apiAuth } from "./routes/api/auth";
import { webAuth } from "./routes/web/auth";
import { logsRoute } from "./routes/admin/logs";
import { releasesRoute } from "./routes/admin/releases.tsx";
import { siteRoute } from "./routes/site.tsx";
import { seoRoute } from "./routes/seo";
import devRouter from "./routes/dev.tsx";

import type { AppEnv } from "./types";

// ==========================================
// 1. ADMIN SUB-APP (RBAC protected)
// ==========================================
// Everything mounted here is admin-only. Add feature routers below rather
// than re-declaring the role check on each one.
const admin = new Hono<AppEnv>();
admin.use("*", requireRole("admin"));
admin.route("/logs", logsRoute);
admin.route("/releases", releasesRoute);

// ==========================================
// 2. MAIN APP
// ==========================================
const app = new Hono<AppEnv>()
  // robots.txt and sitemap.xml. Before the renderer, since neither is HTML.
  .route("/", seoRoute)

  // Database inspector. Dev-only — see routes/dev.tsx.
  .route("/dev", devRouter)

  // Global renderer (wraps SSR responses in Layout).
  .use("*", globalRenderer)

  .route("/admin", admin)

  // Sign in, register, sign out.
  .route("/", webAuth)

  // Every public page: home, features, downloads, pricing, docs, contact.
  // Mounted last of the "/" routers so its catch-all-shaped paths cannot
  // shadow an auth route.
  .route("/", siteRoute)

  // Any signed-in user can view their own profile.
  .get("/profile", requireUser, (c) => {
    const { auth } = c.var;

    // requireUser guarantees auth.user exists.
    const props = {
      user: auth.user as SafeUser,
      config: c.var.authConfig,
    };
    return c.render(<ProfilePage {...props} />, {
      title: "Profile",
    });
  })

  // ==========================================
  // 3. JSON API
  // ==========================================
  .basePath("/api")
  .route("/auth", apiAuth);

export type AppType = typeof app;
export default app;
