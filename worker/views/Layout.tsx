import { html, raw } from "hono/html";
import type { FC, Child } from "hono/jsx";
import { type PropsUser } from "@server/schema/auth.schema";
import type { AppConfig } from "@server/config/app.config";
import { jsonLdScript, type ResolvedMeta } from "@server/lib/seo";
import { isTranslatablePath, LANGUAGE_STORAGE_KEY } from "@server/content/languages";
import { NavBar } from "./components/NavBar";
import { SiteFooter } from "./components/SiteFooter";

interface LayoutProps {
  meta: ResolvedMeta;
  children?: Child;
  app: AppConfig;
  user?: PropsUser | null;
  currentPath?: string;
  headExtra?: Child;
  /**
   * Appended to the stylesheet URL so each deploy gets a new one. Its file
   * name is fixed (`static/main.css`), so without it the stylesheet could not
   * be cached for long; with it, `public/_headers` caches it for a year and a
   * deploy still reaches every browser at once. See lib/asset-version.ts.
   *
   * Not appended to `client.js`: the lazily loaded chunks import shared code
   * back from `/static/client.js` by that exact URL, and a browser treats
   * `client.js?v=…` as a different module — so it ran the whole bundle twice
   * and the second run failed to re-register its custom elements. The script
   * keeps one URL and is revalidated instead (a 304 when unchanged).
   */
  assetVersion: string;
}

export const Layout: FC<LayoutProps> = (props) => {
  const isProd = import.meta.env ? import.meta.env.PROD : true;

  return html`
    <!DOCTYPE html>
    <html
      lang="${props.meta.locale}"
      data-i18n="${isTranslatablePath(props.currentPath) ? "on" : "off"}"
      data-i18n-v="${props.assetVersion}"
    >
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${props.meta.title}</title>
        ${
          props.meta.description
            ? html`<meta name="description" content="${props.meta.description}" />`
            : ""
        }

        <!-- Points every variant of this page (trailing slash, ?q=…, utm tags)
             at one address, so a crawler ranks one page instead of splitting
             its signals across near-duplicates. -->
        <link rel="canonical" href="${props.meta.canonical}" />
        ${props.meta.noindex ? html`<meta name="robots" content="noindex, follow" />` : ""}

        <!-- Link previews. Without these a shared URL renders as a bare link. -->
        <meta property="og:type" content="${props.meta.type}" />
        <meta property="og:title" content="${props.meta.title}" />
        <meta property="og:url" content="${props.meta.canonical}" />
        <meta property="og:site_name" content="${props.meta.siteName}" />
        <meta property="og:locale" content="${props.meta.locale.replace("-", "_")}" />
        ${
          props.meta.description
            ? html`<meta property="og:description" content="${props.meta.description}" />`
            : ""
        }
        ${
          props.meta.image
            ? html`<meta property="og:image" content="${props.meta.image}" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="${props.meta.siteName}" />
                <meta name="twitter:card" content="summary_large_image" />`
            : html`<meta name="twitter:card" content="summary" />`
        }
        <meta name="twitter:title" content="${props.meta.title}" />
        ${
          props.meta.description
            ? html`<meta name="twitter:description" content="${props.meta.description}" />`
            : ""
        }
        ${props.meta.jsonLd.map(
          (data) =>
            html`<script type="application/ld+json">
              ${raw(jsonLdScript(data))}
            </script>`,
        )}

        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#f1ede6" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#191713" media="(prefers-color-scheme: dark)" />

        <!-- The two faces above the fold: the display face every H1 is set
             in (the largest text on most pages, so usually the LCP element)
             and the body face. Preloaded so the headline paints in its real
             font instead of swapping late and shifting. -->
        <link
          rel="preload"
          href="/fonts/fraunces-latin-soft.woff2"
          as="font"
          type="font/woff2"
          crossorigin
        />
        <link
          rel="preload"
          href="/fonts/plus-jakarta-sans-latin.woff2"
          as="font"
          type="font/woff2"
          crossorigin
        />
        ${
          isProd
            ? html`<link rel="stylesheet" href="/static/main.css?v=${props.assetVersion}" />`
            : html`<link rel="stylesheet" href="/worker/index.css" />`
        }
        <!-- If a language was chosen on an earlier visit, start fetching its
             catalogue now rather than when the bundle has loaded, so the page
             spends as little time in English as it can. Nothing here changes
             the page; ui/LanguageSwitcher.ts does that. -->
        <script>
          (function () {
            try {
              var code = localStorage.getItem("${LANGUAGE_STORAGE_KEY}");
              var root = document.documentElement;
              if (code && /^[a-z]{2}$/.test(code) && root.getAttribute("data-i18n") === "on") {
                var link = document.createElement("link");
                link.rel = "preload";
                link.as = "fetch";
                link.crossOrigin = "anonymous";
                link.href =
                  "/i18n/" +
                  code +
                  ".json?v=" +
                  encodeURIComponent(root.getAttribute("data-i18n-v") || "");
                document.head.appendChild(link);
              }
            } catch (error) {}
          })();
        </script>
        <script
          type="module"
          src="${isProd ? "/static/client.js" : "/worker/components/main.ts"}"
        ></script>
        ${props.headExtra}
      </head>
      <body class="bg-background text-foreground antialiased min-h-screen font-sans flex flex-col">
        <!-- First focusable thing on every page, so keyboard users can jump
             past the navigation (WCAG 2.4.1). Visible only when focused. -->
        <a
          href="#main-content"
          class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-card focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-floating"
          >Skip to content</a
        >
        <theme-provider defaultTheme="system"></theme-provider>

        ${
          props.meta.bare
            ? html`<header class="border-b">
                <div class="flex h-14 items-center px-4 font-bold text-lg">${props.app.name}</div>
              </header>`
            : NavBar({
                appName: props.app.name,
                user: props.user,
                currentPath: props.currentPath,
              })
        }

        <main hx-boost="true" id="main-content" tabindex="-1" class="relative flex-grow w-full">
          ${props.children}
        </main>
        <div id="modal-container"></div>

        <app-toaster></app-toaster>

        ${SiteFooter({ appName: props.app.name, tagline: props.app.tagline })}
      </body>
    </html>
  `;
};
