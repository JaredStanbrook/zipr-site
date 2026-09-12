import { html } from "hono/html";
import { PropsUser } from "@server/schema/auth.schema";
import { PUBLIC_NAV } from "@server/content/site";

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
    class="theme-toggle-btn inline-flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
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
 * UserMenu (Desktop)
 * Classic dropdown for the top bar.
 */
const UserMenu = ({ user }: { user: PropsUser }) => html`
  <div class="relative">
    <details class="group relative">
      <summary
        class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors list-none marker:hidden [&::-webkit-details-marker]:hidden border border-transparent focus:border-ring ring-offset-background"
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
        class="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in zoom-in-95 z-50"
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
    <header
      class="fixed top-0 left-0 right-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div class="flex h-14 items-center justify-between px-4">
        <div class="flex items-center gap-6">
          <a href="/" class="flex items-center gap-2 font-bold text-lg mr-4">
            <img src="/favicon.svg" alt="" width="24" height="24" class="h-6 w-6" />
            ${appName}
          </a>

          <nav class="hidden lg:flex items-center gap-6">
            ${menuItems.map(
              (item) => html`
                <a
                  href="${item.to}"
                  class="text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.to) ? "text-foreground" : "text-muted-foreground"
                  }"
                >
                  ${item.name}
                </a>
              `,
            )}
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <div class="hidden lg:block">${ThemeToggle()}</div>

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
                      class="clay-press inline-flex h-9 items-center justify-center rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-raised no-underline hover:brightness-110"
                      >Download</a
                    >
                  `
                : UserMenu({ user })
            }
          </div>

          <button
            id="mobile-menu-toggle"
            class="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Open menu"
          >
            <i data-lucide="menu" class="h-6 w-6"></i>
          </button>
        </div>
      </div>
    </header>

    <div
      id="mobile-menu"
      class="hidden fixed inset-0 z-[100] bg-background text-foreground lg:hidden flex flex-col animate-in slide-in-from-right-10 duration-200"
    >
      <div class="flex items-center justify-between px-4 h-14 border-b">
        <span class="font-bold text-lg flex items-center gap-2">
          <img src="/favicon.svg" alt="" width="24" height="24" class="h-6 w-6" />
          Menu
        </span>
        <button
          id="mobile-menu-close"
          class="p-2 rounded-md hover:bg-accent focus:outline-none"
          aria-label="Close menu"
        >
          <i data-lucide="x" class="h-6 w-6"></i>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        <nav class="flex flex-col gap-2">
          ${menuItems.map(
            (item) => html`
              <a
                href="${item.to}"
                class="flex items-center py-3 px-4 rounded-lg text-lg font-medium transition-colors hover:bg-accent ${
                  isActive(item.to) ? "bg-accent text-foreground" : "text-muted-foreground"
                }"
              >
                ${item.name}
                ${
                  isActive(item.to)
                    ? html`<i data-lucide="chevron-right" class="ml-auto h-5 w-5 opacity-50"></i>`
                    : ""
                }
              </a>
            `,
          )}
        </nav>

        <hr class="border-border/50" />

        <div class="mt-auto flex flex-col gap-6">
          <div class="flex items-center justify-between px-2">
            <span class="text-sm font-medium">Appearance</span>
            ${ThemeToggle()}
          </div>

          ${
            !user
              ? html`
                  <a
                    href="/downloads"
                    class="clay-press inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-sm)] bg-primary px-4 text-base font-semibold text-primary-foreground shadow-raised no-underline hover:brightness-110"
                  >
                    Download
                  </a>
                `
              : html`
                  <div class="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div class="p-4 flex items-center gap-3 border-b">
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
                    <div class="p-2 grid grid-cols-2 gap-2">
                      <a
                        href="/profile"
                        class="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                      >
                        <i data-lucide="user" class="h-4 w-4"></i> Profile
                      </a>
                      <button
                        hx-post="/web/auth/logout"
                        class="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <i data-lucide="log-out" class="h-4 w-4"></i> Log out
                      </button>
                    </div>
                  </div>
                `
          }
        </div>
      </div>
    </div>

    <script>
      (function () {
        const toggleBtn = document.getElementById("mobile-menu-toggle");
        const closeBtn = document.getElementById("mobile-menu-close");
        const menu = document.getElementById("mobile-menu");

        function openMenu() {
          menu.classList.remove("hidden");
          document.body.style.overflow = "hidden"; // Prevent background scroll
        }

        function closeMenu() {
          menu.classList.add("hidden");
          document.body.style.overflow = "";
        }

        if (toggleBtn) toggleBtn.addEventListener("click", openMenu);
        if (closeBtn) closeBtn.addEventListener("click", closeMenu);
      })();
    </script>
  `;
};
