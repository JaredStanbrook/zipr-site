import { html } from "hono/html";
import { PropsUser } from "@server/schema/auth.schema";
import { PUBLIC_NAV } from "@server/content/site";
import { LANGUAGES } from "@server/content/languages";

// --- CONFIGURATION ---
/**
 * Nav links per role. A user sees the union of the lists for every role they
 * hold, de-duplicated by href. `default` is what signed-out visitors get.
 *
 * This is the main thing to edit when you add a feature area to a new site.
 */
const menuConfig: Record<string, Array<{ to: string; name: string }>> = {
  // This is a marketing site, so `default` is the important one: almost every
  // visitor is signed out, and an empty nav for them would be the whole site
  // unreachable. Signed-in roles get the same public links plus their own.
  default: PUBLIC_NAV,
  user: PUBLIC_NAV,
  admin: [
    ...PUBLIC_NAV,
    { to: "/admin/releases", name: "Releases" },
    { to: "/admin/issues", name: "Bug reports" },
    { to: "/admin/logs", name: "System Logs" },
  ],
};

// --- COMPONENTS ---

/**
 * ThemeToggle
 * Robust logic with large touch targets for mobile.
 */
export const ThemeToggle = () => html`
  <button
    type="button"
    class="theme-toggle-btn btn btn-grey inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-btn)]"
    aria-label="Toggle theme"
  >
    <i data-theme-icon="light" data-lucide="sun" class="hidden w-5 h-5"></i>
    <i data-theme-icon="dark" data-lucide="moon" class="hidden w-5 h-5"></i>
    <i data-theme-icon="system" data-lucide="laptop" class="hidden w-5 h-5"></i>
  </button>

  <script>
    (function () {
      // 1. GUARD: Prevent script from running twice if component is rendered multiple times
      if (window.__theme_toggle_init) return;
      window.__theme_toggle_init = true;

      const THEMES = ["light", "dark", "system"];
      const STORAGE_KEY = "vite-ui-theme";
      const root = document.documentElement;

      function getButtons() {
        return document.querySelectorAll(".theme-toggle-btn");
      }

      let currentTheme = localStorage.getItem(STORAGE_KEY) || "system";
      if (!THEMES.includes(currentTheme)) currentTheme = "system";

      function applyTheme(theme) {
        root.classList.remove(...THEMES);
        if (theme === "system") {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          root.classList.toggle("dark", prefersDark);
        } else {
          root.classList.add(theme);
        }
      }

      function updateIcons(theme) {
        // 2. SYNC: Update icons on ALL buttons (Desktop & Mobile)
        const buttons = getButtons();
        buttons.forEach((btn) => {
          btn.querySelectorAll("[data-theme-icon]").forEach((icon) => {
            icon.classList.toggle("hidden", icon.dataset.themeIcon !== theme);
          });
        });

        // Provided by the client bundle (worker/components/main.ts).
        if (window.renderIcons) window.renderIcons();
      }

      function setTheme(theme) {
        localStorage.setItem(STORAGE_KEY, theme);
        currentTheme = theme;
        applyTheme(theme);
        updateIcons(theme);
      }

      document.addEventListener("DOMContentLoaded", () => {
        setTheme(currentTheme);

        // 3. EVENT DELEGATION: Listen on document to catch clicks on any toggle button
        document.addEventListener("click", (e) => {
          const btn = e.target.closest(".theme-toggle-btn");
          if (!btn) return;

          const nextIdx = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
          setTheme(THEMES[nextIdx]);
        });
      });

      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (currentTheme === "system") applyTheme("system");
      });
    })();
  </script>
`;

/**
 * The language button and its menu.
 *
 * Present on every page and at every width, because it is the way into the
 * site for someone who cannot read the English, and that person should not
 * have to find a menu first. The menu is a native popover: it opens, closes on
 * Escape and on a click outside, and sits above everything, with no script.
 * `components/ui/LanguageSwitcher.ts` marks the current language and applies a
 * choice.
 *
 * Each language is written in its own name and marked `translate="no"`, so it
 * is never translated into the language you are leaving, and `lang` lets a
 * screen reader pronounce it. The note at the bottom is translated like any
 * other text, and is honest about what these translations are.
 */
export const LanguageMenu = () => html`
  <div class="relative">
    <button
      type="button"
      popovertarget="language-menu"
      class="btn btn-grey inline-flex h-11 items-center justify-center gap-1.5 rounded-[var(--radius-btn)] px-3"
      aria-label="Choose a language"
    >
      <i data-lucide="languages" class="h-5 w-5" aria-hidden="true"></i>
      <span
        data-language-label
        translate="no"
        class="hidden text-xs font-bold tracking-wide sm:inline"
        aria-hidden="true"
        >EN</span
      >
    </button>

    <div
      id="language-menu"
      popover
      class="nav-glass fixed inset-auto m-0 max-h-[70svh] w-72 max-w-[calc(100vw-1rem)] overflow-y-auto p-1.5 text-popover-foreground"
    >
      <p
        class="px-3 pb-1 pt-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground"
      >
        Language
      </p>
      <ul>
        ${[{ code: "en", htmlLang: "en", native: "English" }, ...LANGUAGES].map(
          (language) => html`
            <li>
              <button
                type="button"
                data-language="${language.code}"
                lang="${language.htmlLang}"
                translate="no"
                class="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-accent focus-visible:bg-accent aria-[current=true]:font-semibold"
              >
                <span>${language.native}</span>
                <span data-language-check class="ml-auto hidden text-primary" aria-hidden="true"
                  >✓</span
                >
              </button>
            </li>
          `,
        )}
      </ul>
    </div>
  </div>
`;

/**
 * UserMenu (Desktop)
 * Classic dropdown for the top bar.
 */
const UserMenu = ({ user }: { user: PropsUser }) => html`
  <div class="relative">
    <details class="group relative">
      <summary
        class="btn btn-grey flex h-11 w-11 cursor-pointer items-center justify-center rounded-[var(--radius-btn)] list-none marker:hidden [&::-webkit-details-marker]:hidden"
      >
        <span class="font-bold text-sm text-primary"
          >${(user.email || "??").substring(0, 2).toUpperCase()}</span
        >
      </summary>

      <div
        class="fixed inset-0 z-40 hidden"
        onclick="this.parentNode.removeAttribute('open')"
      ></div>

      <div
        class="clay-floating absolute right-0 top-full mt-3 w-56 p-1.5 text-popover-foreground animate-in fade-in zoom-in-95 z-50"
      >
        <div class="px-2 py-1.5 text-sm">
          <div class="flex flex-col space-y-1">
            <p class="font-medium leading-none truncate">${user.displayName || "User"}</p>
            <p class="text-xs leading-none text-muted-foreground truncate">${user.email}</p>
          </div>
        </div>
        <div class="h-px bg-muted my-1"></div>
        <a
          href="/profile"
          class="flex w-full items-center rounded-sm px-2 py-2 text-sm hover:bg-accent transition-colors no-underline"
        >
          <i data-lucide="user" class="mr-2 h-4 w-4"></i> Profile
        </a>
        <div class="h-px bg-muted my-1"></div>
        <button
          hx-post="/web/auth/logout"
          class="flex w-full items-center rounded-sm px-2 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <i data-lucide="log-out" class="mr-2 h-4 w-4"></i> Log out
        </button>
      </div>
    </details>
  </div>
`;

// --- MAIN NAVBAR ---

interface NavBarProps {
  appName: string;
  user?: PropsUser | null;
  currentPath?: string;
}

const getMenuItems = (user: PropsUser | null | undefined) => {
  const items: { to: string; name: string }[] = [];
  const seen = new Set<string>();

  const roles = user?.roles ?? [];
  for (const role of roles) {
    for (const item of menuConfig[role] ?? []) {
      if (seen.has(item.to)) continue;
      seen.add(item.to);
      items.push(item);
    }
  }

  return items.length > 0 ? items : menuConfig.default;
};

export const NavBar = ({ appName, user, currentPath }: NavBarProps) => {
  const menuItems = getMenuItems(user);

  const isActive = (to: string) => {
    if (to === "/") return currentPath === to;
    return currentPath?.startsWith(to);
  };

  return html`
    <!--
      The header floats: a frosted, rounded rectangle held a little off the top
      edge, with the page blurred as it scrolls beneath. The active page is the
      one link in ink. On small screens the links drop down from it in a panel
      of the same glass, rather than taking over the screen.
    -->
    <header class="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
      <div class="nav-glass mx-auto flex h-14 max-w-7xl items-center justify-between pl-4 pr-2">
        <div class="flex items-center gap-4">
          <a href="/" class="group mr-2 flex items-center gap-2 no-underline">
            <img src="/favicon.svg" alt="" width="28" height="28" class="h-7 w-7" />
            <span class="wordmark text-xl">${appName}</span>
          </a>

          <nav class="hidden items-center gap-1 lg:flex">
            ${menuItems.map(
              (item) => html`
                <a
                  href="${item.to}"
                  aria-current="${isActive(item.to) ? "page" : "false"}"
                  class="btn rounded-[var(--radius-btn)] px-3.5 py-1.5 text-sm font-medium no-underline transition-colors ${
                    isActive(item.to)
                      ? "bg-ink text-ink-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                  }"
                >
                  ${item.name}
                </a>
              `,
            )}
          </nav>
        </div>

        <div class="flex items-center gap-2">
          <div class="hidden lg:block">
            ${
              !user
                ? html`
                    <!--
                      No sign-in link. This site has no customer accounts: the
                      only people who sign in are the ones publishing releases,
                      and they go straight to /admin. Advertising a login to
                      every visitor would imply an account they cannot have.
                    -->
                    <a
                      href="/downloads"
                      class="btn btn-important inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-btn)] px-4 text-sm font-semibold no-underline transition-colors"
                      ><span class="glass-glow" aria-hidden="true"></span
                      ><i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i> Download</a
                    >
                  `
                : UserMenu({ user })
            }
          </div>

          <button
            id="mobile-menu-toggle"
            type="button"
            class="btn btn-grey inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-btn)] lg:hidden"
            aria-label="Menu"
            aria-controls="mobile-menu"
            aria-expanded="false"
          >
            <i data-lucide="menu" data-menu-icon="closed" class="h-5 w-5" aria-hidden="true"></i>
            <i data-lucide="x" data-menu-icon="open" class="hidden h-5 w-5" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <!-- The small-screen menu: a frosted panel dropping from the bar. -->
      <div
        id="mobile-menu"
        class="nav-dropdown nav-glass mx-auto mt-2 max-h-[calc(100svh-5.5rem)] max-w-7xl overflow-y-auto p-2 lg:hidden"
      >
        <nav class="flex flex-col gap-0.5" aria-label="Main">
          ${menuItems.map(
            (item) => html`
              <a
                href="${item.to}"
                aria-current="${isActive(item.to) ? "page" : "false"}"
                class="btn flex items-center rounded-[var(--radius-btn)] px-4 py-3 font-display text-lg font-semibold no-underline transition-colors ${
                  isActive(item.to)
                    ? "bg-ink text-ink-foreground"
                    : "bg-transparent text-foreground hover:bg-accent"
                }"
              >
                ${item.name}
                <i
                  data-lucide="chevron-right"
                  class="ml-auto h-4 w-4 opacity-40"
                  aria-hidden="true"
                ></i>
              </a>
            `,
          )}
        </nav>

        <div class="mt-2 border-t border-border/70 p-2 pt-3">
          ${
            !user
              ? html`
                  <a
                    href="/downloads"
                    class="btn btn-important inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] px-4 text-base font-semibold no-underline transition-colors"
                    ><span class="glass-glow" aria-hidden="true"></span
                    ><i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i> Download</a
                  >
                `
              : html`
                  <div class="flex items-center gap-3 px-2 pb-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold"
                    >
                      ${(user.email || "??").substring(0, 2).toUpperCase()}
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="font-medium truncate">${user.displayName || "User"}</span>
                      <span class="text-xs text-muted-foreground truncate">${user.email}</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <a
                      href="/profile"
                      class="flex items-center justify-center gap-2 rounded-[var(--radius-btn)] px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                    >
                      <i data-lucide="user" class="h-4 w-4"></i> Profile
                    </a>
                    <button
                      hx-post="/web/auth/logout"
                      class="flex items-center justify-center gap-2 rounded-[var(--radius-btn)] px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <i data-lucide="log-out" class="h-4 w-4"></i> Log out
                    </button>
                  </div>
                `
          }
        </div>
      </div>
    </header>

    <script>
      (function () {
        // The small-screen menu drops down from the bar. It closes on a second
        // press, on Escape, on a click anywhere outside the header, and once a
        // link in it is followed (the header survives boosted navigation).
        var toggle = document.getElementById("mobile-menu-toggle");
        var menu = document.getElementById("mobile-menu");
        if (!toggle || !menu) return;
        var header = toggle.closest("header");

        function setOpen(open, restoreFocus) {
          menu.classList.toggle("is-open", open);
          toggle.setAttribute("aria-expanded", String(open));
          toggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
          toggle.querySelectorAll("[data-menu-icon]").forEach(function (icon) {
            icon.classList.toggle(
              "hidden",
              icon.getAttribute("data-menu-icon") !== (open ? "open" : "closed"),
            );
          });
          if (open) {
            var first = menu.querySelector("a, button");
            if (first) first.focus({ preventScroll: true });
          } else if (restoreFocus) {
            toggle.focus();
          }
        }
        var isOpen = function () {
          return menu.classList.contains("is-open");
        };

        toggle.addEventListener("click", function () {
          setOpen(!isOpen(), true);
        });
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && isOpen()) setOpen(false, true);
        });
        document.addEventListener("click", function (e) {
          if (isOpen() && header && !header.contains(e.target)) setOpen(false, false);
        });
        menu.addEventListener("click", function (e) {
          if (e.target.closest("a[href]")) setOpen(false, false);
        });
        window.matchMedia("(min-width: 1024px)").addEventListener("change", function (e) {
          if (e.matches) setOpen(false, false);
        });
      })();
    </script>
  `;
};
