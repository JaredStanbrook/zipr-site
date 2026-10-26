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
 * For teams: what changes when sharing moves from files to a shared Library.
 *
 * The reader already knows the free app and is weighing team use, so the page
 * does not sell the app again or tell how a team comes about. It says what
 * sending a `.zipr` file cannot do, what a team's Library does instead, and
 * what it takes to start.
 *
 * Every claim is one the pricing comparison makes, or a fact of the app: a
 * `.zipr` import is a copy with new ids, and moving a shortcut into a team
 * moves it, leaving its keyboard shortcut and schedule on the computer they
 * were set on. Nothing here promises a feature that is not in that table.
 */

const CHANGES = [
  {
    topic: "Which version runs",
    files: "Everyone runs the copy they were sent, and the copies drift apart.",
    library: "There is one shortcut, and everyone runs its current version.",
  },
  {
    topic: "Fixing a shortcut",
    files: "A fix means sending the file again, and importing it makes a second copy.",
    library: "Save the fix and it reaches everyone, as you work.",
  },
  {
    topic: "Who can change it",
    files: "Anyone can edit their own copy.",
    library: "Roles decide who edits, and each team looks after its own shortcuts.",
  },
  {
    topic: "What changed, and when",
    files: "There is no record, so a broken copy is hard to trace.",
    library: "Full history, one-click rollback and an audit trail.",
  },
  {
    topic: "What people use",
    files: "You can't see who runs what.",
    library: "Usage figures show which shortcuts people actually run.",
  },
  {
    topic: "Paths, addresses and keys",
    files: "Each copy carries its own paths and addresses, and everyone brings their own AI key.",
    library:
      "Paths and addresses are set once for every shortcut, and one AI key can serve the team.",
  },
];

const START = [
  {
    icon: "server",
    title: "Choose where it runs",
    body: "Hosted by us, or on your own servers. Hosted starts at five people.",
  },
  {
    icon: "log-in",
    title: "Sign in from the app you have",
    body: "Everyone connects the app they already use, with your Google, Microsoft or Okta sign-in. There is nothing to reinstall.",
  },
  {
    icon: "folder-input",
    title: "Move your shortcuts in",
    body: "Move the ones you have been sending into a team. They move rather than copy, so from then on there is one version. Keyboard shortcuts and schedules stay on the computer they were set on.",
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
              From sending files to <em>one shared Library.</em>
            </>
          }
          lede="A .zipr file hands someone a copy. A team keeps one version of each shortcut in a Library everyone signs in to, kept current and looked after by the people who own it."
        />
        <div class="flex flex-wrap justify-center gap-3">
          <LinkButton href="/contact?topic=cloud" size="lg">
            Request access
          </LinkButton>
          <LinkButton href="/pricing" variant="outline" size="lg">
            See team pricing
          </LinkButton>
        </div>
      </Container>
    </Section>

    {/* ================= WHAT CHANGES ================= */}
    <Section tone="muted">
      <Container size="wide">
        <SectionHeading
          eyebrow="What changes"
          title="A copy each, or one shortcut for everyone"
          lede="Sending files works for a colleague or two. Past that, these are the differences you notice."
        />
        <ul class="grid gap-4 lg:grid-cols-2">
          {CHANGES.map((change) => (
            <li>
              <Card class="h-full p-6">
                <h3 class="text-lg">{change.topic}</h3>
                <dl class="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt class="text-xs font-semibold text-muted-foreground">Sending files</dt>
                    <dd class="mt-1 leading-relaxed text-muted-foreground text-pretty">
                      {change.files}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-xs font-semibold text-primary">A shared Library</dt>
                    <dd class="mt-1 leading-relaxed text-pretty">{change.library}</dd>
                  </div>
                </dl>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>

    {/* ================= THE LIBRARY ================= */}
    <Section>
      <Container size="wide">
        <div class="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div class="lg:col-span-5">
            <Eyebrow>The Library</Eyebrow>
            <h2 class="text-3xl leading-[1.08] text-balance sm:text-[2.75rem]">
              Everything your team runs, in one place.
            </h2>
            <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
              A new starter signs in and finds what the team uses, already up to date. Each team
              keeps its own shortcuts and can share one with the whole organisation, while still
              looking after it.
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

    {/* ================= GETTING STARTED ================= */}
    <Section tone="muted">
      <Container size="wide">
        <SectionHeading
          eyebrow="Getting started"
          title="Three steps, and the app stays the same"
          lede="Your team keeps the app it already uses. Personal shortcuts stay on each computer, and exporting a .zipr file still works."
        />
        <ol class="grid gap-5 md:grid-cols-3">
          {START.map((step, i) => (
            <li>
              <Card lift class="flex h-full flex-col p-6">
                <div class="flex items-center gap-3">
                  <IconTile icon={step.icon} tone="brand" />
                  <span class="font-mono text-xs font-semibold text-muted-foreground tabular">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 class="mt-4 text-xl">{step.title}</h3>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {step.body}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </Section>

    {/* ================= WHERE IT RUNS ================= */}
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Where it runs"
          title="Hosted by us, or run by you"
          lede="The same software either way. What differs is who operates it and how it is billed."
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
      title="Bring the shortcuts you already share."
      body="Request access, sign in from the app, and move them into a team."
      primary={{ href: "/contact?topic=cloud", label: "Request access" }}
      secondary={{ href: "/pricing", label: "See team pricing" }}
    />
  </Page>
);
