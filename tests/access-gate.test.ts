import { describe, it, expect, beforeEach } from "vitest";
import { Hono } from "hono";

import app from "../worker/app";
import type { AppEnv } from "../worker/types";
import { accessLink } from "../worker/schema/access.schema";
import { openLink, linkState } from "../worker/services/access-gate.service";
import { createRealDb } from "./utils/realDb";
import { createAppConfig, createAuthConfig } from "./utils/testApp";

/**
 * The access gate, against a real database: every claim here is about which
 * row a `where` matched, which the fake db cannot answer.
 */

const HOUR = 3_600_000;
let db: any;

const makeApp = (user: any = null) => {
  const wrapper = new Hono<AppEnv>();
  wrapper.use("*", async (c, next) => {
    c.set("db", db);
    c.set("app", createAppConfig());
    c.set("authConfig", createAuthConfig());
    c.set("auth", { user, isRegistrationOpen: async () => false } as any);
    c.set("isMethodEnabled", () => true);
    await next();
  });
  wrapper.route("/", app);
  return wrapper;
};

const fetchAs = (path: string, { gate = "true", cookie = "", user = null as any } = {}) =>
  makeApp(user).fetch(new Request(`http://localhost${path}`, { headers: { cookie } }), {
    ASSETS: {},
    ACCESS_GATE: gate,
  } as any);

const addLink = async (token: string, over: Record<string, unknown> = {}) =>
  db
    .insert(accessLink)
    .values({ token, label: "Alex", durationHours: 24, updatedAt: "x", ...over });

beforeEach(() => {
  db = createRealDb().db;
});

describe("access links", () => {
  it("starts the clock on first visit, not on creation, and never restarts it", async () => {
    await addLink("tok");
    const [created] = await db.select().from(accessLink);
    expect(linkState(created)).toBe("unused");

    const first = new Date("2026-01-01T00:00:00Z");
    const opened = await openLink(db, "tok", first);
    expect(opened!.firstVisitedAt).toBe(first.toISOString());
    expect(opened!.expiresAt).toBe(new Date(first.getTime() + 24 * HOUR).toISOString());
    expect(linkState(opened!, new Date(first.getTime() + HOUR))).toBe("active");

    const again = await openLink(db, "tok", new Date(first.getTime() + 2 * HOUR));
    expect(again!.expiresAt).toBe(opened!.expiresAt);
    expect(linkState(again!, new Date(first.getTime() + 25 * HOUR))).toBe("expired");
  });

  it("does not start a revoked link", async () => {
    await addLink("tok", { revokedAt: "2026-01-01T00:00:00Z" });
    const link = await openLink(db, "tok");
    expect(link!.firstVisitedAt).toBeNull();
    expect(linkState(link!)).toBe("revoked");
  });
});

describe("the gate", () => {
  it("sends a visitor without a link to /gone", async () => {
    const res = await fetchAs("/pricing");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/gone");
    expect((await fetchAs("/gone")).status).toBe(200);
  });

  it("lets a visitor in through a link, and out again once it expires", async () => {
    await addLink("good");
    const open = await fetchAs("/a/good");
    expect(open.headers.get("location")).toBe("/");
    const cookie = open.headers.get("set-cookie")!.split(";")[0];
    expect(cookie).toBe("site_access=good");

    expect((await fetchAs("/pricing", { cookie })).status).toBe(200);

    await db.update(accessLink).set({ expiresAt: "2000-01-01T00:00:00.000Z" });
    const expired = await fetchAs("/pricing", { cookie });
    expect(expired.headers.get("location")).toBe("/gone");
    expect((await fetchAs("/a/good")).headers.get("location")).toBe("/gone");
  });

  it("refuses an unknown or revoked token", async () => {
    expect((await fetchAs("/a/nope")).headers.get("location")).toBe("/gone");
    await addLink("rev", { revokedAt: "2026-01-01T00:00:00Z" });
    expect((await fetchAs("/a/rev")).headers.get("location")).toBe("/gone");
    expect((await fetchAs("/", { cookie: "site_access=rev" })).headers.get("location")).toBe(
      "/gone",
    );
  });

  it("lets an admin see everything, and keeps sign-in reachable", async () => {
    const admin = { id: "u1", roles: ["admin"], permissions: [] };
    expect((await fetchAs("/pricing", { user: admin })).status).toBe(200);
    expect((await fetchAs("/login")).status).toBe(200);
  });

  it("gates files in public/, but not what the locked page needs", async () => {
    for (const path of ["/screenshots/home.png", "/og.png", "/media/hero.mp4", "/i18n/de.json"]) {
      expect((await fetchAs(path)).headers.get("location"), path).toBe("/gone");
    }
    for (const path of ["/static/main.css", "/fonts/inter-latin.woff2", "/favicon.svg"]) {
      expect((await fetchAs(path)).headers.get("location"), path).toBeNull();
    }
  });

  it("asks crawlers to stay out and lists no pages while locked", async () => {
    const robots = await (await fetchAs("/robots.txt")).text();
    expect(robots).toContain("Disallow: /\n");
    expect(robots).not.toContain("Sitemap:");
    expect((await fetchAs("/sitemap.xml")).status).toBe(404);
  });

  it("sends public/ through the worker, except what the gate leaves open", async () => {
    const { readFileSync } = await import("node:fs");
    expect(readFileSync("wrangler.jsonc", "utf8")).toContain(
      '"run_worker_first": ["/*", "!/static/*", "!/fonts/*", "!/favicon.svg"]',
    );
  });

  it('is open when ACCESS_GATE is not "true"', async () => {
    expect((await fetchAs("/pricing", { gate: "false" })).status).toBe(200);
    expect((await fetchAs("/sitemap.xml", { gate: "false" })).status).toBe(200);
  });
});
