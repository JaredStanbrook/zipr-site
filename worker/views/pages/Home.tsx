import type { FC } from "hono/jsx";

import { PILLARS, JOURNEY, ACTION_TYPES } from "@server/content/features";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  LinkButton,
  Badge,
  CtaBand,
  Eyebrow,
} from "@views/components/Ui";

/**
 * The home page makes one argument, in this order:
 *
 *   1. What Zipr is.
 *   2. That the client is free and complete on its own — said early, because
 *      it is the unusual part and burying it reads as a catch.
 *   3. Where the money is, and why it is there rather than somewhere else.
 *   4. What it does, in detail, for the reader still here.
 *
 * The diagram earns its place by carrying the one claim the prose cannot make
 * as quickly: which side of the line executes anything.
 */

const HeroPanel: FC = () => (
  <div class="relative">
    <Card class="overflow-hidden p-0">
      {/* A window chrome, so the panel below reads as the application rather
          than as decoration. */}
      <div class="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-3">
        <span class="h-2.5 w-2.5 rounded-full bg-destructive/60"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-warning/60"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-success/60"></span>
        <span class="ml-2 font-mono text-xs text-muted-foreground">Local workspace</span>
        <Badge tone="brand" class="ml-auto">
          <i data-lucide="hard-drive" class="h-3 w-3" aria-hidden="true"></i>
          On this machine
        </Badge>
      </div>

      <div class="divide-y divide-border">
        {[
          { name: "Open the on-call runbook", steps: "open_url", icon: "link" },
          { name: "Start the staging stack", steps: "run_command → open_url", icon: "terminal" },
          {
            name: "Rotate my API token",
            steps: "request_auth → run_exe → copy_to_clipboard",
            icon: "key-round",
          },
          {
            name: "Reset a customer sandbox",
            steps: "confirm_prompt → run_command",
            icon: "rotate-ccw",
          },
        ].map((item) => (
          <div class="flex items-center gap-4 px-4 py-3.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary-subtle text-primary-subtle-foreground">
              <i data-lucide={item.icon} class="h-4 w-4" aria-hidden="true"></i>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-semibold">{item.name}</span>
              <span class="block truncate font-mono text-xs text-muted-foreground">
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

    <p class="mt-3 text-center text-xs text-muted-foreground">
      An illustration of the client, not a screenshot.
    </p>
  </div>
);

/** Which side of the line does what. The one claim worth drawing. */
const BoundaryDiagram: FC = () => (
  <div class="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-6">
    <Card class="p-6">
      <Badge tone="primary">
        <i data-lucide="laptop" class="h-3 w-3" aria-hidden="true"></i>
        Your machine
      </Badge>
      <h3 class="mt-4 text-lg font-bold">The client</h3>
      <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
        <li>Holds a local workspace no server owns</li>
        <li>Caches everything the deployment has</li>
        <li>Chooses the variant for this operating system</li>
        <li>Resolves variables and prompts</li>
        <li class="font-semibold text-foreground">Executes every action</li>
      </ul>
    </Card>

    <div
      class="flex items-center justify-center gap-2 text-muted-foreground lg:flex-col"
      aria-hidden="true"
    >
      <i data-lucide="arrow-left-right" class="h-5 w-5 lg:hidden"></i>
      <i data-lucide="arrow-up-down" class="hidden h-5 w-5 lg:block"></i>
      <span class="font-mono text-xs whitespace-nowrap">sync</span>
    </div>

    <Card class="p-6">
      <Badge tone="brand">
        <i data-lucide="server" class="h-3 w-3" aria-hidden="true"></i>
        Your server
      </Badge>
      <h3 class="mt-4 text-lg font-bold">The API</h3>
      <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
        <li>Stores items, catalogues and workspaces</li>
        <li>Versions every write and keeps the history</li>
        <li>Merges concurrent edits</li>
        <li>Decides who may see what</li>
        <li class="font-semibold text-foreground">Executes nothing, ever</li>
      </ul>
    </Card>
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
              Free for one person, permanently
            </Badge>

            <h1 class="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              One catalogue of the things your team launches.
            </h1>

            <p class="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Zipr turns the scripts, links, commands and half-remembered sequences your team relies
              on into items anybody can run — kept in one place, versioned, and executed entirely on
              the machine that clicked.
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/downloads" size="lg">
                <i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i>
                Download the client
              </LinkButton>
              <LinkButton href="/pricing" variant="outline" size="lg">
                What it costs
              </LinkButton>
            </div>

            <p class="mt-5 text-sm text-muted-foreground">
              No account, no card, no network. The client is complete on its own — you only pay when
              you want other people in it.
            </p>
          </div>

          <HeroPanel />
        </div>
      </Container>
    </Section>

    {/* ================= THE COMMERCIAL SHAPE ================= */}
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="How it works commercially"
          title="Free alone. Paid together."
          lede="Most tools give you a crippled free tier and hope you outgrow it. Zipr's free client is the whole client — what costs money is the server that lets other people see your work, because that is the part that only matters once there are other people."
        />

        <ol class="grid gap-5 md:grid-cols-3">
          {JOURNEY.map((step) => (
            <li>
              <Card class="flex h-full flex-col p-6">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-sm font-bold text-muted-foreground tabular">
                    {step.step}
                  </span>
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

        <p class="mt-8 text-center text-sm text-muted-foreground">
          Step three costs{" "}
          <a href="/pricing" class="font-semibold text-primary underline underline-offset-4">
            $6 per person per month
          </a>
          , on a server you run. Steps one and two never expire.
        </p>
      </Container>
    </Section>

    {/* ================= THE BOUNDARY ================= */}
    <Section>
      <Container>
        <SectionHeading
          eyebrow="The line that shapes everything"
          title="The server stores your actions. It never runs them."
          lede="No outbound calls on your behalf, no interpreting a command, no substituting a value into a parameter. A reviewer asking what your catalogue server can reach has a short answer: your database, and nothing else."
        />
        <BoundaryDiagram />
      </Container>
    </Section>

    {/* ================= PILLARS ================= */}
    <Section tone="muted">
      <Container size="wide">
        <SectionHeading
          eyebrow="What you get"
          title="Built for the awkward parts"
          lede="Offline edits, two people on one item, and knowing what changed last Tuesday — the things that are easy to demo and hard to actually get right."
        />

        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PILLARS.map((pillar) => (
            <Card class="flex h-full flex-col p-6">
              <span class="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-primary-subtle text-primary-subtle-foreground">
                <i data-lucide={pillar.icon} class="h-5 w-5" aria-hidden="true"></i>
              </span>
              <h3 class="mt-4 font-bold text-balance">{pillar.title}</h3>
              <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {pillar.body}
              </p>
              <p class="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {pillar.tier === "client" ? "In the free client" : "Needs a deployment"}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* ================= ACTION TYPES ================= */}
    <Section>
      <Container>
        <div class="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <Eyebrow>The vocabulary</Eyebrow>
            <h2 class="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Twelve verbs, chained however you like.
            </h2>
            <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
              Each action declares which operating systems it applies to and how its parameters
              differ between them, so one item can be correct on a Mac and on a Windows laptop
              without being two items. Need something that is not here? A custom type is stored
              verbatim and interpreted by your own client.
            </p>
            <LinkButton href="/features" variant="outline" class="mt-6">
              All the detail
              <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
            </LinkButton>
          </div>

          <ul class="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {ACTION_TYPES.map((action) => (
              <li class="border-b border-border pb-3">
                <code class="font-mono text-sm font-semibold text-primary">{action.name}</code>
                <p class="mt-1 text-sm text-muted-foreground text-pretty">{action.blurb}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>

    <CtaBand
      title="Start with the free client."
      body="It installs in a minute, needs no account, and is the same binary a licensed team runs. If it never leaves your machine, it never costs anything."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/pricing", label: "See pricing" }}
    />
  </Page>
);
