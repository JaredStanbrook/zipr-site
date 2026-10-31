#!/usr/bin/env node
/**
 * Turn the client's PNG captures into the WebP files the site serves.
 *
 *   node scripts/screenshots.mjs [sourceDir]
 *
 * `sourceDir` holds `<id>-light.png` files (default: `public/screenshots`,
 * for re-encoding what is already there; normally the client's `marketing/`
 * folder). For each one it writes, into `public/screenshots/`:
 *
 *   <id>.webp        the full capture, for the picture viewer and wide screens
 *   <id>-1280.webp   for laptops
 *   <id>-640.webp    for phones
 *
 * A capture narrower than a step skips that step. The `<Screenshot>`
 * component offers all of them through `srcset`, so a phone downloads a few
 * dozen kilobytes instead of a desktop PNG; the viewer always opens the full
 * one. Transparency (the window's rounded corners and shadow) is kept.
 *
 * Remember the sizes in `worker/content/site.ts` if a capture changes size.
 *
 * Uses sharp, which is already installed as part of the dev server's tooling,
 * so it needs nothing added to package.json.
 */
import { readdirSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "public/screenshots");
const SOURCE = resolve(process.argv[2] ?? OUT);
const WIDTHS = [640, 1280];
// High enough that interface text stays crisp at 2x; WebP's alpha is lossless.
const QUALITY = 86;

mkdirSync(OUT, { recursive: true });
const files = readdirSync(SOURCE).filter((name) => name.endsWith("-light.png"));
if (files.length === 0) {
  console.error(`No <id>-light.png files in ${SOURCE}`);
  process.exit(1);
}

for (const file of files) {
  const id = file.replace(/-light\.png$/, "");
  const input = join(SOURCE, file);
  const { width } = await sharp(input).metadata();
  const written = [];

  await sharp(input)
    .webp({ quality: QUALITY, alphaQuality: 100 })
    .toFile(join(OUT, `${id}.webp`));
  written.push(`${width}`);
  for (const step of WIDTHS) {
    if (width <= step) continue;
    await sharp(input)
      .resize({ width: step })
      .webp({ quality: QUALITY, alphaQuality: 100 })
      .toFile(join(OUT, `${id}-${step}.webp`));
    written.push(`${step}`);
  }
  console.log(`${id}: ${written.join(", ")}`);
}
