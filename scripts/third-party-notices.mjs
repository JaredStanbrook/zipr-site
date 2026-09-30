/**
 * Write public/third-party-notices.txt: the licence of every open-source
 * package whose code is shipped to visitors' browsers.
 *
 * MIT, ISC and BSD licences all ask the same thing of anyone redistributing
 * the code: keep the copyright notice and licence text with it. The client
 * bundle is minified and loses those comments, so this file carries them
 * instead, and the footer links it from every page.
 *
 * Server-only packages are not listed: code that runs in the Worker is not
 * distributed to anyone. The desktop app ships its own notices.
 *
 * Re-run after adding or upgrading a client-side dependency:
 *   node scripts/third-party-notices.mjs
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * What worker/components/ and worker/index.css pull into the browser
 * bundle. Their own dependencies are followed automatically.
 */
const ROOTS = [
  "htmx.org",
  "lit",
  "lucide",
  "@simplewebauthn/browser",
  "qrcode",
  "hono",
  "tailwindcss",
  "tw-animate-css",
];

/**
 * Dependencies that never reach the browser: `yargs` is qrcode's command-line
 * interface, and `@types/*` are type declarations with no runtime code.
 */
const EXCLUDE = [/^yargs/, /^@types\//];

/** Fonts are served from /fonts rather than bundled, under their own licence. */
const FONTS = ["Fraunces", "Plus Jakarta Sans", "JetBrains Mono"];

const ROOT = new URL("..", import.meta.url).pathname;
const MODULES = join(ROOT, "node_modules");

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const licenceText = (dir) => {
  const file = readdirSync(dir).find((name) => /^(licen[cs]e|copying)(\.|$)/i.test(name));
  return file ? readFileSync(join(dir, file), "utf8").trim() : null;
};

const seen = new Map();
const visit = (name) => {
  if (seen.has(name) || EXCLUDE.some((re) => re.test(name))) return;
  const dir = join(MODULES, name);
  if (!existsSync(join(dir, "package.json"))) return;
  const pkg = readJson(join(dir, "package.json"));
  seen.set(name, {
    name,
    version: pkg.version,
    licence: typeof pkg.license === "string" ? pkg.license : (pkg.license?.type ?? "UNKNOWN"),
    homepage: pkg.homepage ?? pkg.repository?.url ?? pkg.repository ?? "",
    text: licenceText(dir),
  });
  for (const dep of Object.keys(pkg.dependencies ?? {})) visit(dep);
};

ROOTS.forEach(visit);

const packages = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
const missing = packages.filter((p) => !p.text);
if (missing.length) {
  console.warn(`No licence file found for: ${missing.map((p) => p.name).join(", ")}`);
}

const rule = "=".repeat(78);
const out = [
  "THIRD-PARTY NOTICES",
  "",
  "This website includes the open-source software listed below. Each package",
  "is used under its own licence, reproduced in full after the summary.",
  "",
  `Fonts (${FONTS.join(", ")}) are used under the SIL Open Font License 1.1:`,
  "see /fonts/OFL.txt.",
  "",
  "Google, Microsoft Entra, Okta, Windows and macOS are trademarks of their",
  "respective owners. They are named on this site only to describe what Zipr",
  "works with, and their use does not imply endorsement.",
  "",
  rule,
  "SUMMARY",
  rule,
  ...packages.map((p) => `${p.name}@${p.version} — ${p.licence}`),
  "",
  ...packages.flatMap((p) => [
    rule,
    `${p.name}@${p.version} (${p.licence})`,
    typeof p.homepage === "string" && p.homepage ? p.homepage : "",
    rule,
    "",
    p.text ?? `Licensed under ${p.licence}. No licence file was included in the package.`,
    "",
  ]),
].join("\n");

writeFileSync(join(ROOT, "public", "third-party-notices.txt"), `${out}\n`);
console.log(`Wrote ${packages.length} packages to public/third-party-notices.txt`);
