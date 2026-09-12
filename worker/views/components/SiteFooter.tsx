import { html } from "hono/html";

import { CONTACT } from "@server/content/site";

/**
 * The site footer.
 *
 * `html` rather than JSX because `Layout.tsx` is itself an `html` template and
 * interpolates this directly — mixing the two there produces the tagged
 * template's escaped string rather than rendered markup.
 */
const COLUMNS: Array<{ heading: string; links: Array<{ to: string; name: string }> }> = [
  {
    heading: "Product",
    links: [
      { to: "/features", name: "Features" },
      { to: "/downloads", name: "Downloads" },
      { to: "/pricing", name: "Pricing" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { to: "/security", name: "Security" },
      { to: "/pricing#compare", name: "Free vs team" },
      { to: "/report", name: "Report a bug" },
    ],
  },
  {
    heading: "Talk to us",
    links: [
      { to: "/contact", name: "Contact" },
      {
        to: `mailto:${CONTACT.address}?subject=${encodeURIComponent("Zipr licence enquiry")}`,
        name: "Licensing",
      },
      {
        to: `mailto:${CONTACT.address}?subject=${encodeURIComponent("Zipr security report")}`,
        name: "Security reports",
      },
    ],
  },
];

export const SiteFooter = ({ appName, tagline }: { appName: string; tagline: string }) => html`
  <footer class="mt-auto border-t border-border bg-muted/40">
    <div class="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <a href="/" class="flex items-center gap-2 text-lg font-bold no-underline">
            <img src="/favicon.svg" alt="" width="24" height="24" class="h-6 w-6" />
            ${appName}
          </a>
          <p class="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            ${tagline || "Every tool your team uses, one keystroke away."}
          </p>
          <p class="mt-4 text-sm font-medium text-foreground">The app is free. Always will be.</p>
        </div>

        ${COLUMNS.map(
          (column) => html`
            <div>
              <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ${column.heading}
              </h2>
              <ul class="mt-4 space-y-2.5">
                ${column.links.map(
                  (link) => html`
                    <li>
                      <a
                        href="${link.to}"
                        class="text-sm text-muted-foreground no-underline transition-colors hover:text-primary"
                        >${link.name}</a
                      >
                    </li>
                  `,
                )}
              </ul>
            </div>
          `,
        )}
      </div>

      <div
        class="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
      >
        <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>

        <p>Made for people who are tired of pasting scripts into chat.</p>
      </div>
    </div>
  </footer>
`;
