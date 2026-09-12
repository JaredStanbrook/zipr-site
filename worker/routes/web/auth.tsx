// worker/routes/web/auth.ts
import { Hono } from "hono";
import { eq } from "drizzle-orm";

import { userRoles } from "@server/schema/roles.schema";
import { Login } from "@server/views/pages/Login";
import { Register } from "@server/views/pages/Register";
import type { AppEnv } from "../../types";
import { flashToast, htmxRedirect } from "@server/lib/htmx-helpers";

export const webAuth = new Hono<AppEnv>();

/**
 * Registration exists for exactly one purpose and closes behind itself.
 *
 * This site has no customer accounts. The only account it ever needs is the
 * first admin, and `BOOTSTRAP_ADMIN_EMAIL` is how that one gets made without a
 * terminal — by registering, once, on the live site. The moment an admin
 * exists the bootstrap disarms itself, and so does this page: leaving a public
 * sign-up form standing for the rest of the site's life, guarded only by an
 * email allowlist somebody has to remember to set, is a worse trade than a
 * 404.
 *
 * Further accounts are made with `npm run create-admin:remote`.
 */
webAuth.get("/register", async (c) => {
  const { auth, authConfig } = c.var;
  if (auth.user) return c.redirect("/admin");

  const [existingAdmin] = await c.var.db
    .select({ id: userRoles.id })
    .from(userRoles)
    .where(eq(userRoles.role, "admin"))
    .limit(1);

  if (existingAdmin) return c.notFound();

  const props = {
    methods: Array.from(authConfig.methods),
    roles: authConfig.roles?.available || ["user"],
    defaultRole: authConfig.roles?.default || "user",
  };
  return c.render(<Register {...props} />, {
    title: "Create Account",
  });
});

webAuth.get("/login", (c) => {
  const { auth, authConfig } = c.var;
  if (auth.user) return c.redirect("/admin");

  const props = {
    methods: Array.from(authConfig.methods),
  };
  return c.render(<Login {...props} />, {
    title: "Sign In",
  });
});
webAuth.post("/web/auth/logout", async (c) => {
  // 1. Clear Cookies/Session
  const { auth } = c.var;
  auth.destroySession();

  flashToast(c, "Logged out successfully", {
    type: "success",
  });
  htmxRedirect(c, "/");
  return c.body(null);
});
