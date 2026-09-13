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

const HeroPanel: FC = () => (
  <div class="relative">
    <Card class="overflow-hidden p-0">
      <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-3">
        <span class="h-2.5 w-2.5 rounded-full bg-destructive/60"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-warning/60"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-success/60"></span>
        <span class="ml-2 text-xs font-medium text-muted-foreground">Your catalogue</span>
        <Badge tone="brand" class="ml-auto">
          <i data-lucide="hard-drive" class="h-3 w-3" aria-hidden="true"></i>
          Runs on this machine
        </Badge>
      </div>

      <div class="divide-y divide-border">
        {CATALOGUE.map((item) => (
          <div class="flex items-center gap-4 px-4 py-3.5">
            <IconTile icon={item.icon} class="h-9 w-9" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-semibold">{item.name}</span>
              <span class="block truncate text-xs text-muted-foreground">
                <span class="font-medium text-brand-subtle-foreground">{item.from}</span> ·{" "}
                {item.steps}
              </span>
            </span>
            <i
              data-lucide="play"
              class="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            ></i>
          </div>
        ))}
      </div>
    </Card>

    <p class="mt-3 text-center text-xs text-muted-foreground">An illustration, not a screenshot.</p>
  </div>
);

export const HomePage: FC = () => (
  <Page>
    {/* ================= HERO ================= */}
    <Section class="pt-12 sm:pt-20">
      <Container size="wide">
        <div class="grid items-center gap-12 [&>*]:min-w-0 lg:grid-cols-2 lg:gap-16">
          <div>
            <Badge tone="success" class="mb-6">
              <i data-lucide="circle-check" class="h-3 w-3" aria-hidden="true"></i>
              Free forever, no account
            </Badge>

            <h1 class="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Some ideas can't be explained. They have to be run.
            </h1>

            <p class="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Zipr takes the thing you worked out — the sequence, the trick, the shortcut nobody
              believes until they've seen it — and turns it into something a colleague can run on
              the first try.
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/downloads" size="lg">
                <i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i>
                Download for free
              </LinkButton>
              <LinkButton href="/pricing" variant="outline" size="lg">
                See pricing
              </LinkButton>
            </div>

            <p class="mt-5 text-sm text-muted-foreground">
              Windows and macOS. Takes a minute. Nothing to sign up for.
            </p>
          </div>

          <HeroPanel />
        </div>
      </Container>
    </Section>

    {/* =================================================================
        MANIFESTO

        One beat of quiet between the pitch and the feature grid. No card,
        no icons, no columns — the page earns the right to be loud later by
        being still here, and the claim is strong enough to stand on its own
        line. The mark sits above it at low opacity as a signature rather
        than as branding.
       ================================================================= */}
    <Section tone="muted">
      <Container size="prose">
        <div class="text-center">
          <img
            src="/logo.svg"
            alt=""
            width="256"
            height="64"
            class="mx-auto mb-10 h-8 w-auto opacity-50"
          />
          <p class="text-2xl font-bold leading-snug tracking-tight text-balance sm:text-3xl">
            Every team has an idea only one person can run.
          </p>
          <p class="mt-2 text-2xl font-bold leading-snug tracking-tight text-balance text-muted-foreground sm:text-3xl">
            It is usually the best one.
          </p>
          <p class="mx-auto mt-8 max-w-xl leading-relaxed text-muted-foreground text-pretty">
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

        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PILLARS.map((pillar) => (
            <Card class="flex h-full flex-col p-6">
              <IconTile icon={pillar.icon} />
              <h3 class="mt-4 font-bold text-balance">{pillar.title}</h3>
              <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {pillar.body}
              </p>
              {pillar.tier === "api" ? (
                <p class="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
                  With a team
                </p>
              ) : (
                <p class="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Free
                </p>
              )}
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* ================= ACTIONS ================= */}
    <Section tone="muted">
      <Container>
        <div class="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <Eyebrow>Twelve verbs</Eyebrow>
            <h2 class="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              If you can describe it, Zipr can run it.
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

          <ul class="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {ACTION_TYPES.map((action) => (
              <li class="border-b border-border pb-3">
                <span class="text-sm font-semibold">{action.name}</span>
                <p class="mt-0.5 text-sm text-muted-foreground text-pretty">{action.blurb}</p>
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
            <h2 class="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Knowledge moves. The org chart stays put.
            </h2>
            <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
              What you need is usually two teams away, and reaching it normally costs a ticket, a
              meeting, or somebody's manager. Put Zipr on your own servers and every team keeps its
              own workspace and its own rules, while the work crosses between them as a published
              copy — attributed, current, and safe to run.
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

          <Card class="flex flex-col justify-center p-7">
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
          title="Free alone. Paid together."
          lede="Most tools hand you a hobbled free tier and wait for you to outgrow it. Zipr's free app is the whole app — have as many ideas as you like, forever. What costs money is the day one of them has to belong to more than you."
        />

        <ol class="grid gap-5 md:grid-cols-3">
          {JOURNEY.map((step) => (
            <li>
              <Card class="flex h-full flex-col p-6">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-muted-foreground tabular">{step.step}</span>
                  <Badge tone={step.cost === "Free" ? "success" : "primary"}>{step.cost}</Badge>
                </div>
                <h3 class="mt-4 text-lg font-bold text-balance">{step.title}</h3>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {step.body}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </Section>

    <CtaBand
      title="Start with the one you keep having to explain."
      body="The free app needs no account and is the same one licensed teams run. Come back here the day the idea stops being only yours."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/pricing", label: "See pricing" }}
    />
  </Page>
);
