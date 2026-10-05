import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import { ACTION_TYPES, HOW_IT_WORKS, TEAM_UNLOCKS, TRUST_POINTS } from "@server/content/features";
import { TIERS } from "@server/content/pricing";
import { formatPrice } from "@views/lib/utils";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  IconTile,
  LinkButton,
  Badge,
  CtaBand,
  Eyebrow,
  CheckItem,
  LogoBricks,
  Screenshot,
  ScreenshotSwap,
} from "@views/components/Ui";

/**
 * The home page has about eight seconds. In that time a visitor has to learn
 * what Zipr is, not just how it feels — so the order is the questions a
 * first-time visitor asks, in the order they ask them:
 *
 *   1. Hero         — what it is, who it's for, what to do next.
 *   2. The problem  — the one-person process every team has.
 *   3. How it works — build, run, share. Doubles as the pricing model.
 *   4. Step types   — the concrete proof: what an item is made of.
 *   5. For teams    — what a server adds, and why that's the paid part.
 *   6. Security     — the four facts a reviewer asks first.
 *   7. Pricing      — the two numbers, with a link to the rest.
 *   8. Final CTA.
 *
 * Detail lives one click away: every benefit on /features, the line-by-line
 * comparison on /pricing, the full review answers on /security. Each section
 * here says one thing and says it once.
 */

/**
 * The hero: the launcher itself, in its two layouts, taking turns.
 *
 * It used to be a drawn catalogue, because there was nothing to photograph.
 * Now there is, and a picture of the real thing answers "what is this?"
 * faster than a picture that says it is only an illustration. The loose clay
 * pieces stay: they are the site's own furniture, and they are what keeps a
 * flat screenshot from sitting on the page like a pasted-in rectangle.
 */
const HeroPanel: FC = () => (
  <div class="relative mx-auto w-full max-w-xl lg:max-w-none">
    <span
      class="float absolute -left-5 -top-6 z-10 hidden sm:block"
      style="--r: -10deg; --d: -2s;"
      aria-hidden="true"
    >
      <IconTile icon="key-round" tone="brand" size="lg" />
    </span>
    <span
      class="float absolute -right-4 top-1/3 z-10 hidden sm:block"
      style="--r: 8deg; --d: -4s;"
      aria-hidden="true"
    >
      <IconTile icon="share-2" size="lg" />
    </span>
    <span
      class="brick float absolute -bottom-3 left-[18%] z-10 h-6 w-6"
      style="--r: 14deg; --d: -1s;"
      aria-hidden="true"
    ></span>
    <span
      class="brick float absolute -top-3 right-[22%] z-10 h-4 w-4"
      style="--r: -20deg; --d: -5s;"
      aria-hidden="true"
    ></span>

    <ScreenshotSwap ids={["overlay-list", "overlay-grid"]} class="relative" />

    <p class="-mt-8 text-center text-xs text-muted-foreground">
      The Zipr launcher, in its list and grid layouts.
    </p>
  </div>
);

export const HomePage: FC<{ app: AppConfig }> = ({ app }) => {
  const hosted = TIERS.find((tier) => tier.id === "cloud");
  const money = (cents: number) => formatPrice(cents, app.locale, app.currency);

  return (
    <Page>
      {/* ================= HERO ================= */}
      <Section class="pt-8 sm:pt-16">
        <Container size="wide">
          <div class="grid items-center gap-14 [&>*]:min-w-0 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <h1
                class="rise text-[2.9rem] leading-[0.98] text-balance sm:text-7xl lg:text-[5.25rem]"
                style="--i: 1;"
              >
                Turn the steps you keep explaining into <em>one click.</em>
              </h1>

              <p
                class="rise mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl"
                style="--i: 2;"
              >
                Zipr is a desktop launcher for Windows and macOS. Chain commands, links, apps and
                prompts into one named item — then hand it to a colleague instead of a walkthrough.
              </p>

              <div class="rise mt-9 flex flex-wrap gap-3" style="--i: 3;">
                <LinkButton href="/downloads" size="lg">
                  <i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i>
                  Download for free
                </LinkButton>
                <LinkButton href="/pricing" variant="outline" size="lg">
                  See pricing
                </LinkButton>
              </div>

              <p class="rise mt-6 text-sm text-muted-foreground" style="--i: 4;">
                Windows 10+ and macOS 12+. Installs in about a minute.
              </p>
            </div>

            <div class="rise" style="--i: 2;">
              <HeroPanel />
            </div>
          </div>
        </Container>
      </Section>

      {/* =================================================================
          THE PROBLEM

          One beat of quiet between the pitch and the detail. The hero says
          what Zipr is; this says why it needs to exist, in two lines and one
          sentence. The mark zips shut above it as the page loads — the one
          piece of motion on the site that means something.
         ================================================================= */}
      <Section tone="muted">
        <Container size="default">
          <div class="text-center">
            <LogoBricks cell="clamp(0.7rem, 2.6vw, 1.05rem)" class="mx-auto mb-12" />
            <p class="font-display mx-auto max-w-4xl text-[2rem] leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
              Every team has something only one person can run.
            </p>
            <p class="font-display mt-3 text-[2rem] leading-[1.08] text-balance text-muted-foreground sm:text-5xl lg:text-6xl">
              It's usually the <em>most useful</em> one.
            </p>
            <p class="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              It lives in a wiki page, a chat thread or somebody's head — so it gets explained,
              misread and explained again. Zipr turns it into something anyone can run.
            </p>
          </div>
        </Container>
      </Section>

      {/* ================= HOW IT WORKS ================= */}
      <Section id="how-it-works">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="How it works"
            title={
              <>
                Build it. Run it. <em>Share it.</em>
              </>
            }
            lede="The first two are free. The third is what teams pay for."
          />

          <div class="relative">
            {/* The groove the three steps sit along. Outside the list, because
                an `<ol>` may only hold list items. */}
            <span
              class="absolute left-[8%] right-[8%] top-16 hidden h-2 rounded-full bg-muted shadow-inset md:block"
              aria-hidden="true"
            ></span>
            <ol class="relative grid gap-6 md:grid-cols-3">
              {HOW_IT_WORKS.map((step) => (
                <li class="relative">
                  <Card lift class="flex h-full flex-col p-7">
                    <div class="flex items-center justify-between">
                      {/* Readable colour rather than the embossed style: sighted
                          visitors read the order from these, so they need text
                          contrast. Hidden from assistive tech, which gets the
                          order from the <ol>. */}
                      <span
                        class="font-display text-6xl font-bold leading-none text-muted-foreground tabular"
                        aria-hidden="true"
                      >
                        {step.step}
                      </span>
                      <Badge tone={step.cost === "Free" ? "success" : "primary"}>{step.cost}</Badge>
                    </div>
                    <h3 class="mt-5 text-2xl text-balance">{step.title}</h3>
                    <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                      {step.body}
                    </p>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      {/* =================================================================
          STEP TYPES

          The twelve step types as keys on a keyboard, because that is what
          they are: the keys an item is typed out of. This is the concrete
          answer to "what can it actually do", so it stays on the home page.
         ================================================================= */}
      <Section tone="muted">
        <Container size="wide">
          <div class="grid gap-12 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
            <div class="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow>Twelve step types</Eyebrow>
              <h2 class="text-3xl leading-[1.08] text-balance sm:text-[2.75rem]">
                If you can describe it, Zipr can <em>run</em> it.
              </h2>
              <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
                Chain steps in any order, ask a question midway and use the answer, and vary a step
                by operating system — all in one item. Plugins cover the rest.
              </p>
              <LinkButton href="/features" variant="outline" class="mt-6">
                See all features
                <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
              </LinkButton>
            </div>

            <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {ACTION_TYPES.map((action, i) => (
                <li class="keycap flex flex-col p-4">
                  <span class="font-mono text-[0.7rem] font-semibold text-primary tabular">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span class="mt-2 text-sm font-bold leading-snug">{action.name}</span>
                  <p class="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">
                    {action.blurb}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <figure class="mt-12 lg:mt-16">
            <Screenshot id="item-detail" class="mx-auto max-w-4xl" />
            <figcaption class="mt-4 text-center text-sm text-muted-foreground text-pretty">
              One item, three steps: ask first, run a command, open a page.
            </figcaption>
          </figure>
        </Container>
      </Section>

      {/* =================================================================
          ZAP

          The step types above are the vocabulary; Zap is the shortcut past
          learning it. One band, pointing at its own page: the argument for
          trusting it is too long to make here, and too important to make
          badly.
         ================================================================= */}
      <Section>
        <Container>
          <div class="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div class="lg:col-span-5">
              <Eyebrow>Zap</Eyebrow>
              <h2 class="text-3xl leading-[1.08] text-balance sm:text-[2.75rem]">
                You have the idea. Zap speaks <em>computer.</em>
              </h2>
              <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
                Say what you want in your own words. Zap works out how your computer does it — a
                link that writes the email, the command that clears the cache — and builds it for
                you to test. It never runs anything itself.
              </p>
              <LinkButton href="/zap" variant="outline" class="mt-6">
                Meet Zap
                <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
              </LinkButton>
            </div>
            <div class="lg:col-span-7">
              <Screenshot id="zap" />
            </div>
          </div>
        </Container>
      </Section>

      {/* =================================================================
          FOR TEAMS

          The commercial argument: what a team buys is not sync, it is
          knowledge crossing a line that normally costs a ticket and a meeting
          to cross — without anyone's roles or ownership changing.
         ================================================================= */}
      <Section tone="muted">
        <Container>
          <div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>For teams</Eyebrow>
              <h2 class="text-3xl leading-[1.08] text-balance sm:text-[2.75rem]">
                Knowledge <em>moves.</em> The org chart stays put.
              </h2>
              <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
                Give your organisation a Zipr server and each team keeps its own workspace and
                rules. Work crosses between them as a published copy — attributed, current and safe
                to run — instead of a ticket or a meeting.
              </p>
              <div class="mt-7 flex flex-wrap gap-3">
                <LinkButton href="/pricing">
                  See team pricing
                  <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
                </LinkButton>
              </div>
            </div>

            <Card class="flex flex-col justify-center p-6 sm:p-8">
              {/* Three teams, each in its own tray, with a copy crossing the
                  groove between two of them. The trays never merge — which is
                  the point being drawn. */}
              <div class="mb-8 flex items-center gap-2" aria-hidden="true">
                {["Platform", "Support", "Yours"].map((team, i) => (
                  <>
                    {i > 0 ? (
                      <span class="relative h-2 flex-1 rounded-full bg-muted shadow-inset">
                        {i === 1 ? (
                          <span
                            class="brick float absolute left-1/2 top-1/2 -ml-2 -mt-2 h-4 w-4"
                            style="--r: 8deg;"
                          ></span>
                        ) : null}
                      </span>
                    ) : null}
                    <span class="clay-well rounded-full px-3 py-1.5 text-xs font-semibold text-brand-subtle-foreground sm:px-4">
                      {team}
                    </span>
                  </>
                ))}
              </div>
              <ul class="space-y-3.5">
                {TEAM_UNLOCKS.map((unlock) => (
                  <CheckItem>{unlock}</CheckItem>
                ))}
              </ul>
            </Card>
          </div>
        </Container>
      </Section>

      {/* =================================================================
          SECURITY

          Technical credibility, stated as facts a reviewer can hold us to.
          There are no customer logos or testimonials on this site yet, and
          none are invented to fill the gap — these are the proof there is.
         ================================================================= */}
      <Section>
        <Container size="wide">
          <SectionHeading
            align="center"
            eyebrow="Security"
            title="Built for your security review"
            lede="The short answers to the questions your reviewer will ask first."
          />

          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_POINTS.map((point) => (
              <Card class="flex h-full flex-col p-6">
                <IconTile icon={point.icon} tone="brand" />
                <h3 class="mt-5 text-lg leading-snug text-balance">{point.title}</h3>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {point.body}
                </p>
              </Card>
            ))}
          </div>

          <p class="mt-8 text-center">
            <a
              href="/security"
              class="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-4"
            >
              Read the full security overview
              <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
            </a>
          </p>
        </Container>
      </Section>

      {/* ================= PRICING ================= */}
      <Section tone="muted">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Pricing"
            title={
              <>
                Free alone. <em>Paid together.</em>
              </>
            }
            lede="The free app is the whole app, not a trial. You pay only when an item has to be shared."
          />

          <div class="grid gap-6 md:grid-cols-2">
            <Card lift class="flex h-full flex-col p-7">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl">The app</h3>
                <Badge tone="success">Free</Badge>
              </div>
              <p class="mt-4 font-display text-5xl font-semibold tabular">{money(0)}</p>
              <p class="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                Everything one person can do on one machine. No account, no card, no expiry.
              </p>
              <LinkButton href="/downloads" variant="outline" class="mt-6 w-full">
                Download Zipr
              </LinkButton>
            </Card>

            <Card lift class="flex h-full flex-col p-7">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl">A team server</h3>
                <Badge tone="primary">Team</Badge>
              </div>
              {hosted?.annualMonthlyCents ? (
                <p class="mt-4 flex flex-wrap items-baseline gap-1.5">
                  <span class="text-sm font-medium text-muted-foreground">From</span>
                  <span class="font-display text-5xl font-semibold tabular">
                    {money(hosted.annualMonthlyCents)}
                  </span>
                  <span class="text-sm font-medium text-muted-foreground">/ person / month</span>
                </p>
              ) : null}
              <p class="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                Hosted by us, billed yearly, minimum {hosted?.minimumSeats ?? 5} people. Or
                self-hosted on your own infrastructure, priced per deployment.
              </p>
              <LinkButton href="/pricing" class="mt-6 w-full">
                Compare plans
              </LinkButton>
            </Card>
          </div>
        </Container>
      </Section>

      <CtaBand
        title="Start with the one you keep having to explain."
        body="Free, no account, and the same app paying teams run."
        primary={{ href: "/downloads", label: "Download Zipr" }}
        secondary={{ href: "/contact?topic=cloud", label: "Talk to us about a team" }}
      />
    </Page>
  );
};
