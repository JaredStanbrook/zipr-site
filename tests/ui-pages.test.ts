import { describe, it, expect } from "vitest";
import type { Hono } from "hono";

import type { AppEnv } from "../worker/types";
import { createMockData } from "./utils/fakeDb";
import { createTestApp, env, get } from "./utils/testApp";

/**
 * Smoke tests: every route renders without throwing, signed out and signed in.
 *
 * They exist to catch the failure this template makes easy — a view importing
 * something a route no longer provides. They are not a substitute for testing
 * your own feature logic.
 */

describe("UI pages load", () => {
  it("serves public pages to signed-out visitors", async () => {
    const testApp = createTestApp(null);

    for (const path of [
      "/",
      "/login",
      "/features",
      "/zap",
      "/zap/setup",
      "/pricing",
      "/downloads",
      "/security",
      "/privacy",
      "/licence",
      "/report",
      "/contact",
      "/contact?topic=licence",
      "/contact?topic=security",
    ]) {
      const res = await get(testApp, path);
      expect(res.status, `GET ${path}`).toBe(200);
    }
  });

  it("closes /register and hides its link once sign-up is closed", async () => {
    // No admin yet, so this reaches the single-account check rather than this
    // site's own "an admin exists, so 404" rule.
    const closed = createTestApp(null, undefined, createMockData({ userRoles: [] }), false);

    const res = await get(closed, "/register");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/login");

    // The sign-in card stops offering it. (The nav's "Get Started" link does
    // not know; it lands on /register, which redirects here.)
    const login = await (await get(closed, "/login")).text();
    expect(login).not.toContain("have an account?");

    // Open by default: the prompt is there on an ordinary site.
    const open = await (await get(createTestApp(null), "/login")).text();
    expect(open).toContain("have an account?");
  });

  it("does not offer a restricted role on the sign-up form", async () => {
    const html = await (await get(createTestApp(null), "/register")).text();
    expect(html).not.toMatch(/<option[^>]*value="admin"/);
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

  /**
   * `class="grid-cols-${n}"` in a plain JSX attribute is not interpolation —
   * it is the literal text, emitted straight into the markup. Tailwind builds
   * classes by scanning source for complete names, so it never makes that one
   * and the rule silently does nothing. Both auth pages shipped this way and
   * their tab strips stacked vertically instead of sitting in a row.
   *
   * The same text inside a Lit `html` template is real interpolation and is
   * fine, which is why this checks the rendered output rather than the source:
   * a `${...}` reaching the browser is unambiguous, wherever it came from.
   *
   * Write the whole class name, or map a value to complete names — see
   * `gridColsFor` in worker/views/pages/authParts.tsx.
   */
  it("renders no unevaluated template interpolation", async () => {
    const signedOut = createTestApp(null);
    const signedIn = createTestApp(createMockData().users[0]);
    // The tab strip — where this bug lives — only exists with >1 method.
    const multiMethod = createTestApp(null, ["password", "pin", "passkey"]);

    const pages: [Hono<AppEnv>, string][] = [
      [signedOut, "/"],
      [signedOut, "/login"],
      [signedOut, "/register"],
      [multiMethod, "/login"],
      [multiMethod, "/register"],
      [signedOut, "/features"],
      [signedOut, "/zap"],
      [signedOut, "/zap/setup"],
      [signedOut, "/pricing"],
      [signedOut, "/downloads"],
      [signedOut, "/security"],
      [signedOut, "/report"],
      [signedOut, "/contact"],
      [signedIn, "/profile"],
    ];

    for (const [testApp, path] of pages) {
      const html = await (await get(testApp, path)).text();
      const leaked = html.match(/\$\{[^}]{0,60}\}/g) ?? [];
      expect(leaked, `GET ${path} leaked an uninterpolated expression`).toEqual([]);
    }
  });

  /**
   * Not every auth method is a tab. `totp` is a second step after a successful
   * sign-in, never a choice on this screen — so "password,passkey,totp" draws
   * two tabs, and "password,totp" draws one, which is no choice at all.
   *
   * Sizing the strip by the number of enabled methods therefore left an empty
   * column, and showed a one-tab strip. Count what renders.
   */
  it("sizes the auth tab strip by the tabs it actually renders", async () => {
    const tabsFor = async (methods: string[], path: string) => {
      // No admin yet, so /register is open: this site closes registration
      // once an admin exists, and a closed page has no tabs to count.
      const open = createMockData({ userRoles: [] });
      const html = await (await get(createTestApp(null, methods, open), path)).text();
      const strip = html.match(/<div[^>]*slot="tabs"[^>]*>/)?.[0];
      return { strip, tabs: (html.match(/data-tab="/g) ?? []).length };
    };

    for (const path of ["/login", "/register"]) {
      const three = await tabsFor(["password", "pin", "passkey"], path);
      expect(three.tabs, `${path} with three tabs`).toBe(3);
      expect(three.strip, `${path} with three tabs`).toContain("grid-cols-3");

      // totp is enabled but is not a tab, so this is a two-tab strip.
      const two = await tabsFor(["password", "passkey", "totp"], path);
      expect(two.tabs, `${path} with totp enabled`).toBe(2);
      expect(two.strip, `${path} with totp enabled`).toContain("grid-cols-2");

      // One real choice is no choice — no strip at all.
      const one = await tabsFor(["password", "totp"], path);
      expect(one.tabs, `${path} with one real method`).toBe(0);
      expect(one.strip, `${path} with one real method`).toBeUndefined();
    }
  });

  it("keeps the 'free forever' promises off every public page", async () => {
    // Removed on purpose: the page says what the app costs today and does not
    // promise what it will cost later.
    const testApp = createTestApp(null);
    for (const path of ["/", "/features", "/zap", "/pricing", "/downloads", "/security"]) {
      const html = await (await get(testApp, path)).text();
      for (const phrase of [
        "Always will be",
        "Free forever",
        "free, forever",
        "free forever",
        "for good",
        "permanently",
      ]) {
        expect(html, `${path} should not say "${phrase}"`).not.toContain(phrase);
      }
    }
  });

  it("states prices in Australian dollars, and the site is configured that way", async () => {
    const pricing = await (await get(createTestApp(null), "/pricing")).text();
    expect(pricing).toContain("AUD / person / month");
    expect(pricing).toContain("Prices in AUD");

    // The test app is handed its own config, so this is what holds the real
    // one: wrangler.jsonc is what production reads.
    const { readFileSync } = await import("node:fs");
    const wrangler = readFileSync("wrangler.jsonc", "utf8");
    expect(wrangler).toMatch(/"APP_CURRENCY":\s*"AUD"/);
  });

  it("lists Zap in the plan comparison", async () => {
    const pricing = await (await get(createTestApp(null), "/pricing")).text();
    expect(pricing).toContain("Zap, the AI that builds items for you");
    expect(pricing).toContain("With your own key");
    expect(pricing).toContain("One AI key for the whole team");
  });

  it("uses the plainer wording on the home and features pages", async () => {
    const testApp = createTestApp(null);
    const home = await (await get(testApp, "/")).text();
    expect(home).toContain("most useful");
    expect(home).toContain("The first two are free. The third is what teams pay for.");

    const features = await (await get(testApp, "/features")).text();
    expect(features).toContain("One item for Windows and Mac");
    expect(features).toContain("Decide what happens next");
    expect(features).not.toContain("Branch as you go");
    expect(features).not.toContain("One item, every platform");
    expect(features).toContain("Zap knows Zipr like the back of its hand");
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
    // Nobody downloads the app without the licence one click away.
    expect(downloads).toContain('href="/licence"');
  });

  it("closes registration once an admin exists, and keeps it open before", async () => {
    // The bootstrap admin is made by registering once on the live site, so the
    // page has to exist until it has been used — and not a moment longer.
    const withAdmin = await get(createTestApp(null), "/register");
    expect(withAdmin.status).toBe(404);

    const fresh = createTestApp(null, undefined, createMockData({ userRoles: [] }));
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
