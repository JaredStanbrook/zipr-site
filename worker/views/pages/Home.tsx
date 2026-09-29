import type { FC } from "hono/jsx";

import { PILLARS, JOURNEY, ACTION_TYPES, TEAM_UNLOCKS } from "@server/content/features";
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
} from "@views/components/Ui";

/**
 * The home page has about eight seconds, and it is arguing one thing:
 *
 *   an idea that can only be described is an idea nobody else has had yet.
 *
 * So the order is the argument, not a feature tour.
 *
 *   1. The claim, in a sentence anyone can picture.
 *   2. A beat of quiet to let it land.
 *   3. What it takes to make an idea runnable — which is free.
 *   4. What it takes to let one travel — which is where the money is, framed
 *      as a promise rather than a catch.
 *
 * What it deliberately does not do is explain how any of it works. That was
 * the first version's failing: it read like a design document, which flatters
 * the engineer who wrote it and does nothing for the person deciding whether
 * to spend four minutes installing something.
 */

/**
 * The hero illustration: one catalogue, four teams, every row still saying
 * where it came from.
 *
 * That is the entire product argument in a picture, and it is why each row
 * leads with its origin rather than with its step count — boundaries blurred,
 * hierarchy intact. It is drawn rather than screenshotted, and says so.
 */
const CATALOGUE = [
  { name: "Open the on-call runbook", from: "Platform", steps: "1 step", icon: "link" },
  { name: "Spin up a staging stack", from: "Infrastructure", steps: "3 steps", icon: "terminal" },
  {
    name: "Rotate my API token",
    from: "Yours",
    steps: "3 steps, one confirmation",
    icon: "key-round",
  },
  {
    name: "Reset a customer sandbox",
    from: "Support",
    steps: "2 steps, asks first",
    icon: "rotate-ccw",
  },
];

/**
 * Drawn as a clay object: the window is a raised slab, its list is a well cut
 * into it, and each row is a small tile sitting in the well. The first row is
 * shown mid-hover with its play button lit, so the picture has a verb in it.
 * A few loose pieces float around it — the kind of thing that ends up on a
 * desk next to the thing you are making.
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

    <Card tone="floating" class="relative rotate-[0.6deg] p-3 sm:p-4">
      <div class="flex items-center gap-2 px-2 pb-3 pt-1">
        <span class="h-3 w-3 rounded-full bg-destructive/70 shadow-inset"></span>
        <span class="h-3 w-3 rounded-full bg-warning/70 shadow-inset"></span>
        <span class="h-3 w-3 rounded-full bg-success/70 shadow-inset"></span>
        <span class="ml-2 font-display text-sm font-semibold">Your catalogue</span>
        <Badge tone="brand" class="ml-auto">
          <i data-lucide="hard-drive" class="h-3 w-3" aria-hidden="true"></i>
          <span class="hidden sm:inline">Runs on this machine</span>
          <span class="sm:hidden">Local</span>
        </Badge>
      </div>

      <div class="clay-well space-y-2.5 rounded-[1.1rem] p-2.5 sm:p-3">
        {CATALOGUE.map((item, i) => (
          <div
            class={`rise flex items-center gap-3 rounded-[0.9rem] bg-card px-3 py-2.5 sm:gap-4 ${
              i === 0 ? "shadow-floating" : "shadow-raised"
            }`}
            style={`--i: ${i + 4};`}
          >
            <IconTile icon={item.icon} class="!h-9 !w-9 rotate-0" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-semibold">{item.name}</span>
              <span class="block truncate text-xs text-muted-foreground">
                <span class="font-semibold text-brand-subtle-foreground">{item.from}</span> ·{" "}
                {item.steps}
              </span>
            </span>
            <span
              class={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                i === 0 ? "clay-primary" : "bg-muted text-muted-foreground shadow-inset"
              }`}
              aria-hidden="true"
            >
              <i data-lucide="play" class="h-3.5 w-3.5"></i>
            </span>
          </div>
        ))}
      </div>
    </Card>

    <p class="mt-5 text-center text-xs text-muted-foreground">An illustration, not a screenshot.</p>
  </div>
);

export const HomePage: FC = () => (
  <Page>
    {/* ================= HERO ================= */}
    <Section class="pt-8 sm:pt-16">
      <Container size="wide">
        <div class="grid items-center gap-14 [&>*]:min-w-0 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <p class="rise" style="--i: 0;">
              <Badge tone="success" class="mb-7">
                <i data-lucide="circle-check" class="h-3 w-3" aria-hidden="true"></i>
                Free forever, no account
              </Badge>
            </p>

            <h1
              class="rise text-[2.9rem] leading-[0.98] text-balance sm:text-7xl lg:text-[5.25rem]"
              style="--i: 1;"
            >
              Some ideas can't be explained. They have to be <em>run.</em>
            </h1>

            <p
              class="rise mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl"
              style="--i: 2;"
            >
              Zipr takes the thing you worked out — the sequence, the trick, the shortcut nobody
              believes until they've seen it — and turns it into something a colleague can run on
              the first try.
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
              Windows and macOS. Takes a minute. Nothing to sign up for.
            </p>
          </div>

          <div class="rise" style="--i: 2;">
            <HeroPanel />
          </div>
        </div>
      </Container>
    </Section>

    {/* =================================================================
        MANIFESTO

        One beat of quiet between the pitch and the feature grid. No cards,
        no icons, no columns — the page earns the right to be loud later by
        being still here. The mark sits above the claim built out of clay
        bricks that zip shut as the page loads, which is the one piece of
        motion on the site that means something: it is what the logo depicts.
       ================================================================= */}
    <Section tone="muted">
      <Container size="default">
        <div class="text-center">
          <LogoBricks cell="clamp(0.7rem, 2.6vw, 1.05rem)" class="mx-auto mb-12" />
          <p class="font-display mx-auto max-w-4xl text-[2rem] leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
            Every team has an idea only one person can run.
          </p>
          <p class="font-display mt-3 text-[2rem] leading-[1.08] text-balance text-muted-foreground sm:text-5xl lg:text-6xl">
            It is usually the <em>best</em> one.
          </p>
          <p class="mx-auto mt-10 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Zipr exists to shorten the distance between one person having an idea and everybody else
            being able to run it.
          </p>
        </div>
      </Container>
    </Section>

    {/* ================= PILLARS ================= */}
    <Section>
      <Container size="wide">
        <SectionHeading
          align="center"
          eyebrow="What it's for"
          title="Out-of-the-box ideas have a habit of staying in one"
          lede="The unconventional one is always the hardest to explain, and the easiest to leave in a document nobody opens. Everything here is aimed at that gap."
        />

        <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PILLARS.map((pillar) => (
            <Card lift class="flex h-full flex-col p-6">
              <div class="flex items-start justify-between gap-3">
                <IconTile icon={pillar.icon} tone={pillar.tier === "api" ? "primary" : "brand"} />
                <Badge tone={pillar.tier === "api" ? "primary" : "neutral"}>
                  {pillar.tier === "api" ? "With a team" : "Free"}
                </Badge>
              </div>
              <h3 class="mt-5 text-xl leading-snug text-balance">{pillar.title}</h3>
              <p class="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {pillar.body}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* =================================================================
        ACTIONS

        The twelve verbs as keys on a keyboard, because that is what they
        are: the keys an item is typed out of. Each one gives under the
        pointer the way a key does.
       ================================================================= */}
    <Section tone="muted">
      <Container size="wide">
        <div class="grid gap-12 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
          <div class="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Twelve verbs</Eyebrow>
            <h2 class="text-3xl leading-[1.08] text-balance sm:text-[2.75rem]">
              If you can describe it, Zipr can <em>run</em> it.
            </h2>
            <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
              Stack the steps in any order. Ask a question halfway through and use the answer. Do
              one thing on a Mac and another on Windows, from the same item. And when the twelve are
              not enough, a plugin picks up where they stop.
            </p>
            <LinkButton href="/features" variant="outline" class="mt-6">
              See what it can do
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
      </Container>
    </Section>

    {/* =================================================================
        THE BOUNDARY

        The commercial argument, and the one worth being precise about: the
        thing a team buys is not sync, it is knowledge crossing a line that
        normally costs a ticket and a meeting to cross. Every clause is
        something the product genuinely does — a workspace per team, a
        published copy rather than a handover, roles and visibility that stay
        where the organisation already put them.
       ================================================================= */}
    <Section>
      <Container>
        <div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>Across the boundary</Eyebrow>
            <h2 class="text-3xl leading-[1.08] text-balance sm:text-[2.75rem]">
              Knowledge <em>moves.</em> The org chart stays put.
            </h2>
            <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
              What you need is usually two teams away, and reaching it normally costs a ticket, a
              meeting, or somebody's manager. Give your organisation a Zipr server and every team
              keeps its own workspace and its own rules, while the work crosses between them as a
              published copy — attributed, current, and safe to run.
            </p>
            <p class="mt-4 leading-relaxed text-muted-foreground text-pretty">
              Nobody joins a team to learn something from it. Nobody gives up ownership of anything.
            </p>
            <div class="mt-7 flex flex-wrap gap-3">
              <LinkButton href="/pricing">
                What a team costs
                <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
              </LinkButton>
              <LinkButton href="/security" variant="ghost">
                How we keep it safe
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

    {/* ================= THE PROMISE ================= */}
    <Section>
      <Container>
        <SectionHeading
          align="center"
          eyebrow="The honest version"
          title={
            <>
              Free alone. <em>Paid together.</em>
            </>
          }
          lede="Most tools hand you a hobbled free tier and wait for you to outgrow it. Zipr's free app is the whole app — have as many ideas as you like, forever. What costs money is the day one of them has to belong to more than you, and then you pick who runs the server."
        />

        <div class="relative">
          {/* The groove the three steps sit along. Outside the list, because
              an `<ol>` may only hold list items. */}
          <span
            class="absolute left-[8%] right-[8%] top-16 hidden h-2 rounded-full bg-muted shadow-inset md:block"
            aria-hidden="true"
          ></span>
          <ol class="relative grid gap-6 md:grid-cols-3">
            {JOURNEY.map((step) => (
              <li class="relative">
                <Card lift class="flex h-full flex-col p-7">
                  <div class="flex items-center justify-between">
                    <span class="emboss font-display text-6xl font-bold leading-none text-muted tabular">
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

    <CtaBand
      title="Start with the one you keep having to explain."
      body="The free app needs no account and is the same one paying teams run. Come back here the day the idea stops being only yours."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/pricing", label: "See pricing" }}
    />
  </Page>
);
