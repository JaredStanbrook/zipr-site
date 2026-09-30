import type { FC } from "hono/jsx";

import { PILLARS, ACTION_TYPES, type Feature } from "@server/content/features";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  IconTile,
  Badge,
  CtaBand,
} from "@views/components/Ui";

/**
 * For the reader who is already interested and wants to know what they get.
 *
 * Three layers, in the order a reader decides: the benefits (split into what
 * is free and what a team adds, because that is the question behind every
 * one of them), the situations where they matter, and the building blocks.
 * Mechanism stays out — "both changes survive" is a benefit; how the merge
 * works is a design document.
 */

const SCENES = [
  {
    icon: "share-2",
    when: "What you built would help another team",
    was: "You write it up, they misread step four, and you end up on the call anyway — or you never mention it at all.",
    now: "You publish a copy into their catalogue and they run it. Yours stays where it was; theirs stays current.",
  },
  {
    icon: "users",
    when: "A new starter joins on Monday",
    was: "A wiki page, three chat threads, a zip of scripts, and the same questions for a fortnight.",
    now: "They install Zipr, open the team catalogue, and everything the team runs is there, in the current version.",
  },
  {
    icon: "git-merge",
    when: "Two of you improve the same thing",
    was: "Last save wins, and somebody's work quietly disappears.",
    now: "Both improvements survive. If you changed the same thing, you see exactly what clashed and decide.",
  },
  {
    icon: "history",
    when: "You want to try the strange version",
    was: "You don't, because undoing it means remembering what it looked like before.",
    now: "You try it. Every change is kept, so putting it back is one click.",
  },
  {
    icon: "wifi-off",
    when: "You're on a train with no signal",
    was: "The tool is a website, so the tool is gone.",
    now: "Everything is already on your laptop. Keep working; changes sync when you reconnect.",
  },
];

const PillarGrid: FC<{ tier: Feature["tier"] }> = ({ tier }) => (
  <div class="grid gap-5 sm:grid-cols-2">
    {PILLARS.filter((pillar) => pillar.tier === tier).map((pillar) => (
      <Card lift class="flex h-full flex-col p-7">
        <IconTile icon={pillar.icon} tone={tier === "api" ? "primary" : "brand"} />
        <h3 class="mt-5 text-2xl leading-snug text-balance">{pillar.title}</h3>
        <p class="mt-3 leading-relaxed text-muted-foreground text-pretty">{pillar.body}</p>
      </Card>
    ))}
  </div>
);

export const FeaturesPage: FC = () => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container>
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Features"
          title="Build it once. Let anyone run it."
          lede="What Zipr does on its own for free, and what it adds when your team shares a server."
        />
      </Container>
    </Section>

    {/* ================= BENEFITS ================= */}
    <Section tone="muted">
      <Container size="wide">
        <div class="mb-8 flex flex-wrap items-center gap-3">
          <h2 class="text-3xl">In the free app</h2>
          <Badge tone="success">Free</Badge>
        </div>
        <PillarGrid tier="client" />

        <div class="mb-8 mt-16 flex flex-wrap items-center gap-3">
          <h2 class="text-3xl">With a team server</h2>
          <Badge tone="primary">Team</Badge>
        </div>
        <PillarGrid tier="api" />
      </Container>
    </Section>

    {/* ================= SCENES ================= */}
    <Section>
      <Container>
        <SectionHeading
          eyebrow="In practice"
          title="Five situations you'll recognise"
          lede="Where good work usually gets lost — and what changes with Zipr."
        />

        {/* Each scene is a before and an after in clay terms: the way it
            was sits pressed into the card, flat and a little dim; the way it
            is now sits raised out of it, catching the light. */}
        <div class="space-y-6">
          {SCENES.map((scene, i) => (
            <Card lift class="p-6 sm:p-8">
              <div class="flex items-center gap-4">
                <IconTile icon={scene.icon} tone="brand" />
                <span class="font-mono text-xs font-semibold text-muted-foreground tabular">
                  {String(i + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}
                </span>
              </div>
              <h3 class="mt-5 text-2xl leading-snug text-balance sm:text-[1.75rem]">
                {scene.when}
              </h3>
              <div class="mt-6 grid gap-4 sm:grid-cols-2">
                <div class="clay-well rounded-[1.1rem] p-5">
                  <p class="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Without Zipr
                  </p>
                  <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {scene.was}
                  </p>
                </div>
                <div class="clay-raised rounded-[1.1rem] bg-brand-subtle p-5 text-brand-subtle-foreground">
                  <p class="text-[0.7rem] font-bold uppercase tracking-[0.16em]">With it</p>
                  <p class="mt-2 text-sm font-medium leading-relaxed text-pretty">{scene.now}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* ================= STEP TYPES ================= */}
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="The building blocks"
          title="Twelve step types"
          lede="Every item is built from these, chained in any order."
        />
        <ul class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {ACTION_TYPES.map((action, i) => (
            <li class="keycap p-4 sm:p-5">
              <span class="font-mono text-[0.7rem] font-semibold text-primary tabular">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 class="mt-2 font-sans text-sm font-bold tracking-normal sm:text-base">
                {action.name}
              </h3>
              <p class="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty sm:text-sm">
                {action.blurb}
              </p>
            </li>
          ))}
        </ul>

        <Card class="mt-8 p-7">
          <div class="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "git-branch",
                title: "Branch as you go",
                body: "Run a step only if the last one worked — or only if it didn't.",
              },
              {
                icon: "monitor",
                title: "One item, every platform",
                body: "Different path on Windows? Say so in the same item instead of keeping two.",
              },
              {
                icon: "puzzle",
                title: "Go further with plugins",
                body: "When the twelve run out, a plugin adds a new step type.",
              },
            ].map((extra) => (
              <div>
                <IconTile icon={extra.icon} tone="brand" />
                <h3 class="mt-4 text-xl">{extra.title}</h3>
                <p class="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {extra.body}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </Section>

    <CtaBand
      title="Build your first item in minutes."
      body="Free, no account, no card. Come back the day somebody else wants what you've built."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/pricing", label: "Compare free and team" }}
    />
  </Page>
);
