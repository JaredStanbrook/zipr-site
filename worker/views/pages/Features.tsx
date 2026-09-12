import type { FC } from "hono/jsx";

import { PILLARS, ACTION_TYPES } from "@server/content/features";
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
 * Scenes, not specifications. The previous version walked through a merge
 * algorithm step by step, which is fascinating exactly once and to about four
 * people — and handed the whole design to anyone considering building it.
 */

const SCENES = [
  {
    icon: "users",
    when: "A new starter joins on Monday",
    was: "You send them a wiki page, three Slack threads and a zip of scripts, then answer the same questions for a fortnight.",
    now: "They install Zipr, open the team catalogue, and everything the team runs is right there — current, and the same version everyone else has.",
  },
  {
    icon: "git-merge",
    when: "Two of you edit the same thing",
    was: "Last save wins. Somebody's work quietly disappears and nobody notices until it matters.",
    now: "Both sets of changes survive. If you genuinely changed the same line, you are told exactly what clashed and you decide.",
  },
  {
    icon: "history",
    when: "Something worked last week and doesn't now",
    was: "An archaeology session through chat history, trying to remember what changed.",
    now: "Open the history, see who changed what, put it back the way it was. A click, not an investigation.",
  },
  {
    icon: "wifi-off",
    when: "You're on a train with no signal",
    was: "The tool is a website, so the tool is gone.",
    now: "Everything is already on your laptop. Keep working; your changes catch up when you do.",
  },
];

export const FeaturesPage: FC = () => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container>
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Features"
          title="What you actually get"
          lede="A launcher for the work your team repeats, that happens to be very good at the parts other tools get wrong."
        />
      </Container>
    </Section>

    {/* ================= PILLARS ================= */}
    <Section tone="muted" class="pt-0 sm:pt-0">
      <Container size="wide">
        <div class="grid gap-5 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <Card class="flex h-full flex-col p-7">
              <div class="flex items-start justify-between gap-4">
                <IconTile icon={pillar.icon} />
                <Badge tone={pillar.tier === "client" ? "success" : "primary"}>
                  {pillar.tier === "client" ? "Free" : "With a team"}
                </Badge>
              </div>
              <h2 class="mt-5 text-xl font-bold text-balance">{pillar.title}</h2>
              <p class="mt-3 leading-relaxed text-muted-foreground text-pretty">{pillar.body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* ================= SCENES ================= */}
    <Section>
      <Container>
        <SectionHeading
          eyebrow="In practice"
          title="Four afternoons you have already had"
          lede="The difference is not that Zipr does something nobody else does. It is that these stop being events."
        />

        <div class="space-y-5">
          {SCENES.map((scene) => (
            <Card class="p-7">
              <div class="flex items-start gap-5">
                <IconTile icon={scene.icon} tone="brand" class="hidden sm:inline-flex" />
                <div class="min-w-0 flex-1">
                  <h3 class="text-lg font-bold text-balance">{scene.when}</h3>
                  <div class="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Without Zipr
                      </p>
                      <p class="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                        {scene.was}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-wider text-brand-subtle-foreground">
                        With it
                      </p>
                      <p class="mt-1.5 text-sm leading-relaxed text-pretty">{scene.now}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* ================= ACTIONS ================= */}
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="The building blocks"
          title="Twelve things an item can do"
          lede="Chain them in any order, branch on what happened, and vary the steps by operating system without making a second copy."
        />

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ACTION_TYPES.map((action) => (
            <Card class="p-5">
              <h3 class="font-semibold">{action.name}</h3>
              <p class="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                {action.blurb}
              </p>
            </Card>
          ))}
        </div>

        <Card class="mt-8 p-7">
          <div class="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "git-branch",
                title: "Branch as you go",
                body: "A step can run only if the last one worked, or only if it didn't. Stop, carry on, or say something.",
              },
              {
                icon: "monitor",
                title: "One item, every platform",
                body: "Different path on Windows? Say so once, in the same item, instead of maintaining two.",
              },
              {
                icon: "puzzle",
                title: "Go further with plugins",
                body: "When the twelve run out, a plugin picks up — kept at arm's length so a bad one can't take the app down.",
              },
            ].map((extra) => (
              <div>
                <IconTile icon={extra.icon} tone="brand" />
                <h3 class="mt-3 font-bold">{extra.title}</h3>
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
      title="It's free. Go and try it."
      body="Four minutes from here to your first item. Come back to the pricing page the day somebody else wants in."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/pricing", label: "Compare free and team" }}
    />
  </Page>
);
