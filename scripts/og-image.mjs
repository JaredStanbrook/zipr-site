/**
 * Render public/og.png, the image link previews show for every page.
 *
 * 1200×630 is the size Facebook, LinkedIn, Slack and X all display without
 * cropping. It is drawn from the site's own fonts, colours and logo rather
 * than designed separately, so it cannot drift from the brand; re-run this
 * after changing any of them, or the headline.
 *
 * Usage (Playwright is not a dependency; this is a one-off tool):
 *   npm i -D playwright
 *   node scripts/og-image.mjs
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const ROOT = new URL("..", import.meta.url).pathname;
const font = (file) =>
  `data:font/woff2;base64,${readFileSync(join(ROOT, "public/fonts", file)).toString("base64")}`;
const logo = readFileSync(join(ROOT, "public/logo.svg"), "utf8");

// Light-theme tokens from worker/index.css.
const html = `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  @font-face { font-family: "Space Grotesk"; font-weight: 300 700; src: url(${font("space-grotesk-latin.woff2")}); }
  @font-face { font-family: Inter; font-weight: 100 900; src: url(${font("inter-latin.woff2")}); }
  html, body { margin: 0; }
  body {
    width: 1200px; height: 630px; box-sizing: border-box; padding: 72px 80px;
    background: #f8f6f2;
    color: #242321; font-family: Inter, sans-serif;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .logo { display: flex; align-items: center; gap: 24px; }
  .logo svg { width: 208px; height: 52px; }
  .logo span { font-family: "Space Grotesk", sans-serif; font-weight: 600; font-size: 56px; line-height: 1; }
  h1 { font-family: "Space Grotesk", sans-serif; font-weight: 600; font-size: 84px; line-height: 1; margin: 0; letter-spacing: -0.035em; max-width: 1000px; }
  h1 em { color: #b85f46; font-style: normal; }
  p { font-size: 30px; color: #5f5952; margin: 0; }
  .row { display: flex; justify-content: space-between; align-items: flex-end; }
  .pill { font-size: 24px; font-weight: 700; color: #242321; background: #f36b3b; padding: 10px 22px; border-radius: 999px; }
</style></head>
<body>
  <div class="logo">${logo}<span>Zipr</span></div>
  <h1>Turn the steps you keep explaining into <em>one click.</em></h1>
  <div class="row">
    <p>A desktop launcher for Windows and macOS</p>
    <span class="pill">Free app</span>
  </div>
</body></html>`;

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(ROOT, "public/og.png"), type: "png" });
await browser.close();
console.log("Wrote public/og.png");
