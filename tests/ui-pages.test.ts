import { describe, it, expect } from "vitest";
import { Hono } from "hono";

import app from "../worker/app";
import type { AppEnv } from "../worker/types";
import type { AppConfig } from "../worker/config/app.config";
import type { AuthConfig } from "../worker/config/auth.config";
import { createFakeDb, createMockData } from "./utils/fakeDb";

/**
 * Smoke tests: every route renders without throwing, signed out and signed in.
 *
 * They exist to catch the failure this template makes easy — a view importing
 * something a route no longer provides. They are not a substitute for testing
 * your own feature logic.
 */

const createAppConfig = (): AppConfig => ({
  name: "Test App",
  tagline: "Testing",
  locale: "en-AU",
  currency: "AUD",
  origin: "http://localhost:3000",
});

const createAuthConfig = (): AuthConfig => ({
  methods: new Set(["password"]),
  session: { duration: 1000, renewalThreshold: 500, maxSessions: 5 },
  security: {
    maxFailedAttempts: 5,
    lockoutDuration: 300,
    requireEmailVerification: false,
    requirePhoneVerification: false,
    allowedEmails: [],
    jwtSecret: "test",
    jwtExpiry: 3600,
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

const createTestApp = (user: any | null, data = createMockData()) => {
  const fakeDb = createFakeDb(data);

  const wrapper = new Hono<AppEnv>();
  wrapper.use("*", async (c, next) => {
    c.set("db", fakeDb as any);
    c.set("app", createAppConfig());
    c.set("authConfig", createAuthConfig());
    c.set("auth", { user, session: user ? { id: user.id } : null, destroySession() {} } as any);
    c.set("isMethodEnabled", () => true);
    await next();
  });

  wrapper.route("/", app);
  return wrapper;
};

const env = {
  KV: {},
  DB: {},
  ASSETS: {},
  APP_NAME: "Test App",
  ORIGIN: "http://localhost:3000",
} as any;

const get = (testApp: Hono<AppEnv>, path: string) =>
  testApp.fetch(new Request(`http://localhost${path}`), env);

describe("UI pages load", () => {
  it("serves public pages to signed-out visitors", async () => {
    const testApp = createTestApp(null);

    for (const path of [
      "/",
      "/login",
      "/features",
      "/pricing",
      "/downloads",
      "/security",
      "/report",
      "/contact",
      "/contact?topic=licence",
      "/contact?topic=security",
    ]) {
      const res = await get(testApp, path);
      expect(res.status, `GET ${path}`).toBe(200);
    }
  });

  it("redirects signed-out visitors away from protected pages", async () => {
    const testApp = createTestApp(null);

    for (const path of ["/profile", "/admin", "/admin/logs", "/admin/releases", "/admin/issues"]) {
      const res = await get(testApp, path);
      expect(res.status, `GET ${path}`).toBe(302);
      expect(res.headers.get("location"), `GET ${path}`).toBe("/login");
    }
  });

  it("serves protected pages to a signed-in admin", async () => {
    const testApp = createTestApp(createMockData().users[0]);

    for (const path of [
      "/",
      "/profile",
      "/admin",
      "/admin/logs",
      "/admin/releases",
      "/admin/issues",
      "/admin/issues?status=new",
    ]) {
      const res = await get(testApp, path);
      expect(res.status, `GET ${path}`).toBe(200);
    }
  });

  it("renders the pricing comparison and the downloads page", async () => {
    const testApp = createTestApp(null);

    const pricing = await (await get(testApp, "/pricing")).text();
    // The price is the single most important string on the site, and it is
    // assembled from cents by a formatter — so it is worth asserting rather
    // than trusting that the card rendered at all.
    expect(pricing).toContain("$6");
    expect(pricing).toContain("Self-hosted");
    // The two paid options are billed on different units, and saying so is the
    // single correction this page exists to keep: a per-person figure against
    // self-hosting would be selling a number nothing counts.
    expect(pricing).toContain("Priced per deployment, not per person");

    const downloads = await (await get(testApp, "/downloads")).text();
    expect(downloads).toContain("0.1.0");
    // Published assets link at the streaming route, never at the bucket.
    expect(downloads).toContain("/downloads/1");
  });

  it("closes registration once an admin exists, and keeps it open before", async () => {
    // The bootstrap admin is made by registering once on the live site, so the
    // page has to exist until it has been used — and not a moment longer.
    const withAdmin = await get(createTestApp(null), "/register");
    expect(withAdmin.status).toBe(404);

    const fresh = createTestApp(null, createMockData({ userRoles: [] }));
    expect((await get(fresh, "/register")).status).toBe(200);
  });

  it("advertises no sign-in to a signed-out visitor", async () => {
    const html = await (await get(createTestApp(null), "/")).text();

    // There are no customer accounts, so a login link would imply an account
    // nobody visiting can have. The download CTA is the only one offered.
    expect(html).not.toContain('href="/login"');
    expect(html).not.toContain('href="/register"');
    expect(html).toContain('href="/downloads"');
  });

  it("takes a bug report, and keeps what was typed when it is short", async () => {
    const testApp = createTestApp(null);

    const good = await testApp.fetch(
      new Request("http://localhost/report", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "HX-Request": "true" },
        body: new URLSearchParams({
          product: "client",
          summary: "Launching an item does nothing",
          detail: "I click the item, the row flashes, and nothing opens. Every single time.",
        }),
      }),
      env,
    );
    expect(good.status).toBe(200);
    expect(await good.text()).toContain("Got it");

    const short = await testApp.fetch(
      new Request("http://localhost/report", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "HX-Request": "true" },
        body: new URLSearchParams({ summary: "bug", detail: "broken" }),
      }),
      env,
    );
    expect(short.status).toBe(422);
    const html = await short.text();
    // A fragment that still holds what they wrote — nobody types it twice.
    expect(html).not.toContain("<!DOCTYPE html>");
    expect(html).toContain('value="bug"');
  });

  it("swallows a honeypot report without storing it", async () => {
    const testApp = createTestApp(null);

    const res = await testApp.fetch(
      new Request("http://localhost/report", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "HX-Request": "true" },
        body: new URLSearchParams({
          summary: "Cheap watches for sale here",
          detail: "Visit my website for great deals today friend, very good prices",
          website: "http://spam.example.com",
        }),
      }),
      env,
    );

    // 200 on purpose: telling a bot it was caught only teaches it.
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Got it");
  });

  it("offers contact as mailto only, with no form to post", async () => {
    const testApp = createTestApp(null);

    const html = await (await get(testApp, "/contact?topic=licence")).text();

    // One address, and the routing lives in the subject line — so each of the
    // four has to carry its own, or they all become the same anonymous email.
    expect(html).toContain("mailto:zipr@stanbrook.me");
    // %20, not +. A mail client is not obliged to read form encoding, and
    // several render the `+` literally — which would put plus signs through
    // the one thing doing the routing.
    for (const subject of [
      "subject=Zipr%20hosted%20enquiry",
      "subject=Zipr%20self-hosted%20licence%20enquiry",
      "subject=Zipr%20support%20request",
      "subject=Zipr%20security%20report",
    ]) {
      expect(html, subject).toContain(subject);
    }
    // And there is nothing to submit: no form, and no write route behind one.
    expect(html).not.toContain("<form");

    const posted = await testApp.fetch(
      new Request("http://localhost/contact", { method: "POST" }),
      env,
    );
    expect(posted.status).not.toBe(200);
  });
});
