import type { FC } from "hono/jsx";

import { TEAM_UNLOCKS } from "@server/content/features";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  IconTile,
  CheckItem,
  LinkButton,
  CtaBand,
  Eyebrow,
  Screenshot,
} from "@views/components/Ui";

/**
 * For teams: how sharing grows from one person to a group.
 *
 * Zipr is useful to an individual first, and the page leads with that: the
 * team arrives at the end of the path, not as a prerequisite. The Catalogue
 * is the team's shared collection; the Gallery (a separate, public showcase)
 * is not mentioned here except as the place to find ideas.
 *
 * The capabilities listed are the ones the team server ships today and are the
 * same as the pricing comparison. Nothing here promises a feature that is not
 * in that table.
 */

const PATH = [
  {
    icon: "search",
    title: "Discover",
    body: "Someone sees a useful trick, or an example in the Gallery, and thinks: I could use that.",
  },
  {
    icon: "layers",
    title: "Build",
    body: "They make a shortcut for a task they do themselves. It's useful to them straight away.",
  },
  {
    icon: "message-circle",
    title: "Get asked",
    body: "A colleague notices the result and asks, “How did you do that?”",
  },
  {
    icon: "share-2",
    title: "Share",
    body: "They hand it over. The next person gets the same shortcut, not a description of it.",
  },
  {
    icon: "users",
    title: "Team",
    body: "Sharing becomes part of how the group works, in a Catalogue everyone can find.",
  },
];

export const TeamsPage: FC = () => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container>
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="For teams"
          title={
            <>
              Make something useful. <em>Share it</em> with someone.
            </>
          }
          lede="The Catalogue is your team's shared collection of shortcuts. Keep useful shortcuts organised so everyone can find and use them."
        />
        <div class="flex flex-wrap justify-center gap-3">
          <LinkButton href="/pricing" size="lg">
            See team pricing
          </LinkButton>
          <LinkButton href="/contact?topic=cloud" variant="outline" size="lg">
            Talk to us about a team
          </LinkButton>
        </div>
      </Container>
    </Section>

    {/* ================= THE PATH ================= */}
    <Section tone="muted">
      <Container size="wide">
        <SectionHeading
          eyebrow="How teams start"
          title="It starts with one person"
          lede="Zipr is useful before anyone invites anyone. Teams happen when what one person built gets noticed."
        />
        <ol class="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PATH.map((stage, i) => (
            <li>
              <Card lift class="flex h-full flex-col p-6">
                <div class="flex items-center gap-3">
                  <IconTile icon={stage.icon} tone="brand" />
                  <span class="font-mono text-xs font-semibold text-muted-foreground tabular">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 class="mt-4 text-xl">{stage.title}</h3>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {stage.body}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </Section>

    {/* ================= THE CATALOGUE ================= */}
    <Section>
      <Container size="wide">
        <div class="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div class="lg:col-span-5">
            <Eyebrow>The Catalogue</Eyebrow>
            <h2 class="text-3xl leading-[1.08] text-balance sm:text-[2.75rem]">
              One place your team's shortcuts live.
            </h2>
            <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
              A new starter opens the Catalogue and finds what the team runs, in its current
              version. Teams keep their own workspace and rules, and share work as a published copy
              that stays attributed and up to date.
            </p>
            <ul class="mt-6 space-y-3.5">
              {TEAM_UNLOCKS.map((unlock) => (
                <CheckItem>{unlock}</CheckItem>
              ))}
            </ul>
          </div>
          <div class="lg:col-span-7">
            <Screenshot id="app-shortcuts" />
          </div>
        </div>
      </Container>
    </Section>

    {/* ================= WHAT YOU NEED ================= */}
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="What you need"
          title="A Zipr server, hosted by us or run by you"
          lede="Sharing across a team uses a Zipr server. Everything else stays in the app you already have."
        />
        <div class="grid gap-5 md:grid-cols-2">
          <Card lift class="flex h-full flex-col p-7">
            <IconTile icon="cloud" tone="brand" />
            <h3 class="mt-5 text-2xl">Hosted</h3>
            <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
              We run it, patch it and back it up, in a database that belongs to your organisation
              alone. Billed per person.
            </p>
            <LinkButton href="/contact?topic=cloud" class="mt-6 w-full">
              Request access
            </LinkButton>
          </Card>
          <Card lift class="flex h-full flex-col p-7">
            <IconTile icon="server" tone="primary" />
            <h3 class="mt-5 text-2xl">Self-hosted</h3>
            <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
              Run it inside your own network, under your own backups, even with no internet. Priced
              per deployment, not per person.
            </p>
            <LinkButton href="/contact?topic=licence" variant="outline" class="mt-6 w-full">
              Talk to us
            </LinkButton>
          </Card>
        </div>
        <p class="mt-8 text-center text-sm text-muted-foreground">
          Want the details?{" "}
          <a
            href="/pricing#compare"
            class="font-semibold text-primary underline underline-offset-4"
          >
            Compare every feature
          </a>{" "}
          or{" "}
          <a href="/security" class="font-semibold text-primary underline underline-offset-4">
            read the security overview
          </a>
          .
        </p>
      </Container>
    </Section>

    <CtaBand
      title="Start with the one you keep having to explain."
      body="Build it free, then bring your team when they ask how you did it."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/gallery", label: "Browse the Gallery" }}
    />
  </Page>
);
