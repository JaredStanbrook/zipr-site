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
 * Scenes, not specifications. The first version walked through a merge
 * algorithm step by step, which is fascinating exactly once and to about four
 * people — and handed the whole design to anyone considering building it.
 *
 * Each scene is one moment where an idea either travels or dies. That is the
 * order to read them in, and it is why the cross-team one comes first: it is
 * the moment the product exists for.
 */

const SCENES = [
  {
    icon: "share-2",
    when: "What you built would help another team",
    was: "You write it up, they misread step four, and you end up on the call anyway. Or — far more often — you never mention it at all.",
    now: "You publish a copy into their catalogue. They run it. Yours stays exactly where it was, and theirs stays current on its own.",
  },
  {
    icon: "users",
    when: "A new starter joins on Monday",
    was: "A wiki page, three chat threads and a zip of scripts, and then the same questions for a fortnight.",
    now: "They install Zipr, open the team catalogue, and everything the team runs is right there — in the version everyone else is on.",
  },
  {
    icon: "git-merge",
    when: "Two of you improve the same thing",
    was: "Last save wins. Somebody's work quietly disappears and nobody notices until it matters.",
    now: "Both improvements survive. If you genuinely changed the same line, you are told exactly what clashed and you decide.",
  },
  {
    icon: "history",
    when: "You want to try the strange version",
    was: "You don't, because undoing it means remembering what it looked like before and hoping you got it right.",
    now: "You try it. Every change is kept, so putting it back is a click — and an experiment that costs nothing gets run.",
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
          title="Everything an idea needs to survive other people"
          lede="Being a launcher is the least interesting thing about Zipr. What it is actually for is getting the thing in your head into somebody else's hands intact."
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
          title="Five afternoons you have already had"
          lede="None of these is a moment anybody schedules. They are just where good work gets lost, and where a tool either helps or is somewhere else."
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
      title="Four minutes to your first one."
      body="No account, no card, no clock. Build the thing you keep explaining, and come back to the pricing page the day somebody else wants it."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/pricing", label: "Compare free and team" }}
    />
  </Page>
);
