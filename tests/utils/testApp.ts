import { Hono } from "hono";

import app from "../../worker/app";
import type { AppEnv } from "../../worker/types";
import type { AppConfig } from "../../worker/config/app.config";
import type { AuthConfig } from "../../worker/config/auth.config";
import { createFakeDb, createMockData } from "./fakeDb";

/**
 * The worker, mounted over a fake database and a fixed config, for tests that
 * render real pages. Shared by the page smoke tests and the translation tests,
 * which both need "what does this URL actually return".
 */

export const createAppConfig = (): AppConfig => ({
  name: "Test App",
  tagline: "Testing",
  locale: "en-AU",
  currency: "AUD",
  timezone: "UTC",
  origin: "http://localhost:3000",
});

export const createAuthConfig = (methods: string[] = ["password"]): AuthConfig => ({
  methods: new Set(methods as any),
  session: { duration: 1000, renewalThreshold: 500, maxSessions: 5 },
  security: {
    maxFailedAttempts: 5,
    lockoutDuration: 300,
    requireEmailVerification: false,
    requirePhoneVerification: false,
    allowedEmails: [],
    jwtSecret: "test",
    jwtExpiry: 3600,
    hashIterations: 1000,
  },
  roles: {
    available: ["user", "admin"],
    default: "user",
    restricted: ["admin"],
    inherent: {},
  },
  permissions: { available: [] },
  password: {
    minLength: 8,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
  },
});

/**
 * `methods` is worth varying: the auth pages hide their tab strip entirely
 * when only one method is enabled, so a single-method config never renders
 * roughly half of those screens.
 */
export const createTestApp = (
  user: any | null,
  methods?: string[],
  data = createMockData(),
  registrationOpen = true,
  config: AppConfig = createAppConfig(),
) => {
  const fakeDb = createFakeDb(data);

  const wrapper = new Hono<AppEnv>();
  wrapper.use("*", async (c, next) => {
    c.set("db", fakeDb as any);
    c.set("app", config);
    c.set("authConfig", createAuthConfig(methods));
    c.set("auth", {
      user,
      session: user ? { id: user.id } : null,
      destroySession() {},
      isRegistrationOpen: async () => registrationOpen,
    } as any);
    c.set("isMethodEnabled", () => true);
    await next();
  });

  wrapper.route("/", app);
  return wrapper;
};

export const env = {
  KV: {},
  DB: {},
  ASSETS: {},
  APP_NAME: "Test App",
  ORIGIN: "http://localhost:3000",
} as any;

export const get = (testApp: Hono<AppEnv>, path: string) =>
  testApp.fetch(new Request(`http://localhost${path}`), env);
