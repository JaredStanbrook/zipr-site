import { describe, it, expect } from "vitest";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseHTML } from "linkedom";

import { LANGUAGES, LANGUAGE_STORAGE_KEY, isTranslatablePath } from "../worker/content/languages";
import {
  applySegment,
  collectAttributes,
  collectSegments,
  hashKey,
  parseTemplate,
  sameShape,
  translateTree,
  type Catalogue,
} from "../worker/components/lib/translate";
import { liveKeys, parsePage, renderPages } from "./utils/pages";

/**
 * Translation: the matching rules, the catalogues, and the commands that keep
 * the two in step.
 *
 * Three kinds of test live here. The unit tests pin how a page is split into
 * sentences, because a change to that silently orphans every translation. The
 * round-trip test runs every real page through the translator with an
 * identity catalogue and checks nothing visible moved. And the catalogue tests
 * check each language file is well formed and covers the pages as they are.
 *
 * Two commands piggyback on this file because rendering the real pages needs
 * the worker's test harness:
 *
 *   npm run i18n:extract   writes i18n/source.json, the English sentences
 *   npm run i18n:status    lists what each language is missing
 */

const ROOT = join(import.meta.dirname, "..");
const CATALOGUES = join(ROOT, "public", "i18n");
const SOURCE = join(ROOT, "i18n", "source.json");

const body = (markup: string) =>
  parseHTML(`<!doctype html><html><body>${markup}</body></html>`).document
    .body as unknown as Element;

const keysOf = (markup: string) => collectSegments(body(markup)).map((segment) => segment.key);

describe("hashing", () => {
  it("is FNV-1a, so an id means the same thing in the browser and here", () => {
    expect(hashKey("")).toBe("811c9dc5");
    expect(hashKey("a")).toBe("e40c292c");
    expect(hashKey("foobar")).toBe("bf9cf968");
  });
});

describe("splitting a page into sentences", () => {
  it("keeps a sentence whole, with its emphasis as a placeholder", () => {
    expect(keysOf("<h1>Turn steps into <em>one click.</em></h1>")).toEqual([
      "Turn steps into <1>one click.</1>",
    ]);
  });

  it("numbers placeholders in the order they open, and nests them", () => {
    expect(keysOf('<p>See <a href="/x">the <strong>full</strong> list</a> now</p>')).toEqual([
      "See <1>the <2>full</2> list</1> now",
    ]);
  });

  it("leaves an icon out of the sentence and keeps the space after it", () => {
    const root = body('<a href="/d"><i data-lucide="download"></i> Download</a>');
    const [segment] = collectSegments(root);
    expect(segment.key).toBe("Download");
    expect(applySegment(segment, "Descargar")).toBe(true);
    expect(root.innerHTML).toBe('<a href="/d"><i data-lucide="download"></i> Descargar</a>');
  });

  it("keeps code and anything marked translate=no exactly as it is", () => {
    expect(keysOf("<p>Run <code>npm test</code> now</p>")).toEqual(["Run <1/> now"]);
    expect(keysOf('<p><span translate="no">Zipr</span> is free</p>')).toEqual(["<1/> is free"]);
    expect(keysOf('<div translate="no"><p>Never translated</p></div><p>Translated</p>')).toEqual([
      "Translated",
    ]);
  });

  it("translates a row of links as separate labels, not as one sentence", () => {
    expect(keysOf('<nav><a href="/a"> Features </a> <a href="/b"> Zap </a></nav>')).toEqual([
      "Features",
      "Zap",
    ]);
    expect(keysOf("<p><span>Feature</span><span>What it does</span></p>")).toEqual([
      "Feature",
      "What it does",
    ]);
    // Words between the elements make it one sentence again.
    expect(keysOf("<p><span>Black</span> and <span>white</span></p>")).toEqual([
      "<1>Black</1> and <2>white</2>",
    ]);
  });

  it("keeps a date out of its sentence, however it is spelled", () => {
    expect(keysOf("<p>Updated <time>5 Oct 2026</time> by us</p>")).toEqual(["Updated <1/> by us"]);
  });

  it("goes inside a lone wrapper, so the sentence is the words and not the span", () => {
    const [segment] = collectSegments(body("<div><span>Most teams start here</span></div>"));
    expect(segment.key).toBe("Most teams start here");
    expect(segment.container.tagName.toLowerCase()).toBe("span");
  });

  it("treats a link around a block as a block, and finds the sentence inside", () => {
    expect(keysOf('<a href="/x"><div><h3>Title</h3><p>Body text</p></div></a>')).toEqual([
      "Title",
      "Body text",
    ]);
  });

  it("skips scripts, preformatted text and styles", () => {
    expect(keysOf("<pre>do not touch</pre><script>var a = 1</script><p>Hello</p>")).toEqual([
      "Hello",
    ]);
  });

  it("finds the text of dropdown options and button labels", () => {
    expect(keysOf("<select><option>Bug report</option></select><button>Send</button>")).toEqual([
      "Bug report",
      "Send",
    ]);
  });

  it("ignores text with no letters in it", () => {
    expect(keysOf("<p>·</p><p>$6</p><p>12 / 34</p>")).toEqual([]);
  });

  it("keeps a figure inside a sentence as it is, so a count can change", () => {
    expect(keysOf("<p>Minimum <span>5</span> people, so <b>$360</b> a year</p>")).toEqual([
      "Minimum <1/> people, so <2/> a year",
    ]);
    const root = body("<p>Minimum <span>9</span> people</p>");
    translateTree(root, { [hashKey("Minimum <1/> people")]: "Mínimo <1/> personas" });
    expect(root.innerHTML).toBe("<p>Mínimo <span>9</span> personas</p>");
  });

  it("keeps a figure beside a sentence out of it, so a price change cannot orphan it", () => {
    expect(keysOf("<p><span>$6</span><span>AUD / person / month</span></p>")).toEqual([
      "AUD / person / month",
    ]);
    expect(keysOf('<p><code>git</code></p><p><i data-lucide="x"></i></p>')).toEqual([]);
  });

  it("collapses whitespace, so formatting changes do not orphan a translation", () => {
    expect(keysOf("<p>\n   Hello\n     world   </p>")).toEqual(["Hello world"]);
    expect(hashKey(keysOf("<p>Hello world</p>")[0])).toBe(
      hashKey(keysOf("<p>\n Hello \n world\n</p>")[0]),
    );
  });

  it("escapes a literal angle bracket so it cannot be read as a placeholder", () => {
    expect(keysOf("<p>Use &lt;b&gt; for <em>bold</em></p>")).toEqual([
      "Use &lt;b&gt; for <1>bold</1>",
    ]);
  });

  it("keeps a closing quote and full stop with its sentence", () => {
    // linkedom, unlike a browser, splits an entity into its own text node.
    expect(keysOf("<p>Name it &quot;Zipr&quot;.</p>")).toEqual(['Name it "Zipr".']);
  });

  it("finds alternative text and labels in attributes", () => {
    const attributes = collectAttributes(
      body('<img alt="A screenshot"><button aria-label="Open menu"></button><img alt="">'),
    );
    expect(attributes.map((item) => item.key)).toEqual(["A screenshot", "Open menu"]);
  });
});

describe("applying a translation", () => {
  it("rebuilds the original elements, so a link keeps its address and classes", () => {
    const root = body('<p>Read <a class="underline" href="/zap">about Zap</a> today</p>');
    const catalogue: Catalogue = {
      [hashKey("Read <1>about Zap</1> today")]: "Lee hoy <1>sobre Zap</1>",
    };
    const result = translateTree(root, catalogue);
    expect(result.applied).toBe(1);
    expect(root.innerHTML).toBe('<p>Lee hoy <a class="underline" href="/zap">sobre Zap</a></p>');
  });

  it("lets a language move a placeholder to where its grammar wants it", () => {
    const root = body("<p><em>One click</em> or <strong>two</strong></p>");
    const key = "<1>One click</1> or <2>two</2>";
    translateTree(root, { [hashKey(key)]: "<2>dos</2> o <1>un clic</1>" });
    expect(root.innerHTML).toBe("<p><strong>dos</strong> o <em>un clic</em></p>");
  });

  it("refuses a translation that loses a link, and leaves the English", () => {
    const root = body('<p>Read <a href="/zap">about Zap</a> today</p>');
    const key = "Read <1>about Zap</1> today";
    const result = translateTree(root, { [hashKey(key)]: "Lee sobre Zap hoy" });
    expect(result.applied).toBe(0);
    expect(result.missing).toEqual([key]);
    expect(root.innerHTML).toBe('<p>Read <a href="/zap">about Zap</a> today</p>');
  });

  it("refuses a malformed translation", () => {
    for (const bad of ["<1>sin cerrar", "</1>cerrado solo", "uno <9>dos</9>", "a < b <1>c</1>"]) {
      expect(sameShape("x <1>y</1>", bad), bad).toBe(false);
    }
    expect(parseTemplate("fin <1>medio</1> &lt;ok&gt;")).not.toBeNull();
  });

  it("translates attributes, and not into markup", () => {
    const root = body('<img alt="A screenshot"><button aria-label="Open menu"></button>');
    translateTree(root, {
      [hashKey("A screenshot")]: "Una captura",
      [hashKey("Open menu")]: "<b>Abrir</b>",
    });
    expect(root.innerHTML).toContain('alt="Una captura"');
    expect(root.innerHTML).toContain('aria-label="Open menu"');
  });
});

describe("the real pages", () => {
  /**
   * The strongest check on the rebuild step: translate every page into itself.
   * If building from placeholders loses a word, a link or an element, this
   * finds it on the page that has it.
   */
  it("come through an identity translation unchanged", async () => {
    for (const [path, html] of Object.entries(await renderPages())) {
      const root = parsePage(html).body as unknown as Element;
      const collapse = (text: string) => text.replace(/\s+/g, " ").trim();
      const hrefs = () =>
        Array.from(root.querySelectorAll("[href]"))
          .map((el) => el.getAttribute("href"))
          .sort();

      const before = {
        text: collapse(root.textContent ?? ""),
        hrefs: hrefs(),
        count: root.querySelectorAll("*").length,
      };

      const catalogue: Catalogue = {};
      for (const segment of collectSegments(root)) catalogue[segment.id] = segment.key;
      for (const item of collectAttributes(root)) catalogue[item.id] = item.key;
      const result = translateTree(root, catalogue);

      expect(result.missing, path).toEqual([]);
      expect(collapse(root.textContent ?? ""), path).toBe(before.text);
      expect(hrefs(), path).toEqual(before.hrefs);
      expect(root.querySelectorAll("*").length, path).toBe(before.count);
    }
  });

  it("have no two different sentences sharing an id", async () => {
    const seen = new Map<string, string>();
    for (const [id, key] of await liveKeys()) {
      expect(seen.get(id) ?? key, `${id} is ${key}`).toBe(key);
      seen.set(id, key);
    }
  });
});

describe("which pages are translated", () => {
  it("leaves the legal pages and the staff pages in English", () => {
    for (const path of [
      "/privacy",
      "/licence",
      "/login",
      "/register",
      "/profile",
      "/admin",
      "/admin/releases",
      "/web/auth/logout",
    ]) {
      expect(isTranslatablePath(path), path).toBe(false);
    }
    for (const path of [
      "/",
      "/zap",
      "/zap/setup",
      "/pricing",
      "/downloads",
      undefined,
      "/privacy-policy-ish",
    ]) {
      expect(isTranslatablePath(path), String(path)).toBe(true);
    }
  });
});

const read = (path: string): Record<string, string> => JSON.parse(readFileSync(path, "utf8"));

/**
 * The English sentences, in the order the pages first say them.
 *
 * An array of pairs rather than an object, because a JavaScript object puts
 * keys that look like numbers first, and a hash made only of digits does.
 */
const readSource = (): Record<string, string> =>
  Object.fromEntries(JSON.parse(readFileSync(SOURCE, "utf8")) as [string, string][]);

describe.each(LANGUAGES)("the $english catalogue", (language) => {
  const path = join(CATALOGUES, `${language.code}.json`);

  it("exists and is well formed", () => {
    expect(existsSync(path), `public/i18n/${language.code}.json`).toBe(true);
    const catalogue = read(path);
    expect(Object.keys(catalogue).length).toBeGreaterThan(0);
    for (const [id, translation] of Object.entries(catalogue)) {
      expect(id, "ids are eight hex digits").toMatch(/^[0-9a-f]{8}$/);
      expect(typeof translation, id).toBe("string");
      expect(translation.trim(), `${id} is empty`).not.toBe("");
      expect(translation, `${id} has stray whitespace`).toBe(translation.trim());
    }
  });

  it("keeps every link and emphasis the English has", () => {
    const source = readSource();
    const catalogue = read(path);
    const broken = Object.entries(catalogue)
      .filter(([id]) => source[id] !== undefined)
      .filter(([id, translation]) => !sameShape(source[id], translation))
      .map(([id]) => `${id}: ${source[id]}`);
    expect(broken).toEqual([]);
  });

  /**
   * Not "complete": a copy edit made after the translations were written is
   * allowed to leave a sentence in English, and `npm run i18n:status` says
   * which. But a catalogue covering far less than that means the splitting
   * rules changed underneath it, which this is here to catch.
   */
  it("covers nearly everything the pages say today", async () => {
    const catalogue = read(path);
    const keys = await liveKeys();
    const covered = [...keys.keys()].filter((id) => catalogue[id] !== undefined).length;
    expect(covered / keys.size, `${covered} of ${keys.size}`).toBeGreaterThanOrEqual(0.95);
  });
});

describe("the English sentences", () => {
  it("are recorded in i18n/source.json, with nothing the pages no longer say", async () => {
    const source = readSource();
    const live = await liveKeys();
    const missing = [...live.keys()].filter((id) => source[id] === undefined);
    expect(
      missing.map((id) => live.get(id)),
      "run npm run i18n:extract",
    ).toEqual([]);
  });

  it("are remembered under one local-storage key", () => {
    expect(LANGUAGE_STORAGE_KEY).toBe("zipr-lang");
  });
});

// --- Commands -----------------------------------------------------------------------

describe("commands", () => {
  it.runIf(process.env.I18N_EXTRACT)("extract: writes the English sentences", async () => {
    const keys = await liveKeys();
    mkdirSync(join(ROOT, "i18n"), { recursive: true });
    const lines = [...keys].map((pair) => `  ${JSON.stringify(pair)}`);
    writeFileSync(SOURCE, `[\n${lines.join(",\n")}\n]\n`);
    console.log(`Wrote ${keys.size} sentences to i18n/source.json`);
  });

  it.runIf(process.env.I18N_STATUS)("status: lists what each language is missing", async () => {
    const keys = await liveKeys();
    const lines: string[] = [];
    for (const language of LANGUAGES) {
      const path = join(CATALOGUES, `${language.code}.json`);
      const catalogue = existsSync(path) ? read(path) : {};
      const missing = [...keys.entries()].filter(([id]) => catalogue[id] === undefined);
      lines.push(`${language.code}: ${keys.size - missing.length} of ${keys.size} translated`);
      if (process.env.I18N_STATUS === "full") {
        for (const [id, key] of missing) lines.push(`  ${id}  ${key}`);
      }
    }
    console.log(lines.join("\n"));
  });
});
