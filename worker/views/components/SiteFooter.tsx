import { html } from "hono/html";

import { CONTACT } from "@server/content/site";
import { operatorName } from "@server/content/legal";
import { LOGO_ROWS } from "@views/components/Ui";

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
      { to: "/toolbox", name: "Toolbox" },
      { to: "/gallery", name: "Gallery" },
      { to: "/zap", name: "Build with Zap" },
      { to: "/teams", name: "For teams" },
      { to: "/pricing", name: "Pricing" },
      { to: "/downloads", name: "Download" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { to: "/security", name: "Security" },
      { to: "/pricing#compare", name: "Compare plans" },
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
 * The raised logo: the one object on the site that stands up off its
 * surface. An ink plinth carrying the mark's sixteen-by-four bricks, built
 * from the same rows as `LogoBricks` so it cannot drift from the artwork.
 */
const RaisedLogo = (appName: string) => html`
  <a
    href="/"
    class="logo-raised glow inline-block p-[clamp(0.9rem,2.4vw,1.5rem)] no-underline"
    aria-label="${appName} home"
  >
    <span
      class="grid w-max"
      style="grid-template-columns: repeat(16, var(--cell)); gap: calc(var(--cell) * 0.14); --cell: clamp(0.55rem, 2.1vw, 1.05rem);"
      aria-hidden="true"
    >
      ${LOGO_ROWS.flatMap((row) =>
        row
          .split("")
          .map((c) =>
            c === "O"
              ? html`<span class="brick" style="height: var(--cell);"></span>`
              : html`<span style="height: var(--cell);"></span>`,
          ),
      )}
    </span>
  </a>
`;

const linkClass =
  "inline-block py-1.5 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground hover:underline underline-offset-4";

/**
 * The footer sits in a well — the last piece of the page, cut into it — and
 * the logo stands raised inside it. Columns of links on the left, the logo
 * holding the right: asymmetric, like the hero it answers.
 */
export const SiteFooter = ({ appName, tagline }: { appName: string; tagline: string }) => html`
  <footer class="mt-auto px-3 pb-3 pt-8 sm:px-5 sm:pb-5">
    <div class="well mx-auto max-w-[96rem] overflow-hidden">
      <div class="mx-auto w-full max-w-7xl px-6 py-14 sm:px-10">
        <div class="grid gap-12 lg:grid-cols-12">
          <p
            class="emboss -mb-[0.06em] mt-6 select-none text-center font-display text-[31vw] font-bold leading-[0.8] tracking-[-0.04em] sm:text-[26vw] 2xl:text-[24rem]"
            aria-hidden="true"
          >
            ${appName}
          </p>
          <div class="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            ${COLUMNS.map(
              (column) => html`
                <div>
                  <h2
                    class="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    ${column.heading}
                  </h2>
                  <ul class="mt-3 space-y-0.5">
                    ${column.links.map(
                      (link) => html`
                        <li>
                          <a
                            href="${link.to}"
                            class="inline-block py-1.5 text-sm text-foreground no-underline underline-offset-4 hover:underline"
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
        </div>

        <div
          class="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            <span translate="no">© ${new Date().getFullYear()} ${operatorName()}.</span> All rights
            reserved.
          </p>

          <!-- On every page, because the privacy notice has to be reachable
               from wherever information is collected, not just from one. -->
          <ul class="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li><a href="/licence" class="${linkClass}">Licence</a></li>
            <li><a href="/privacy" class="${linkClass}">Privacy</a></li>
            <li>
              <a href="/third-party-notices.txt" class="${linkClass}">Open-source licences</a>
            </li>
            <li>
              <!-- Stays on the page, so grey — which, in this well, is white. -->
              <a
                href="#top"
                class="btn btn-grey inline-flex h-11 items-center gap-2 rounded-full px-4 text-xs font-semibold no-underline"
                aria-label="Back to top"
                ><i data-lucide="chevron-down" class="h-4 w-4 rotate-180" aria-hidden="true"></i>
                Top</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
`;
