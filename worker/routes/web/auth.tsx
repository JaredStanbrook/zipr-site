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

  // With SINGLE_ACCOUNT on, the form only exists until the owner has signed
  // up. The API refuses regardless; this just avoids offering a form that
  // cannot succeed.
  if (!(await auth.isRegistrationOpen())) return c.redirect("/login");

  const props = {
    methods: Array.from(authConfig.methods),
    // A restricted role would only be refused on submit, so do not offer it.
    roles: (authConfig.roles?.available || ["user"]).filter(
      (role) => !(authConfig.roles?.restricted || []).includes(role),
    ),
    defaultRole: authConfig.roles?.default || "user",
    // The form should state the rule it will be judged by. Without this the
    // page advertised a minimum of 8 while the server enforced whatever
    // PASSWORD_MIN_LENGTH said, so the only way to learn the real rule was to
    // be rejected by it.
    passwordPolicy: authConfig.password,
  };
  return c.render(<Register {...props} />, {
    title: "Create Account",
  });
});

webAuth.get("/login", async (c) => {
  const { auth, authConfig } = c.var;
  if (auth.user) return c.redirect("/admin");

  const props = {
    methods: Array.from(authConfig.methods),
    registrationOpen: await auth.isRegistrationOpen(),
  };
  return c.render(<Login {...props} />, {
    title: "Sign In",
  });
});
webAuth.post("/web/auth/logout", async (c) => {
  // 1. Clear Cookies/Session
  const { auth } = c.var;
  // Awaited: this revokes the session row, and an un-awaited promise can be
  // dropped when the response goes out — leaving a "logged out" user whose
  // token still works.
  await auth.destroySession();

  flashToast(c, "Logged out successfully", {
    type: "success",
  });
  htmxRedirect(c, "/");
  return c.body(null);
});
