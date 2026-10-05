import { describe, it, expect } from "vitest";
import { Hono } from "hono";

import app from "../worker/app";
import type { AppEnv } from "../worker/types";
import { canonicalUrl } from "../worker/middleware/canonical-url.middleware";
import { renderNotFound } from "../worker/views/pages/NotFound";
import { jsonLdScript, resolveMeta } from "../worker/lib/seo";
import { createFakeDb, createMockData } from "./utils/fakeDb";

/**
 * The site-level SEO behaviour: one URL per page, a real 404 page, and
 * metadata a crawler and a link preview can use.
 */

const appConfig = {
  name: "Zipr",
  tagline: "",
  locale: "en-AU",
  currency: "AUD",
  origin: "https://zipr.example",
  // As in wrangler.jsonc.
  ogImage: "/og.png",
};

/** The redirect middleware in front of a trivial page, as the worker mounts it. */
const redirectApp = () => {
  const h = new Hono<AppEnv>();
  h.use("*", canonicalUrl);
  h.get("*", (c) => c.text("ok"));
  h.post("*", (c) => c.text("posted"));
  return h;
};

const prodEnv = { ORIGIN: "https://zipr.example" } as any;

describe("canonical URL enforcement", () => {
  it("sends HTTP to HTTPS on the production host, permanently", async () => {
    const res = await redirectApp().fetch(
      new Request("http://zipr.example/pricing?x=1", {
        headers: { "CF-Visitor": '{"scheme":"http"}' },
      }),
      prodEnv,
    );
    expect(res.status).toBe(301);
    expect(res.headers.get("Location")).toBe("https://zipr.example/pricing?x=1");
  });

  it("trusts Cloudflare's scheme, not the URL, so a local preview cannot loop", async () => {
    // `wrangler dev` presents the production host over plain HTTP with no
    // CF-Visitor header. Redirecting that sent localhost back to itself.
    const res = await redirectApp().fetch(new Request("http://zipr.example/pricing"), prodEnv);
    expect(res.status).toBe(200);
  });

  it("leaves other hosts on HTTP alone, so local dev keeps working", async () => {
    const res = await redirectApp().fetch(new Request("http://localhost/pricing"), prodEnv);
    expect(res.status).toBe(200);
    expect(res.headers.get("Strict-Transport-Security")).toBeNull();
  });

  it("sets HSTS on the production host", async () => {
    const res = await redirectApp().fetch(new Request("https://zipr.example/"), prodEnv);
    expect(res.status).toBe(200);
    expect(res.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
  });

  it("strips a trailing slash with a 301, keeping the query", async () => {
    const res = await redirectApp().fetch(
      new Request("https://zipr.example/features/?a=b"),
      prodEnv,
    );
    expect(res.status).toBe(301);
    expect(res.headers.get("Location")).toBe("/features?a=b");
  });

  it("never redirects the home page or a POST", async () => {
    const home = await redirectApp().fetch(new Request("https://zipr.example/"), prodEnv);
    expect(home.status).toBe(200);

    const post = await redirectApp().fetch(
      new Request("https://zipr.example/report/", { method: "POST" }),
      prodEnv,
    );
    expect(post.status).toBe(200);
  });
});

describe("not-found page", () => {
  it("is a real page with a 404 status, kept out of the index", async () => {
    const h = new Hono<AppEnv>();
    h.use("*", async (c, next) => {
      c.set("app", appConfig as any);
      c.set("auth", { user: null } as any);
      await next();
    });
    h.notFound(renderNotFound);

    const res = await h.fetch(new Request("https://zipr.example/nope"), prodEnv);
    const html = await res.text();
    expect(res.status).toBe(404);
    expect(html).toContain("That page isn&#39;t here");
    expect(html).toContain('content="noindex, follow"');
    expect(html).toContain('href="/downloads"');
  });
});

describe("page metadata", () => {
  it("gives every page the site's share image, unless it sets its own", () => {
    const url = new URL("https://zipr.example/features");
    expect(resolveMeta({}, appConfig as any, url).image).toBe("https://zipr.example/og.png");
    expect(resolveMeta({ image: "/x.png" }, appConfig as any, url).image).toBe(
      "https://zipr.example/x.png",
    );
  });

  it("cannot break out of its script element", () => {
    const out = jsonLdScript({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });
});

describe("rendered pages", () => {
  const site = () => {
    const wrapper = new Hono<AppEnv>();
    wrapper.use("*", async (c, next) => {
      c.set("db", createFakeDb(createMockData()) as any);
      c.set("app", appConfig as any);
      c.set("auth", { user: null } as any);
      await next();
    });
    wrapper.route("/", app);
    return wrapper;
  };
  const page = async (path: string) =>
    (await site().fetch(new Request(`https://zipr.example${path}`), prodEnv)).text();

  const jsonLd = (html: string) =>
    [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) =>
      JSON.parse(m[1]),
    );

  it("describes the site and the free app on the home page, and nothing invented", async () => {
    const data = jsonLd(await page("/"));
    const types = data.map((d) => d["@type"]);
    expect(types).toEqual(["WebSite", "SoftwareApplication"]);

    const software = data[1];
    expect(software.offers.price).toBe("0");
    expect(software).not.toHaveProperty("aggregateRating");
    expect(software).not.toHaveProperty("review");
  });

  it("marks up only the questions the page shows", async () => {
    const html = await page("/pricing");
    const [faq] = jsonLd(html);
    expect(faq["@type"]).toBe("FAQPage");
    for (const q of faq.mainEntity) {
      // Apostrophes are HTML-escaped in the visible text.
      expect(html).toContain(q.name.replace(/'/g, "&#39;"));
    }
  });

  it("gives each page its own title and a description short enough not to be cut", async () => {
    const titles = new Set<string>();
    for (const path of [
      "/",
      "/features",
      "/zap",
      "/zap/setup",
      "/pricing",
      "/downloads",
      "/security",
      "/contact",
    ]) {
      const html = await page(path);
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
      const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
      expect(titles.has(title), `duplicate title on ${path}`).toBe(false);
      titles.add(title);
      expect(title.length, `title on ${path}`).toBeLessThanOrEqual(65);
      expect(description.length, `description on ${path}`).toBeLessThanOrEqual(160);
      expect(description.length, `description on ${path}`).toBeGreaterThan(70);
    }
  });

  it("keeps parameter variants of a page indexable, with one canonical", async () => {
    const html = await page("/contact?topic=cloud");
    expect(html).toContain('rel="canonical" href="https://zipr.example/contact"');
    expect(html).not.toContain("noindex");
  });
});
