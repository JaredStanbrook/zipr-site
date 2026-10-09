/**
 * The language button's behaviour: remember a choice, and apply it.
 *
 * The button and its menu are server-rendered by `NavBar.tsx`, so they exist
 * before any script runs and need nothing here to open — the menu is a native
 * popover. This file does the rest: it marks the current language, and when a
 * language other than English is chosen it loads that language's catalogue
 * and translates the page (see `lib/translate.ts` for how).
 *
 * **The choice lives in local storage**, under one key, exactly as the theme
 * does, so it never leaves the visitor's device and needs no cookie. Choosing
 * a language reloads the page rather than translating it in place: the page
 * the server sends is always English, and going back to English or between
 * two languages from already-translated text would need the original kept
 * somewhere. A reload is the simplest thing that is always right.
 *
 * Pages that stay English whatever was chosen (`<html data-i18n="off">`, set by
 * the layout) are left alone, so the legal pages are never a translation
 * nobody checked.
 */

import { LANGUAGES, LANGUAGE_STORAGE_KEY } from "@server/content/languages";
import { hashKey, translateTree, type Catalogue } from "../lib/translate";

const root = document.documentElement;

const storedLanguage = (): string => {
  try {
    const value = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return LANGUAGES.some((language) => language.code === value) ? (value as string) : "en";
  } catch {
    // Private windows and blocked storage throw. English is a fine answer.
    return "en";
  }
};

const catalogues = new Map<string, Promise<Catalogue | null>>();

/** One request per language per page load, and the browser caches it for a year. */
const loadCatalogue = (code: string): Promise<Catalogue | null> => {
  let pending = catalogues.get(code);
  if (!pending) {
    const version = root.getAttribute("data-i18n-v") ?? "";
    pending = fetch(`/i18n/${code}.json?v=${encodeURIComponent(version)}`, {
      credentials: "same-origin",
    })
      .then((response) => (response.ok ? (response.json() as Promise<Catalogue>) : null))
      .catch(() => null);
    catalogues.set(code, pending);
  }
  return pending;
};

const active = storedLanguage();
const translatable = root.getAttribute("data-i18n") !== "off";

/** Translate `scope`, and the title and language of the page. */
const apply = async (scope: Element = document.body) => {
  if (active === "en" || !translatable) return;
  const catalogue = await loadCatalogue(active);
  if (!catalogue) return;

  translateTree(scope, catalogue);

  const title = catalogue[hashKey(document.title.replace(/\s+/g, " ").trim())];
  if (title) document.title = title;

  const language = LANGUAGES.find((entry) => entry.code === active);
  if (language) root.lang = language.htmlLang;
};

/** Mark the current language in the menu and on the button. */
const showCurrent = () => {
  for (const label of document.querySelectorAll("[data-language-label]")) {
    label.textContent = active.toUpperCase();
  }
  for (const option of document.querySelectorAll<HTMLElement>("[data-language]")) {
    const current = option.dataset.language === active;
    if (current) option.setAttribute("aria-current", "true");
    else option.removeAttribute("aria-current");
    option.querySelector("[data-language-check]")?.classList.toggle("hidden", !current);
  }
};

const choose = (code: string) => {
  if (code === active) {
    document.getElementById("language-menu")?.hidePopover?.();
    return;
  }
  try {
    if (code === "en") localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    else localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // Without storage the choice cannot be remembered, but it can still be
    // shown this once by reloading with nothing; there is nothing to do.
    return;
  }
  location.reload();
};

document.addEventListener("click", (event) => {
  const option = (event.target as Element | null)?.closest<HTMLElement>("[data-language]");
  if (option?.dataset.language) choose(option.dataset.language);
});

// Arrow keys move through the list, as in any menu; Escape is the popover's own.
document.addEventListener("keydown", (event) => {
  const menu = document.getElementById("language-menu");
  if (!menu || !menu.matches(":popover-open")) return;
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

  const options = Array.from(menu.querySelectorAll<HTMLElement>("[data-language]"));
  const at = options.indexOf(document.activeElement as HTMLElement);
  const next = event.key === "ArrowDown" ? at + 1 : at - 1;
  options[(next + options.length) % options.length]?.focus();
  event.preventDefault();
});

// Open on the current language, so a keyboard user starts where they are.
document.addEventListener(
  "toggle",
  (event) => {
    const menu = event.target as HTMLElement | null;
    if (menu?.id === "language-menu" && menu.matches(":popover-open")) {
      (menu.querySelector("[aria-current]") as HTMLElement | null)?.focus();
    }
  },
  true,
);

const start = () => {
  showCurrent();
  void apply();
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();

// A boosted link swaps new English into <main> without a page load.
document.body.addEventListener("htmx:afterSettle", (event) => {
  const target = (event as CustomEvent).target;
  void apply(target instanceof Element ? target : document.body);
});
