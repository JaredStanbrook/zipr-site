import type { FC } from "hono/jsx";

import { PILLARS, type Feature } from "@server/content/features";
import { ALL_STEPS_COUNT } from "@server/content/steps";
import { ToolboxTiles } from "@views/components/Toolbox";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  IconTile,
  Badge,
  CtaBand,
  Screenshot,
  LinkButton,
  Eyebrow,
} from "@views/components/Ui";
import type { ScreenshotId } from "@server/content/site";

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
    now: "You share it with the organisation and they run it. Your team still looks after it, so theirs stays current.",
  },
  {
    icon: "users",
    when: "A new starter joins on Monday",
    was: "A wiki page, three chat threads, a zip of scripts, and the same questions for a fortnight.",
    now: "They install Zipr, open the Library, and every shortcut the team runs is there, in its current version.",
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

/**
 * The app, one screen at a time: what each is for, beside what it looks like.
 * Alternating sides so the eye zig-zags down the page rather than reading a
 * column of pictures.
 */
const TOUR: { shot: ScreenshotId; eyebrow: string; title: string; body: string }[] = [
  {
    shot: "overlay-list",
    eyebrow: "The launcher",
    title: "One key press, then type",
    body: "Press your shortcut from anywhere, type, and press Return.",
  },
  {
    shot: "editor-steps",
    eyebrow: "Every shortcut",
    title: "Read it before you run it",
    body: "See every step a shortcut takes before you run it.",
  },
  {
    shot: "editor-branches",
    eyebrow: "The editor",
    title: "Let it take a different path",
    body: "Add an If or a menu, and the shortcut takes one path or another.",
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
          title="Build it once. Use it whenever you need it."
          lede="What Zipr does on its own for free, and what it adds when your team shares a server."
        />
        <Screenshot id="app-shortcuts" eager class="mx-auto mt-4 max-w-5xl" />
      </Container>
    </Section>

    {/* ================= TOUR ================= */}
    <Section>
      <Container size="wide">
        <SectionHeading
          eyebrow="A closer look"
          title="Built for the keyboard, clear at a glance"
          lede="The few screens you'll spend your time in."
        />
        <div class="space-y-20 lg:space-y-28">
          {TOUR.map((stop, i) => (
            <div class="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
              <div class={`lg:col-span-4 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <Eyebrow>{stop.eyebrow}</Eyebrow>
                <h3 class="text-3xl leading-[1.1] text-balance">{stop.title}</h3>
                <p class="mt-4 leading-relaxed text-muted-foreground text-pretty">{stop.body}</p>
              </div>
              <div class={`lg:col-span-8 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                <Screenshot
                  id={stop.shot}
                  class={stop.shot.startsWith("overlay") ? "mx-auto max-w-md" : ""}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Zap gets a pointer, not a summary: it has a page of its own. */}
        <Card class="mt-20 overflow-hidden lg:mt-28">
          <div class="grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-12">
            <div class="lg:col-span-5">
              <Eyebrow>Zap</Eyebrow>
              <h3 class="text-3xl leading-[1.1] text-balance">
                Or bring the idea, and ask Zap to build it.
              </h3>
              <p class="mt-4 leading-relaxed text-muted-foreground text-pretty">
                Zap, the helper that builds shortcuts from your words, turns an idea into a starting
                point for a shortcut, for you to test before you keep it.
              </p>
              <LinkButton href="/zap" variant="outline" class="mt-6">
                Ask Zap to build it
                <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
              </LinkButton>
            </div>
            <div class="lg:col-span-7">
              <Screenshot id="zap" />
            </div>
          </div>
        </Card>
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
          lede="Where good know-how usually gets lost — and what changes with Zipr."
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
          eyebrow="The toolbox"
          title="The steps a shortcut is built from"
          lede="Each step does one job. Put steps together, in any order, to make a shortcut that gets something useful done."
        />
        <ToolboxTiles columns="four" />
        <p class="mt-6 text-center text-sm text-muted-foreground text-pretty">
          <span translate="no">{ALL_STEPS_COUNT}</span> steps, by group.{" "}
          <a href="/toolbox" class="font-semibold text-primary underline underline-offset-4">
            See every step
          </a>
        </p>

        <Card class="mt-8 p-7">
          <div class="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "git-branch",
                title: "Decide what happens next",
                body: "Run a step only if the one before it worked, or only if it didn't, such as opening a help page.",
              },
              {
                icon: "monitor",
                title: "One shortcut for Windows and Mac",
                body: "If a step differs between them, mark it for Windows or for Mac. The same shortcut then works on both.",
              },
              {
                icon: "puzzle",
                title: "Go further with plugins",
                body: "When the built-in steps run out, a plugin adds a new one.",
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
      title="Build your first shortcut."
      body="Free, no account, no card. Come back the day somebody else asks how you did it."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/gallery", label: "Browse the Gallery" }}
    />
  </Page>
);
