import type { FC } from "hono/jsx";

import {
  STEP_GROUPS,
  ALL_STEPS_COUNT,
  AVAILABLE_STEPS_COUNT,
  groupCounts,
  type Step,
  type StepGroup,
} from "@server/content/steps";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  IconTile,
  Badge,
  LinkButton,
  CtaBand,
} from "@views/components/Ui";

/**
 * Every step, by group.
 *
 * One group per section, in the order the app's toolbox lists them, with a jump
 * bar at the top so a long page is still quick to use. Each step is a small
 * card: its name, how it reads aloud, and whether the app can run it yet.
 * "Coming" is said on the card itself — the library here is the whole plan, and
 * a visitor should not have to work out which part has shipped.
 *
 * Advanced steps sit in a collapsed disclosure, as the app does. Step names
 * and sentences are the app's own text, so they stay in English
 * (`translate="no"`); the descriptions around them translate as usual.
 */

const StepCard: FC<{ step: Step }> = ({ step }) => (
  <li class="keycap flex flex-col p-4">
    <div class="flex items-start justify-between gap-2">
      <h4 class="font-sans text-sm font-bold leading-snug tracking-normal" translate="no">
        {step.label}
      </h4>
      <Badge tone={step.status === "available" ? "success" : "neutral"} class="shrink-0">
        {step.status === "available" ? "Available" : "Coming"}
      </Badge>
    </div>
    <p class="mt-1.5 text-xs leading-relaxed text-muted-foreground" translate="no">
      {step.sentence}
    </p>
  </li>
);

const StepList: FC<{ group: StepGroup }> = ({ group }) => (
  <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {group.steps.map((step) => (
      <StepCard step={step} />
    ))}
  </ul>
);

const GroupSection: FC<{ group: StepGroup; index: number }> = ({ group, index }) => {
  const { total, available } = groupCounts(group);
  return (
    <Section id={group.id} tone={index % 2 === 0 ? "muted" : "default"} class="scroll-mt-24">
      <Container size="wide">
        <div class="mb-8 flex flex-wrap items-center gap-4">
          <IconTile icon={group.icon} tone="brand" size="lg" />
          <div class="min-w-0 flex-1">
            <h2 class="text-3xl leading-[1.1] text-balance" translate="no">
              {group.name}
            </h2>
            <p class="mt-1 text-muted-foreground text-pretty">{group.holds}</p>
          </div>
          {total > 0 ? (
            <Badge tone={available > 0 ? "success" : "neutral"}>
              <span translate="no">{available}</span> of <span translate="no">{total}</span>{" "}
              available
            </Badge>
          ) : null}
        </div>

        {total === 0 ? (
          <Card class="p-6 text-sm leading-relaxed text-muted-foreground text-pretty">
            Plugins can add their own steps, and those work like any other step.
          </Card>
        ) : group.advanced ? (
          <details class="group">
            <summary class="clay-raised inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full px-5 text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
              Show the {total} advanced steps
              <i
                data-lucide="chevron-down"
                class="h-4 w-4 transition-transform group-open:rotate-180"
                aria-hidden="true"
              ></i>
            </summary>
            <p class="mt-4 mb-5 max-w-2xl text-sm text-muted-foreground text-pretty">
              These may need more technical knowledge. You can build plenty without them.
            </p>
            <StepList group={group} />
          </details>
        ) : (
          <StepList group={group} />
        )}
      </Container>
    </Section>
  );
};

export const ToolboxPage: FC = () => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container>
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="The toolbox"
          title={
            <>
              Your computer can do more than you think. <em>Here's the toolbox.</em>
            </>
          }
          lede="Each step does one job. Put steps together to make a shortcut that gets something useful done. Here is every step, by group."
        />

        <div class="mx-auto -mt-4 flex max-w-2xl flex-col items-center gap-5 text-center">
          <p class="text-sm leading-relaxed text-muted-foreground text-pretty">
            Zipr runs <strong class="text-foreground">{AVAILABLE_STEPS_COUNT}</strong> of these
            today, and the rest of the <span translate="no">{ALL_STEPS_COUNT}</span> are on the way.
            Each step is marked, so you can see which is which.
          </p>
          <p class="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span class="inline-flex items-center gap-2">
              <Badge tone="success">Available</Badge> works in the app now
            </span>
            <span class="inline-flex items-center gap-2">
              <Badge tone="neutral">Coming</Badge> planned, not in the app yet
            </span>
          </p>
          <nav aria-label="Jump to a group" class="flex flex-wrap justify-center gap-2">
            {STEP_GROUPS.map((group) => (
              <a
                href={`#${group.id}`}
                translate="no"
                class="clay-raised inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium no-underline transition hover:text-primary"
              >
                {group.name}
              </a>
            ))}
          </nav>
        </div>
      </Container>
    </Section>

    {STEP_GROUPS.map((group, index) => (
      <GroupSection group={group} index={index} />
    ))}

    <Section>
      <Container size="prose">
        <div class="text-center">
          <h2 class="text-3xl leading-[1.1] text-balance sm:text-4xl">Not sure where to start?</h2>
          <p class="mt-4 leading-relaxed text-muted-foreground text-pretty">
            See what other people do with these steps in the Gallery, or describe what you want and
            ask Zap, the helper that builds shortcuts from your words, to build it.
          </p>
          <div class="mt-7 flex flex-wrap justify-center gap-3">
            <LinkButton href="/gallery">Browse the Gallery</LinkButton>
            <LinkButton href="/zap" variant="outline">
              Ask Zap to build it
            </LinkButton>
          </div>
        </div>
      </Container>
    </Section>

    <CtaBand
      title="Build your first shortcut."
      body="Free, no account, and every step above that's marked Available works today."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/features", label: "Explore what Zipr can do" }}
    />
  </Page>
);
