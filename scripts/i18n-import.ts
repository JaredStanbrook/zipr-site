/**
 * Adding translations to a language, and seeing what a language still needs.
 *
 *   npx tsx scripts/i18n-import.ts --list [CODE]
 *       Print the English sentences as `N|text`, numbered by position in
 *       i18n/source.json. With a language code, only those it is missing.
 *
 *   npx tsx scripts/i18n-import.ts CODE FILE
 *       Read `N|translation` lines from FILE and merge them into
 *       public/i18n/CODE.json. A line whose translation loses or repeats a
 *       link or emphasis placeholder is rejected and reported, not written.
 *
 * The numbering is the position in i18n/source.json, so a translator (a person
 * or a model) never has to copy an eight-character id correctly. Re-run
 * `npm run i18n:extract` first so the numbers match the pages as they are now.
 * A placeholder like `<1>…</1>` or `<2/>` stands for a link, emphasis or piece
 * of code in the English; it must appear in the translation exactly once, in
 * whatever position the language needs.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { LANGUAGES } from "../worker/content/languages";
import { sameShape } from "../worker/components/lib/translate";

const ROOT = join(import.meta.dirname, "..");
const source: [string, string][] = JSON.parse(
  readFileSync(join(ROOT, "i18n", "source.json"), "utf8"),
);

const cataloguePath = (code: string) => join(ROOT, "public", "i18n", `${code}.json`);
const load = (code: string): Record<string, string> =>
  existsSync(cataloguePath(code)) ? JSON.parse(readFileSync(cataloguePath(code), "utf8")) : {};

const [first, second] = process.argv.slice(2);

if (first === "--list") {
  const have = second ? load(second) : {};
  source.forEach(([id, text], index) => {
    if (!(id in have)) console.log(`${index + 1}|${text}`);
  });
  process.exit(0);
}

if (!first || !second || !LANGUAGES.some((language) => language.code === first)) {
  console.error("usage: i18n-import.ts --list [CODE]  |  i18n-import.ts CODE FILE");
  console.error(`languages: ${LANGUAGES.map((language) => language.code).join(", ")}`);
  process.exit(1);
}

const catalogue = load(first);
const seen = new Set<number>();
const problems: string[] = [];
let written = 0;

for (const [lineNumber, line] of readFileSync(second, "utf8").split("\n").entries()) {
  if (!line.trim()) continue;
  const bar = line.indexOf("|");
  const number = Number(line.slice(0, bar));
  const translation = line.slice(bar + 1).trim();
  if (bar < 1 || !Number.isInteger(number) || number < 1 || number > source.length) {
    problems.push(`line ${lineNumber + 1}: not "N|translation": ${line.slice(0, 60)}`);
    continue;
  }
  if (seen.has(number)) {
    problems.push(`line ${lineNumber + 1}: ${number} appears twice`);
    continue;
  }
  seen.add(number);
  const [id, english] = source[number - 1];
  if (!translation) problems.push(`${number}: empty (${english.slice(0, 50)})`);
  else if (!sameShape(english, translation)) {
    problems.push(
      `${number}: placeholders differ\n    en: ${english}\n    ${first}: ${translation}`,
    );
  } else {
    catalogue[id] = translation;
    written++;
  }
}

const sorted = Object.fromEntries(Object.entries(catalogue).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(cataloguePath(first), `${JSON.stringify(sorted, null, 2)}\n`);

const missing = source.filter(([id]) => !(id in sorted)).length;
console.log(
  `${first}: wrote ${written}; ${Object.keys(sorted).length} in the catalogue; ${missing} of ${source.length} still missing`,
);
if (problems.length) {
  console.log(`${problems.length} problem(s), not written:`);
  for (const problem of problems) console.log(`  ${problem}`);
  process.exitCode = 2;
}
