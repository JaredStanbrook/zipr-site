import { describe, it, expect, beforeEach } from "vitest";
import { Hono } from "hono";

import app from "../worker/app";
import type { AppEnv } from "../worker/types";
import { pageViewDaily, INTERNAL_SOURCE, DIRECT_SOURCE } from "../worker/schema/analytics.schema";
import { deviceFrom, shouldCount, sourceFrom } from "../worker/services/analytics.service";
import { createRealDb } from "./utils/realDb";
import { createAppConfig, createAuthConfig } from "./utils/testApp";

/** Cookieless page-view counts, against a real database. */

const PHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148";
const DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0";
let db: any;

const visit = (path: string, headers: Record<string, string> = {}, user: any = null) => {
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
  return wrapper.fetch(
    new Request(`http://localhost${path}`, { headers: { "User-Agent": DESKTOP, ...headers } }),
    { ASSETS: {} } as any,
  );
};

const rows = () => db.select().from(pageViewDaily);

beforeEach(() => {
  db = createRealDb().db;
});

describe("page-view counting", () => {
  it("adds to one daily counter per page, source, country and device", async () => {
    await visit("/pricing", { Referer: "https://www.google.com/search?q=zipr" });
    await visit("/pricing", { Referer: "https://google.com/" });
    await visit("/pricing", { "User-Agent": PHONE });

    const all = await rows();
    expect(all).toHaveLength(2);
    const google = all.find((r: any) => r.source === "google.com");
    expect(google).toMatchObject({ path: "/pricing", device: "desktop", country: "XX", views: 2 });
    expect(all.find((r: any) => r.device === "mobile")).toMatchObject({
      source: DIRECT_SOURCE,
      views: 1,
    });
  });

  it("stores nothing that identifies a visitor", async () => {
    await visit("/pricing?email=a@b.com", { "CF-Connecting-IP": "203.0.113.9" });
    const [row] = await rows();
    expect(Object.keys(row).sort()).toEqual(
      ["country", "day", "device", "path", "source", "views"].sort(),
    );
    expect(JSON.stringify(row)).not.toMatch(/203\.0\.113|a@b\.com|Chrome/);
  });

  it("skips admins, staff pages, bots, fragments and misses", async () => {
    await visit("/pricing", {}, { id: "u1", roles: ["admin"], permissions: [] });
    await visit("/login");
    await visit("/pricing", { "User-Agent": "Googlebot/2.1" });
    await visit("/report", { "HX-Request": "true" });
    await visit("/no-such-page");
    expect(await rows()).toHaveLength(0);

    await visit("/report", { "HX-Request": "true", "HX-Boosted": "true" });
    expect(await rows()).toHaveLength(1);
  });
});

describe("the analytics page", () => {
  it("sums the counters into totals, pages and sources", async () => {
    await visit("/pricing", { Referer: "https://google.com/" });
    await visit("/pricing", { Referer: "http://localhost/" });
    await visit("/gallery?utm_source=linkedin");

    const admin = { id: "u1", roles: ["admin"], permissions: [] };
    const html = await (await visit("/admin/analytics?days=7", {}, admin)).text();
    // Three views, two of them from outside the site.
    expect(html).toMatch(/Page views<\/p>\s*<p[^>]*>3</);
    expect(html).toMatch(/Visits<\/p>\s*<p[^>]*>2</);
    expect(html).toContain("/pricing");
    expect(html).toContain("google.com");
    expect(html).toContain("linkedin");
    // The visit from this site is not a source.
    expect(html).not.toContain("(internal)");
  });
});

describe("helpers", () => {
  it("prefers a utm_source tag, and marks same-site referrers internal", () => {
    const url = new URL("https://zipr.example/pricing?utm_source=LinkedIn");
    expect(sourceFrom(url, "https://google.com/")).toBe("linkedin");
    expect(sourceFrom(new URL("https://zipr.example/"), "https://zipr.example/gallery")).toBe(
      INTERNAL_SOURCE,
    );
    expect(sourceFrom(new URL("https://zipr.example/"), "not a url")).toBe(DIRECT_SOURCE);
  });

  it("classifies devices and filters bots", () => {
    expect(deviceFrom(PHONE)).toBe("mobile");
    expect(deviceFrom("Mozilla/5.0 (iPad; CPU OS 17_0)")).toBe("tablet");
    expect(deviceFrom(DESKTOP)).toBe("desktop");
    expect(shouldCount("/admin/analytics", DESKTOP)).toBe(false);
    expect(shouldCount("/pricing", "curl/8.0")).toBe(false);
  });
});
