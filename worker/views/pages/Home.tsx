import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import { HOW_IT_WORKS, TEAM_UNLOCKS, TRUST_POINTS } from "@server/content/features";
import { ALL_STEPS_COUNT, STEP_GROUPS } from "@server/content/steps";
import { ToolboxTiles } from "@views/components/Toolbox";
import { GalleryCarousel, OneClickStory, ZapDemo } from "@views/components/Motion";
import { PRICING_FAQ } from "@server/content/pricing";
import { ZAP_FAQ } from "@views/pages/Zap";
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
  CtaBand,
  Eyebrow,
  CheckItem,
  LogoBricks,
  EdgeShot,
  ScreenshotMarquee,
  Disclosure,
} from "@views/components/Ui";

/**
 * The home page has about eight seconds. In that time a visitor has to learn
 * what Zipr is, not just how it feels — so the order is the brand guide's,
 * which is also the order a first-time visitor's questions come in:
 *
 *   1. Hero         — what it is, who it's for, what to do next. The app
 *                     itself runs off the right-hand edge.
 *   1a. In use      — the real screens, sliding past; any one opens whole.
 *   2. Origin story — why it exists, in the maker's own words.
 *   3. How it works — build, run, share. Doubles as the pricing model.
 *   4. The toolbox  — the concrete proof: what a shortcut is made of.
 *   5. Gallery      — ideas by role, so a visitor sees their own work.
 *   6. Zap          — the helper that builds shortcuts from words.
 *   7. For teams    — what a server adds, and the four security facts.
 *   8. Download     — the two prices and the next step.
 *
 * Detail lives one click away: every benefit on /features, every example on
 * /gallery, the line-by-line comparison on /pricing, the full review answers
 * on /security. Each section here says one thing and says it once.
 */

/**
 * The hero's picture: the app itself, drawn wider than its column so it runs
 * off the right-hand edge of the page. Half on the page, half beyond — the
 * layout is asymmetric on purpose, and the clip says "there is more of this"
 * better than a framed thumbnail would. A click opens the whole of it.
 *
 * It used to be a pair of launcher pictures surrounded by floating clay
 * pieces. The page is flat now, and nothing floats.
 */
const HeroPanel: FC = () => (
  <figure>
    <EdgeShot id="editor-tour" edge="right" spill="170%" eager />
    <figcaption class="mt-3 text-xs text-muted-foreground">
      The Zipr editor, open on a shortcut that checks the VPN and starts by itself on weekdays.
    </figcaption>
  </figure>
);

const PROOF = [
  { icon: "monitor", text: "Windows and macOS" },
  { icon: "wifi-off", text: "Works offline" },
  { icon: "shield", text: "Nothing runs on a server" },
];

/**
 * The questions a first-time visitor asks next, answered with the site's own
 * existing answers rather than a second wording that could drift from them.
 */
export const HOME_FAQ = [PRICING_FAQ[0], PRICING_FAQ[3], ZAP_FAQ[0], ZAP_FAQ[2], PRICING_FAQ[4]];

const STEP_GROUP_COUNT = STEP_GROUPS.filter((group) => group.steps.length > 0).length;

export const HomePage: FC<{ app: AppConfig }> = ({ app }) => {
  const hosted = TIERS.find((tier) => tier.id === "cloud");
  const money = (cents: number) => formatPrice(cents, app.locale, app.currency);

  return (
    <Page>
      {/* ================= HERO =================
          Asymmetric: the words take seven columns on the left, the app takes
          the rest and keeps going past the edge of the page. */}
      <Section class="overflow-x-clip pt-6 sm:pt-12">
        <Container size="wide">
          <div class="grid items-center gap-12 [&>*]:min-w-0 lg:grid-cols-12 lg:gap-10">
            <div class="lg:col-span-6 xl:col-span-5">
              <h1
                class="rise text-[2.9rem] leading-[0.98] text-balance sm:text-7xl lg:text-[5rem]"
                style="--i: 1;"
              >
                Your computer tricks, in <em>one click.</em>
              </h1>

              <p
                class="rise mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl"
                style="--i: 2;"
              >
                Zipr turns the clever things you do on your computer into shortcuts you can run
                again and share with anyone who's ever asked, “How did you do that?” No code needed.
              </p>

              <div class="rise mt-9 flex flex-wrap gap-3" style="--i: 3;">
                <LinkButton href="/downloads" size="lg">
                  <i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i>
                  Download Zipr
                </LinkButton>
                <LinkButton href="/gallery" variant="outline" size="lg">
                  Browse the Gallery
                </LinkButton>
              </div>
            </div>

            <div class="rise lg:col-span-6 xl:col-span-7" style="--i: 2;">
              <HeroPanel />
            </div>
          </div>
        </Container>
      </Section>

      {/* ================= PROOF =================
          There are no customer logos or testimonials on this site yet, and none
          are invented to fill the gap. What a first-time visitor can verify is
          shorter and truer: what it runs on, what it costs, where it runs.
          Flat, ruled, in a row: facts, not badges. */}
      <section class="pb-4" aria-label="Facts about Zipr">
        <Container size="wide">
          <ul class="grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
            {PROOF.map((fact, i) => (
              <li
                data-reveal
                style={`--i: ${i};`}
                class="flex items-center gap-3 border-border py-5 sm:px-5 sm:[&:nth-child(even)]:border-l lg:[&:not(:first-child)]:border-l"
              >
                <IconTile icon={fact.icon} tone="brand" />
                <span class="text-sm font-semibold leading-snug text-balance">{fact.text}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* =================================================================
          ORIGIN STORY

          One beat of quiet between the pitch and the detail. The hero says
          what Zipr is; this says why it exists, in the maker's own words.
          The mark zips shut above it as the page loads — the one piece of
          motion on the site that means something.
         ================================================================= */}
      <Section id="origin">
        <Container size="wide">
          <div class="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div class="lg:col-span-6">
              <LogoBricks cell="clamp(0.7rem, 2.2vw, 1rem)" class="mb-12" />
              <Eyebrow>Why Zipr exists</Eyebrow>
              <h2 class="font-display max-w-3xl text-[2rem] leading-[1.04] text-balance sm:text-5xl lg:text-6xl">
                Everyone has something <em>worth sharing.</em>
              </h2>
            </div>
            <div class="space-y-5 self-end text-lg leading-relaxed text-muted-foreground text-pretty lg:col-span-6 lg:col-start-7">
              <p>
                At work, I noticed that people often had their own ways of doing the same things on
                a computer. Some methods were outdated. Others were inefficient or simply different.
                Often there was a better way, but that knowledge stayed with the person who had
                discovered it.
              </p>
              <p>
                That's why I built Zipr: a toolbox anyone can use to turn the way they work into a
                single button press. It saves time, cuts out repetitive tasks, and makes it easy to
                share useful shortcuts with friends and colleagues.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ================= HOW IT WORKS ================= */}
      <Section id="how-it-works" tone="muted">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="How it works"
            title={
              <>
                Build it. Run it. <em>Share it.</em>
              </>
            }
            lede="Create a shortcut from simple steps on your computer. Run it when you need it. Share it with anyone."
          />

          <div class="relative">
            <ol class="relative grid gap-6 md:grid-cols-3">
              {HOW_IT_WORKS.map((step, i) => (
                <li class="relative" data-reveal style={`--i: ${i};`}>
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
          FOUR STEPS. ONE CLICK.

          The whole idea in one scroll: four real steps, half off the page,
          come together and become the one button that runs them.
         ================================================================= */}
      <OneClickStory />

      {/* =================================================================
          THE TOOLBOX

          The groups of built-in steps slide past on their own — this is the
          concrete answer to "what can it actually do" — and can be grabbed
          and pulled either way; let go and they carry on. Every step is one
          click away on the toolbox page. Below, one shortcut built from them,
          run off the left-hand edge.
         ================================================================= */}
      <Section id="toolbox" class="overflow-x-clip">
        <Container size="wide">
          <div class="mb-6 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div class="lg:col-span-7">
              <Eyebrow>The toolbox</Eyebrow>
              <h2 class="text-3xl leading-[1.05] text-balance sm:text-[2.75rem]">
                Here’s what <em>Zipr</em> can do
              </h2>
            </div>
            <div class="lg:col-span-5">
              <p class="leading-relaxed text-muted-foreground text-pretty">
                Each step does one job. Combine them into a shortcut and make magic.{" "}
                <span translate="no" class="tabular">
                  {ALL_STEPS_COUNT}
                </span>{" "}
                steps in{" "}
                <span translate="no" class="tabular">
                  {STEP_GROUP_COUNT}
                </span>{" "}
                groups.
              </p>
              <LinkButton href="/toolbox" variant="outline" class="mt-5">
                See every step
                <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
              </LinkButton>
            </div>
          </div>
        </Container>

        <ToolboxTiles />

        <Container size="wide" class="mt-16">
          <figure class="grid items-center gap-8 [&>*]:min-w-0 lg:grid-cols-12">
            <div class="lg:col-span-7">
              <EdgeShot id="editor-branches" edge="left" spill="150%" />
            </div>
            <figcaption class="leading-relaxed text-muted-foreground text-pretty lg:col-span-4 lg:col-start-9">
              <span class="block font-display text-xl font-semibold text-foreground">
                One shortcut, two paths.
              </span>
              <span class="mt-2 block">
                It checks the VPN, then an If step takes the path that fits: open the intranet, or
                ask what to do.
              </span>
            </figcaption>
          </figure>
        </Container>
      </Section>

      {/* =================================================================
          IN USE

          The real screens, sliding past left to right and off the page. Each
          one can be grabbed, and any one — whole or half-way off the edge —
          opens on its own in the viewer.
         ================================================================= */}
      <Section id="in-use" class="overflow-x-clip">
        <Container size="wide">
          <div class="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div class="lg:col-span-7">
              <Eyebrow>In use</Eyebrow>
              <h2 class="text-3xl leading-[1.05] text-balance sm:text-[2.75rem]">
                Make it <em>yours.</em>
              </h2>
            </div>
          </div>
        </Container>
        <ScreenshotMarquee
          label="Screenshots of the Zipr app"
          direction="right"
          ids={[
            "overlay-list",
            "editor-steps",
            "run-history",
            "zap",
            "app-shortcuts",
            "overlay-grid",
          ]}
        />
      </Section>

      {/* =================================================================
          GALLERY PREVIEW

          "What could Zipr help me do in my job?" Three roles, one example
          each, with a way into the rest. The Gallery is a showcase of ideas,
          so the copy never says download or install.
         ================================================================= */}
      <Section id="gallery">
        <Container size="wide">
          <SectionHeading
            align="center"
            eyebrow="The Gallery"
            title="What could Zipr help you do at work?"
            lede="The Gallery shows what Zipr can help you do, with practical examples inspired by different roles, routines and everyday tasks."
          />
          <GalleryCarousel />
          <div class="mt-10 flex flex-wrap justify-center gap-3">
            <LinkButton href="/gallery" size="lg">
              Browse the Gallery
              <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
            </LinkButton>
          </div>
        </Container>
      </Section>

      {/* =================================================================
          ZAP

          The toolbox above is the vocabulary; Zap is the shortcut past
          learning it. One band, pointing at its own page: the argument for
          trusting it is too long to make here, and too important to make
          badly. Zap is explained where it is first named, and its button says
          what it does.
         ================================================================= */}
      <Section id="zap">
        <Container>
          <div class="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div class="lg:col-span-5">
              <Eyebrow>Describe it</Eyebrow>
              <h2 class="text-3xl leading-[1.08] text-balance sm:text-[2.75rem]">
                Got the idea? Let Zap build it.
              </h2>
              <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
                Zap is the AI that builds shortcuts from what you say. Describe what you want, test
                what it makes, then keep it. It never runs anything itself.
              </p>
              <LinkButton href="/zap" class="mt-6">
                Learn about Zap
                <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
              </LinkButton>
            </div>
            <div class="lg:col-span-7">
              <ZapDemo />
            </div>
          </div>
        </Container>
      </Section>

      {/* =================================================================
          FOR TEAMS

          What a team adds: shortcuts a team owns, and knowledge crossing a line
          that normally costs a ticket and a meeting to cross — without
          anyone's roles or ownership changing. The security facts sit here
          too, because the reviewer who reads this section asks for them next.
          There are no customer logos or testimonials on this site yet, and
          none are invented to fill the gap.
         ================================================================= */}
      <Section id="teams">
        <Container>
          <div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>For teams</Eyebrow>
              <h2 class="text-3xl leading-[1.08] text-balance sm:text-[2.75rem]">
                Make something useful. Share it with <em>your team.</em>
              </h2>
              <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
                Keep personal shortcuts on your own computer. With a team plan, create teams that
                share their shortcuts, so your organisation can organise people and control access.
              </p>
              <div class="mt-7 flex flex-wrap gap-3">
                <LinkButton href="/teams">
                  See how teams share
                  <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
                </LinkButton>
                <LinkButton href="/pricing" variant="outline">
                  See team pricing
                </LinkButton>
              </div>
            </div>

            <Card tone="well" class="flex flex-col justify-center p-6 sm:p-8">
              {/* Three teams, each its own pill, with a copy crossing the line
                  between two of them. The pills never merge — which is the
                  point being drawn. */}
              <div class="mb-8 flex items-center gap-2" aria-hidden="true">
                {["Platform", "Support", "Yours"].map((team, i) => (
                  <>
                    {i > 0 ? (
                      <span class="relative h-0.5 flex-1 bg-border-strong/50">
                        {i === 1 ? (
                          <span class="brick absolute left-1/2 top-1/2 -ml-2 -mt-2 h-4 w-4"></span>
                        ) : null}
                      </span>
                    ) : null}
                    <span class="rounded-full bg-background px-3 py-1.5 text-xs font-semibold sm:px-4">
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

          <div class="mt-16">
            <p class="mb-6 text-center text-sm font-semibold text-muted-foreground">
              Built for your security review
            </p>
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
          </div>
        </Container>
      </Section>

      {/* ================= DOWNLOAD =================
          The next step, with both prices beside it so nobody has to click
          through to learn whether the paid half is per person or per
          deployment. */}
      <Section id="download">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Download"
            title="Start free. Add your team when you’re ready."
            lede="The free app is the full app for one person. A team plan adds teams that share their shortcuts."
          />

          <div class="grid gap-6 md:grid-cols-2">
            {/* Free card – mostly fine */}
            <Card lift class="flex h-full flex-col p-7">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl">Zipr for you</h3>
              </div>
              <p class="mt-4 font-display text-5xl font-semibold tabular">{money(0)}</p>
              <p class="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                Everything one person can do on one computer. No account, no card, no expiry.
              </p>
              <LinkButton href="/downloads" variant="outline" class="mt-6 w-full">
                Download Zipr
              </LinkButton>
            </Card>

            {/* Team card – cleaned up */}
            <Card lift class="flex h-full flex-col p-7">
              <div class="flex items-center justify-between">
                <h3 class="text-2xl">Team plan</h3>
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
                Teams and shared shortcuts for your organisation. Hosted by us (billed yearly,
                minimum {hosted?.minimumSeats ?? 5} people) or self-hosted on your own
                infrastructure.
              </p>
              <LinkButton href="/pricing" class="mt-6 w-full">
                See team pricing
              </LinkButton>
            </Card>
          </div>
        </Container>
      </Section>

      {/* ================= FAQ ================= */}
      <Section id="faq">
        <Container size="wide">
          <div class="grid gap-10 lg:grid-cols-12">
            <div class="lg:col-span-4">
              <SectionHeading eyebrow="Questions" title="Asked and answered" />
            </div>
            <div class="lg:col-span-8">
              {HOME_FAQ.map((item) => (
                <Disclosure question={item.q}>{item.a}</Disclosure>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand
        title="Build your first shortcut."
        body="Start with the one you keep having to explain. Free, no account, and the same app paying teams run."
        primary={{ href: "/downloads", label: "Download Zipr" }}
        secondary={{ href: "/contact?topic=cloud", label: "Talk to us about a team" }}
      />
    </Page>
  );
};
