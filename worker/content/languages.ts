// worker/content/languages.ts
//
// The languages the site can be read in, besides English.
//
// Eight, chosen as the usual set a desktop product is localised into: the
// four big European markets (Spanish, French, German, Italian), Brazilian
// Portuguese, Japanese, Korean and Simplified Chinese. All read left to right,
// so the layout needs no mirroring. To change the list, change it here and add
// or remove the matching `public/i18n/<code>.json` — nothing else names a
// language.
//
// English is the source: every page is written in it, the server only ever
// renders it, and translation happens in the visitor's browser from the
// catalogues in `public/i18n/`. See `components/lib/translate.ts`.

export interface Language {
  /** The file name under /i18n/ and the value remembered in the browser. */
  code: string;
  /** What goes in `<html lang>` once the page is translated. */
  htmlLang: string;
  /** For people writing about it. */
  english: string;
  /** What the language calls itself, which is what a reader scans for. */
  native: string;
}

export const LANGUAGES: Language[] = [
  { code: "es", htmlLang: "es", english: "Spanish", native: "Español" },
  { code: "fr", htmlLang: "fr", english: "French", native: "Français" },
  { code: "de", htmlLang: "de", english: "German", native: "Deutsch" },
  { code: "it", htmlLang: "it", english: "Italian", native: "Italiano" },
  { code: "pt", htmlLang: "pt-BR", english: "Portuguese (Brazil)", native: "Português (Brasil)" },
  { code: "ja", htmlLang: "ja", english: "Japanese", native: "日本語" },
  { code: "ko", htmlLang: "ko", english: "Korean", native: "한국어" },
  { code: "zh", htmlLang: "zh-Hans", english: "Chinese (Simplified)", native: "简体中文" },
];

/** Where the visitor's choice is remembered: local storage, like the theme. */
export const LANGUAGE_STORAGE_KEY = "zipr-lang";

/**
 * Pages that stay in English whatever was chosen.
 *
 * The legal pages, because a translation of a notice or a licence that nobody
 * qualified has checked is worse than the original; and the staff pages
 * (sign-in, profile, admin), which no visitor sees. A prefix match, so a page
 * added under `/admin` is excluded without anyone remembering to say so.
 */
const ENGLISH_ONLY = ["/privacy", "/licence", "/login", "/register", "/profile", "/admin", "/web"];

export const isTranslatablePath = (path: string | undefined): boolean => {
  const clean = (path ?? "/").split("?")[0].split("#")[0];
  return !ENGLISH_ONLY.some((prefix) => clean === prefix || clean.startsWith(`${prefix}/`));
};
