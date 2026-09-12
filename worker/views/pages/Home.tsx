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
 * The home page has about eight seconds. In order:
 *
 *   1. What it is, in one line anyone can picture.
 *   2. That it is free — said immediately, because it is the surprising part.
 *   3. What it feels like to use.
 *   4. Where the money is, framed as a promise rather than a catch.
 *
 * What it deliberately does not do is explain how any of it works. That was
 * the old version's failing: it read like a design document, which flatters
 * the engineer who wrote it and does nothing for the person deciding whether
 * to spend four minutes installing something.
 */

const HeroPanel: FC = () => (
  <div class="relative">
    <Card class="overflow-hidden p-0">
      <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-3">
        <span class="h-2.5 w-2.5 rounded-full bg-destructive/60"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-warning/60"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-success/60"></span>
        <span class="ml-2 text-xs font-medium text-muted-foreground">Platform team</span>
        <Badge tone="brand" class="ml-auto">
          <i data-lucide="hard-drive" class="h-3 w-3" aria-hidden="true"></i>
          On this machine
        </Badge>
      </div>

      <div class="divide-y divide-border">
        {[
          { name: "Open the on-call runbook", steps: "1 step", icon: "link" },
          { name: "Spin up a staging stack", steps: "3 steps", icon: "terminal" },
          { name: "Rotate my API token", steps: "3 steps, one confirmation", icon: "key-round" },
          { name: "Reset a customer sandbox", steps: "2 steps, asks first", icon: "rotate-ccw" },
        ].map((item) => (
          <div class="flex items-center gap-4 px-4 py-3.5">
            <IconTile icon={item.icon} class="h-9 w-9" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-semibold">{item.name}</span>
              <span class="block truncate text-xs text-muted-foreground">{item.steps}</span>
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
              Every tool your team uses. One keystroke away.
            </h1>

            <p class="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              The scripts, links and half-remembered command sequences your team runs on — gathered
              into one place, ready to launch, and instantly shareable when you want them to be.
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

    {/* ================= PILLARS ================= */}
    <Section tone="muted">
      <Container size="wide">
        <SectionHeading
          align="center"
          eyebrow="Why people keep it open"
          title="Built for the boring parts of the job"
          lede="The ten-step thing you do every fortnight and get wrong every third time. Zipr is where that goes."
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
    <Section>
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

    {/* ================= THE PROMISE ================= */}
    <Section tone="muted">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="The honest version"
          title="Free alone. Paid together."
          lede="Most tools hand you a hobbled free tier and wait for you to outgrow it. Zipr's free app is the whole app. You pay the day you want other people in it — and not before."
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

    {/* ================= TEAM ================= */}
    <Section>
      <Container>
        <div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>When the team needs it</Eyebrow>
            <h2 class="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Share it, and it stays shared.
            </h2>
            <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
              Put Zipr on your own servers and a catalogue stops being yours alone. Everyone gets
              the current version, edits do not overwrite each other, and every change can be
              undone. Your data stays on your infrastructure the whole time.
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

          <Card class="p-7">
            <ul class="space-y-3.5">
              {TEAM_UNLOCKS.map((unlock) => (
                <CheckItem>{unlock}</CheckItem>
              ))}
            </ul>
          </Card>
        </div>
      </Container>
    </Section>

    <CtaBand
      title="Start with the free app."
      body="No card, no account, no clock counting down. If it never leaves your machine, it never costs a thing."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/pricing", label: "See pricing" }}
    />
  </Page>
);
