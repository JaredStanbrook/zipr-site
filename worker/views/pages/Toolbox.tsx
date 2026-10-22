import type { FC } from "hono/jsx";

import { STEP_GROUPS, ALL_STEPS_COUNT, type Step, type StepGroup } from "@server/content/steps";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  IconTile,
  LinkButton,
  CtaBand,
} from "@views/components/Ui";

/**
 * Every step, by group.
 *
 * One group per section, in the order the app's toolbox lists them, with a jump
 * bar at the top so a long page is still quick to use. Each step is a small
 * card: its name, what it does in plain words, and a realistic example.
 *
 * Advanced steps sit in a collapsed disclosure, as the app does. Step names and
 * these descriptions stay in English (`translate="no"`), like the names they
 * explain; the page text around them translates as usual.
 */

const StepCard: FC<{ step: Step }> = ({ step }) => (
  <li class="keycap flex flex-col p-4">
    <h4 class="font-sans text-sm font-bold leading-snug tracking-normal" translate="no">
      {step.label}
    </h4>
    {/* The description and example read like a person talking. The raw sentence
        template, with its {slots}, is only the fallback for a step with neither. */}
    <p class="mt-1.5 text-xs leading-relaxed text-muted-foreground" translate="no">
      {step.description ?? step.sentence}
    </p>
    {step.example ? (
      <p class="mt-2 text-xs leading-relaxed text-foreground/80" translate="no">
        <span class="font-semibold text-primary">Example:</span> {step.example}
      </p>
    ) : null}
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
  const total = group.steps.length;
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
            Here are all <span translate="no">{ALL_STEPS_COUNT}</span> steps, by group.
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
      body="Free, no account, and every step is one click away once you've built it."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/features", label: "Explore what Zipr can do" }}
    />
  </Page>
);
