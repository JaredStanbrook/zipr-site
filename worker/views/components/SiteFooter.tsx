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
      { to: "/pricing#compare", name: "Alone vs together" },
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

/**
 * The footer is the last tray on the page, with the name stamped into it at
 * the full width of the viewport — pressed in rather than printed, so it only
 * shows where the light catches its edges.
 */
export const SiteFooter = ({ appName, tagline }: { appName: string; tagline: string }) => html`
  <footer class="mt-auto px-2 pb-2 pt-8 sm:px-4 sm:pb-4">
    <div class="clay-tray mx-auto max-w-[96rem] overflow-hidden rounded-[2rem] sm:rounded-[3rem]">
      <div class="mx-auto w-full max-w-6xl px-6 pt-14 sm:px-10">
        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <a href="/" class="flex items-center gap-2 no-underline">
              <img src="/favicon.svg" alt="" width="28" height="28" class="h-7 w-7" />
              <span class="font-display text-2xl font-semibold">${appName}</span>
            </a>
            <p class="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              ${tagline || "For ideas that have to be run, not explained."}
            </p>
            <p
              class="clay-raised mt-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold"
            >
              <span class="h-2 w-2 rounded-full bg-success" aria-hidden="true"></span>
              The app is free. Always will be.
            </p>
          </div>

          ${COLUMNS.map(
            (column) => html`
              <div>
                <h2
                  class="font-sans text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"
                >
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
          class="mt-12 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>

          <p>Made for people whose best idea is stuck in their own head.</p>
        </div>
      </div>

      <p
        class="emboss -mb-[0.06em] mt-6 select-none text-center font-display text-[31vw] font-bold leading-[0.8] tracking-[-0.04em] sm:text-[26vw] 2xl:text-[24rem]"
        aria-hidden="true"
      >
        ${appName}
      </p>
    </div>
  </footer>
`;
