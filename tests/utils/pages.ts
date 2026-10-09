import { Hono } from "hono";
import { parseHTML } from "linkedom";

import type { AppEnv } from "../../worker/types";
import { renderNotFound } from "../../worker/views/pages/NotFound";
import { collectAttributes, collectSegments, hashKey } from "../../worker/components/lib/translate";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createMockData } from "./fakeDb";
import { createTestApp, get } from "./testApp";

/**
 * The public pages a visitor can have translated, as the worker renders them.
 *
 * The 404 is in the list because it is a page a visitor really sees, with
 * words on it. Pages that stay English whatever was chosen (the legal pages,
 * sign-in, admin) are deliberately not here: see `isTranslatablePath`.
 */
export const TRANSLATED_PAGES = [
  "/",
  "/features",
  "/zap",
  "/zap/setup",
  "/pricing",
  "/downloads",
  "/security",
  "/report",
  "/contact",
  "/this-page-does-not-exist",
];

/** A setting as `wrangler.jsonc` has it, which is what production reads. */
const wranglerVar = (name: string): string => {
  const text = readFileSync(join(import.meta.dirname, "..", "..", "wrangler.jsonc"), "utf8");
  const match = text.match(new RegExp(`"${name}"\\s*:\\s*"([^"]*)"`));
  if (!match) throw new Error(`${name} is not set in wrangler.jsonc`);
  return match[1];
};

/**
 * The site as production configures it, not as the other tests do.
 *
 * The page titles carry the site's name and the footer carries its tagline,
 * so a sentence extracted under the tests' "Test App" would be one no visitor
 * ever sees, and the real one would go untranslated.
 */
export const siteConfig = () => ({
  name: wranglerVar("APP_NAME"),
  tagline: wranglerVar("APP_TAGLINE"),
  locale: wranglerVar("APP_LOCALE"),
  currency: wranglerVar("APP_CURRENCY"),
  timezone: "UTC",
  origin: wranglerVar("ORIGIN"),
});

const notFoundApp = () => {
  const app = new Hono<AppEnv>();
  app.use("*", async (c, next) => {
    c.set("app", siteConfig() as any);
    c.set("auth", { user: null } as any);
    await next();
  });
  app.notFound(renderNotFound);
  return app;
};

/**
 * Each page's HTML, signed out, as production configures it.
 *
 * The downloads page says different things with a release published and
 * without one, and a visitor sees whichever is true today, so both are
 * rendered; a catalogue that covered only one would leave the other in English
 * the day the state changes.
 */
export const renderPages = async (paths: string[] = TRANSLATED_PAGES) => {
  const config = siteConfig() as any;
  const site = createTestApp(null, undefined, createMockData(), true, config);
  const noReleases = createTestApp(
    null,
    undefined,
    createMockData({ releases: [], releaseAssets: [] }),
    true,
    config,
  );
  const notFound = notFoundApp();
  const pages: Record<string, string> = {};
  for (const path of paths) {
    if (path.includes("does-not-exist")) {
      const response = await notFound.fetch(new Request(`http://localhost${path}`), {
        ORIGIN: "http://localhost:3000",
      } as any);
      pages[path] = await response.text();
      continue;
    }
    pages[path] = await (await get(site, path)).text();
    if (path === "/downloads") {
      pages[`${path} (no releases yet)`] = await (await get(noReleases, path)).text();
    }
  }
  return pages;
};

/** A parsed page, which also carries the `<title>` a visitor's tab shows. */
export const parsePage = (html: string) => parseHTML(html).document;

/** The tab title as the browser script reads it. */
export const titleKey = (title: string) => title.replace(/\s+/g, " ").trim();

/**
 * Words the page's own scripts put on screen, which the server's HTML does not
 * contain and so extraction cannot find: the toaster's region and close-button
 * labels (`components/ui/AppToaster.ts`). Listed here so they are translated;
 * a label added to that file belongs here too.
 */
export const SCRIPT_RENDERED = ["Notifications", "Close"];

/**
 * Every English sentence on the translated pages, by hash, in the order they
 * first appear: page text, then attributes, then the tab title.
 */
export const liveKeys = async (): Promise<Map<string, string>> => {
  const keys = new Map<string, string>();
  for (const key of SCRIPT_RENDERED) keys.set(hashKey(key), key);
  for (const html of Object.values(await renderPages())) {
    const document = parsePage(html);
    const body = document.body as unknown as Element;
    for (const segment of collectSegments(body)) keys.set(segment.id, segment.key);
    for (const item of collectAttributes(body)) keys.set(item.id, item.key);
    const title = titleKey(document.title);
    if (title) keys.set(hashKey(title), title);
  }
  return keys;
};
