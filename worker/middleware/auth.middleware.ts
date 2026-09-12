// middleware/auth.middleware.ts
import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { Auth } from "../services/auth.service";
import type { AppEnv } from "../types";

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const authConfig = c.get("authConfig");
  const isMethodEnabled = c.get("isMethodEnabled");
  const db = c.get("db");

  // `undefined` because this site has no KV binding. Auth only reaches for it
  // on the passkey path, which AUTH_METHODS does not enable.
  const auth = new Auth(c, db, undefined, authConfig, isMethodEnabled);

  const token = getCookie(c, "auth_token");

  if (token) {
    await auth.validateSession(token);
  }

  c.set("auth", auth);
  await next();
});
