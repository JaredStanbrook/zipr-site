/**
 * Pull every word a visitor reads into one editable document.
 *
 * Copy is much easier to judge as prose than as JSX, and much easier to
 * improve when it is all in one place and in reading order. This renders each
 * public page and walks the DOM, so the export is what the site actually says
 * rather than what somebody remembered to copy across — a hand-written
 * transcript goes stale the first time a heading changes.
 *
 * Every block gets a stable id. Edit the text under an id, leave the id alone,
 * and the result can be applied back to source without anyone guessing which
 * string moved where.
 *
 * Usage:
 *   npm run dev                 # in another terminal
 *   npm i -D playwright         # not a dependency; this is a one-off tool
 *   node scripts/copy-export.mjs [baseUrl] > docs/site-copy.md
 */

import { chromium } from "playwright";

const BASE = process.argv[2] || "http://127.0.0.1:5173";

/** Public pages, in the order a person is likely to meet them. */
const PAGES = [
  { id: "HOME", path: "/", name: "Home", source: "worker/views/pages/Home.tsx" },
  { id: "FEAT", path: "/features", name: "Features", source: "worker/views/pages/Features.tsx" },
  { id: "PRICE", path: "/pricing", name: "Pricing", source: "worker/views/pages/Pricing.tsx" },
  { id: "DL", path: "/downloads", name: "Downloads", source: "worker/views/pages/Downloads.tsx" },
  { id: "SEC", path: "/security", name: "Security", source: "worker/views/pages/Security.tsx" },
  { id: "CONT", path: "/contact", name: "Contact", source: "worker/views/pages/Contact.tsx" },
  { id: "REP", path: "/report", name: "Report a bug", source: "worker/views/pages/Report.tsx" },
];

/**
 * Pull the text blocks out of a container, in document order.
 *
 * Runs in the page rather than over the HTML source because "what does this
 * say, in what order" is a rendering question — a regex over JSX cannot see
 * that a heading is inside a card that comes third.
 */
const extract = (selector) =>
  document.querySelectorAll(selector).length === 0
    ? []
    : (() => {
        const root = document.querySelector(selector);

        // A collapsed <details> renders nothing, so `innerText` on its body is
        // empty and the answers vanish silently. Open them all before reading.
        for (const details of root.querySelectorAll("details")) details.open = true;
        /*
         * `div` is in here on purpose, and it is safe because of the
         * innermost-only filter below: a layout div wrapping a paragraph is
         * dropped as a container, while a div holding nothing but text is
         * kept. Without it every disclosure answer on the site went missing —
         * the questions exported and the answers did not.
         */
        const BLOCK =
          "h1,h2,h3,h4,h5,p,li,summary,button,label,figcaption,blockquote,dt,dd,table,div";
        const candidates = [...root.querySelectorAll(BLOCK)];

        /*
         * Links and standalone spans count unless they sit inside a block of
         * *prose*, where pulling them out would tear a sentence in half.
         *
         * The test is deliberately TEXT_BLOCK and not BLOCK: `div` is in BLOCK
         * (see above), so testing against it dropped every call-to-action on
         * the site — a button inside a card counts as "inside a block" and was
         * skipped, while the card itself was dropped as a container. "Start a
         * trial" disappeared from the pricing page that way.
         */
        const TEXT_BLOCK = "p,li,summary,h1,h2,h3,h4,h5,label,td,th,dt,dd,blockquote,figcaption";
        for (const el of root.querySelectorAll("a,span")) {
          if (!el.closest(TEXT_BLOCK)) candidates.push(el);
        }

        const inOrder = candidates.sort((a, b) =>
          a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
        );

        const out = [];

        for (const el of inOrder) {
          // Anything inside a table is handled by the table itself.
          if (el.parentElement?.closest("table")) continue;

          /*
           * A table comes out as a table. One block per cell captures
           * everything and is miserable to read or edit — the comparison table
           * alone is over a hundred fragments, most of them the word
           * "Unlimited" — and it loses the shape that makes the thing legible.
           */
          if (el.tagName === "TABLE") {
            const rows = [...el.querySelectorAll("tr")].map((tr) =>
              [...tr.querySelectorAll("th,td")].map((cell) => {
                /*
                 * A feature and its explanatory note are two separate strings
                 * that happen to share a cell, and a rewrite needs to know
                 * which half it is changing.
                 *
                 * Split on DOM position rather than on a class: the two spans
                 * here carry the same `block` class, so matching by class
                 * picks the feature and calls it the note.
                 */
                const clean = (value) => (value || "").replace(/\s+/g, " ").trim();
                const spans = [...cell.children].filter((c) => c.tagName === "SPAN");
                const direct = clean(
                  [...cell.childNodes]

                    .filter((n) => n.nodeType === Node.TEXT_NODE)
                    .map((n) => n.textContent)
                    .join(" "),
                );

                let head;
                let note;
                if (direct) {
                  // Text of its own plus a sub-label, as in a column heading.
                  head = direct;
                  note = clean(spans.map((sp) => sp.innerText).join(" "));
                } else if (spans.length) {
                  head = clean(spans[0].innerText);
                  note = clean(
                    spans
                      .slice(1)
                      .map((sp) => sp.innerText)
                      .join(" "),
                  );
                } else {
                  head = clean(cell.innerText);
                  note = "";
                }

                const pipe = (value) => value.replace(/\|/g, "\\|");
                return note ? `${pipe(head)}<br>_${pipe(note)}_` : pipe(head);
              }),
            );
            const width = Math.max(...rows.map((r) => r.length));
            out.push({
              kind: "table",
              // Group headings span the table; pad them so the columns line up.
              rows: rows
                .filter((r) => r.length)
                .map((r) => (r.length < width ? [...r, ...Array(width - r.length).fill("")] : r)),
            });
            continue;
          }

          // Keep the innermost block: an <li> wrapping a <p> would otherwise
          // report the same sentence twice.
          if (inOrder.some((other) => other !== el && el.contains(other))) continue;

          const text = (el.innerText || "").replace(/\s+/g, " ").trim();
          if (!text) continue;
          // Visually hidden helper text is not copy anyone is reading.
          if (el.closest(".sr-only") || el.classList.contains("sr-only")) continue;

          const tag = el.tagName.toLowerCase();
          const kind =
            tag === "h1"
              ? "heading"
              : /^h[2-5]$/.test(tag)
                ? "subheading"
                : tag === "button" || (tag === "a" && el.className.includes("clay-press"))
                  ? "button"
                  : tag === "summary"
                    ? "question"
                    : tag === "label"
                      ? "field label"
                      : tag === "li"
                        ? "list item"
                        : tag === "th" || tag === "td"
                          ? "table cell"
                          : "text";

          if (out.length && out[out.length - 1].text === text) continue;
          out.push({ kind, text });
        }
        return out;
      })();

const escapeBlock = (text) => text.replace(/\r?\n/g, " ");

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM || "/opt/pw-browsers/chromium",
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const lines = [];
const w = (s = "") => lines.push(s);

w("# Zipr — site copy");
w();
w("Every word a visitor reads, in reading order, pulled straight from the");
w("rendered pages.");
w();
w("## How to use this");
w();
w("- **Edit the text, not the ids.** Each block is labelled `[ID]`. Rewrite what");
w("  is underneath it and leave the label where it is.");
w("- **Delete a block** to have it removed from the page, and say so in a note —");
w("  some are load-bearing (a button with no label is still a button).");
w("- **Add a block** by writing `[NEW after HOME-12]` and the text you want.");
w("- Hand the whole file back and it gets applied to the source.");
w();
w("Generated by `scripts/copy-export.mjs`. Re-run it any time; the ids are");
w("positional, so they shift if blocks are added — always work from a fresh pull.");
w();
w("---");
w();

// ---------------------------------------------------------------------------
// Shared furniture, extracted once rather than on every page.
// ---------------------------------------------------------------------------
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

w("## Shared · every page");
w();
w("_Source: `worker/views/components/NavBar.tsx`, `worker/views/components/SiteFooter.tsx`,");
w("and `APP_TAGLINE` in `wrangler.jsonc`._");
w();

const nav = await page.evaluate(extract, "header");
nav.forEach((b, i) => {
  w(`**[NAV-${String(i + 1).padStart(2, "0")}]** _${b.kind}_`);
  w();
  w(escapeBlock(b.text));
  w();
});

const footer = await page.evaluate(extract, "footer");
footer.forEach((b, i) => {
  w(`**[FOOT-${String(i + 1).padStart(2, "0")}]** _${b.kind}_`);
  w();
  w(escapeBlock(b.text));
  w();
});

w("---");
w();

// ---------------------------------------------------------------------------
// Each page.
// ---------------------------------------------------------------------------
for (const spec of PAGES) {
  await page.goto(BASE + spec.path, { waitUntil: "networkidle" });

  const meta = await page.evaluate(() => ({
    title: document.title,

    description: document.querySelector('meta[name="description"]')?.content ?? "",
  }));

  w(`## ${spec.name} · \`${spec.path}\``);
  w();
  w(`_Source: \`${spec.source}\`_`);
  w();
  w("These two are what shows in a Google result and a shared link, not on the");
  w("page itself:");
  w();
  w(`**[${spec.id}-TITLE]** _browser tab and search result_`);
  w();
  w(meta.title);
  w();
  w(`**[${spec.id}-DESC]** _search result snippet_`);
  w();
  w(meta.description);
  w();

  const blocks = await page.evaluate(extract, "main");
  blocks.forEach((b, i) => {
    const id = `${spec.id}-${String(i + 1).padStart(2, "0")}`;
    w(`**[${id}]** _${b.kind}_`);
    w();
    if (b.kind === "table") {
      w("Edit the cells in place. Keep the pipes and the row order.");
      w();
      b.rows.forEach((row, rowIndex) => {
        w(`| ${row.join(" | ")} |`);
        if (rowIndex === 0) w(`|${row.map(() => " --- ").join("|")}|`);
      });
      w();
      return;
    }
    w(escapeBlock(b.text));
    w();
  });

  w("---");
  w();
}

await browser.close();

process.stdout.write(lines.join("\n"));
