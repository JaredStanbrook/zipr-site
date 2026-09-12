import type { FC } from "hono/jsx";

import { REPOS, CONTACT } from "@server/content/site";
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
  Eyebrow,
  TableFrame,
} from "@views/components/Ui";

/**
 * The page for someone who has stopped asking what Zipr is and started asking
 * how it fits. Architecture, deployment options, and what a client author
 * needs to know before writing one.
 *
 * It is an orientation page, not a manual: the manual is in the API
 * repository and stays there, because a copy here would drift within a month.
 */

const DEPLOY_OPTIONS = [
  {
    name: "Self-hosted",
    badge: "Default",
    tone: "primary" as const,
    summary: "You run Kratos alongside the API.",
    rows: [
      ["Identity data", "Your Postgres"],
      ["Databases", "Two — one for Zipr, one for Kratos"],
      ["Containers", "Nine, plus the login pages"],
      ["Upgrades and key rotation", "Yours"],
    ],
    body: "The architecture every decision is made for. If self-hosted and the alternative ever pull in different directions, self-hosted wins.",
  },
  {
    name: "Ory Network",
    badge: "Supported",
    tone: "neutral" as const,
    summary: "Ory runs the identity provider.",
    rows: [
      ["Identity data", "Ory's"],
      ["Databases", "One"],
      ["Containers", "Seven, plus the login pages"],
      ["Upgrades and key rotation", "Ory's"],
    ],
    body: "Pick this when you would rather not operate an identity provider, and accept that identity data lives with Ory. Same API, same login pages, same token exchange.",
  },
];

const CAPABILITY_FLAGS = [
  {
    flag: "sync, items, catalogues, workspaces, tags, revisions, audit",
    when: "Always on",
    detail: "The core. False only on an instance with no database, which cannot serve anything.",
  },
  {
    flag: "sse",
    when: "Needs Redis",
    detail:
      "The live event stream. Without it clients poll the sync endpoint instead — the stream was always the optimisation, never the contract.",
  },
  {
    flag: "plugin_distribution",
    when: "Needs object storage",
    detail:
      "Uploading and downloading plugin archives. Without it repositories and their metadata still work; sixteen routes are simply absent.",
  },
  {
    flag: "analytics",
    when: "Always on",
    detail:
      "Ingest can still answer 503 when Redis is down, which correctly tells a client to keep the batch rather than drop it.",
  },
];

const CLIENT_RULES = [
  {
    title: "Sync on launch, then incrementally",
    body: "One call with no parameters returns everything the user can see. Store the timestamp it gives back and pass it next time to get only what changed — including what was deleted and what the user lost access to.",
  },
  {
    title: "Send the whole item, not a patch",
    body: "Edits carry the revision they were made against. On a conflict you get the fields that actually collided, and a person resolves them.",
  },
  {
    title: "Retry with the same idempotency key",
    body: "A network failure is safe to retry. The server returns what the first attempt did rather than applying the write twice.",
  },
  {
    title: "Read the capabilities once",
    body: "Route groups are wired at startup and cannot appear or disappear while the server runs. Fetch the flags at sign-in, cache them for the session, and use them to decide what to show.",
  },
  {
    title: "Never confirm existence to someone unauthorised",
    body: "The API answers 404 rather than 403 for anything the caller cannot reach, so a client must not infer that a resource exists from the status code alone.",
  },
];

export const DocsPage: FC = () => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow="How it fits together"
          title="Architecture, deployment, and writing a client"
          lede="Enough to decide whether Zipr suits your organisation. The full reference — every endpoint, every header, every error — ships with the API, because a second copy here would be wrong within a month."
        />
      </Container>
    </Section>

    {/* ================= PIECES ================= */}
    <Section class="pt-0 sm:pt-0">
      <Container size="wide">
        <div class="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: "laptop",
              name: "The desktop client",
              body: "A Tauri shell over a standalone Rust connector. Caches the catalogue locally, works offline, holds a workspace no server owns, and executes every action itself.",
            },
            {
              icon: "server",
              name: "The API",
              body: "Go and Postgres. Stores, versions and shares items; resolves who may see what; merges concurrent writes. Executes nothing.",
            },
            {
              icon: "key-round",
              name: "Kratos",
              body: "The identity provider. A client exchanges its session for a bearer token the API verifies by signature — the API never sees a credential and never calls Kratos to check a request.",
            },
          ].map((piece) => (
            <Card class="p-6">
              <IconTile icon={piece.icon} tone="brand" />
              <h2 class="mt-4 text-lg font-bold">{piece.name}</h2>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {piece.body}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* ================= DEPLOY ================= */}
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Deployment"
          title="Two ways to have an identity provider"
          lede="They differ in exactly one thing — who runs Kratos. The API, the database, the login pages and the client's sign-in flow are identical either way."
        />

        <div class="grid gap-5 md:grid-cols-2">
          {DEPLOY_OPTIONS.map((option) => (
            <Card class="flex h-full flex-col p-7">
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-xl font-bold">{option.name}</h3>
                <Badge tone={option.tone}>{option.badge}</Badge>
              </div>
              <p class="mt-2 text-sm text-muted-foreground">{option.summary}</p>

              <dl class="mt-5 divide-y divide-border border-y border-border">
                {option.rows.map(([term, value]) => (
                  <div class="flex justify-between gap-4 py-2.5 text-sm">
                    <dt class="text-muted-foreground">{term}</dt>
                    <dd class="text-right font-medium text-pretty">{value}</dd>
                  </div>
                ))}
              </dl>

              <p class="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {option.body}
              </p>
            </Card>
          ))}
        </div>

        <Card class="mt-6 p-6">
          <div class="flex items-start gap-4">
            <i
              data-lucide="triangle-alert"
              class="mt-0.5 h-5 w-5 shrink-0 text-warning"
              aria-hidden="true"
            ></i>
            <p class="text-sm leading-relaxed text-muted-foreground text-pretty">
              There is no third mode. The API can be started with no identity provider at all for
              development, and it says so loudly at startup every single time — every email and
              display name comes back blank and invite-by-email refuses. It is a testing escape
              hatch, never a deployment.
            </p>
          </div>
        </Card>
      </Container>
    </Section>

    {/* ================= CAPABILITIES ================= */}
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Optional pieces"
          title="A deployment tells its clients what it can do"
          lede="Several route groups are registered only when their dependency is configured, and an unregistered route answers 404 — the same status as a resource you are not allowed to see. One endpoint resolves that ambiguity directly, so a client never has to guess."
        />

        <TableFrame>
          <table class="w-full min-w-[38rem] border-collapse text-left">
            <thead>
              <tr class="border-b border-border bg-muted/60">
                <th scope="col" class="px-5 py-3.5 text-sm font-semibold">
                  Capability
                </th>
                <th scope="col" class="px-5 py-3.5 text-sm font-semibold">
                  Requires
                </th>
                <th scope="col" class="px-5 py-3.5 text-sm font-semibold">
                  Without it
                </th>
              </tr>
            </thead>
            <tbody>
              {CAPABILITY_FLAGS.map((row) => (
                <tr class="border-b border-border last:border-0">
                  <th scope="row" class="px-5 py-4 align-top">
                    <code class="font-mono text-xs font-semibold text-primary wrap-anywhere">
                      {row.flag}
                    </code>
                  </th>
                  <td class="px-5 py-4 align-top text-sm whitespace-nowrap text-muted-foreground">
                    {row.when}
                  </td>
                  <td class="px-5 py-4 align-top text-sm leading-relaxed text-muted-foreground text-pretty">
                    {row.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableFrame>
      </Container>
    </Section>

    {/* ================= CLIENT AUTHORS ================= */}
    <Section tone="muted">
      <Container>
        <div class="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div>
            <Eyebrow>Writing your own client</Eyebrow>
            <h2 class="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              The API is the contract, not the desktop app.
            </h2>
            <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
              Zipr's own client is one consumer of a documented HTTP API, and nothing stops you
              writing another — a command-line tool, a bot, an internal dashboard. Five rules cover
              most of what a client author needs to get right.
            </p>
            {REPOS.showRepoLinks ? (
              <div class="mt-6 flex flex-wrap gap-3">
                <LinkButton
                  href={REPOS.api}
                  variant="outline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  API reference
                  <i data-lucide="external-link" class="h-4 w-4" aria-hidden="true"></i>
                </LinkButton>
                <LinkButton
                  href={REPOS.client}
                  variant="ghost"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  The desktop client
                  <i data-lucide="external-link" class="h-4 w-4" aria-hidden="true"></i>
                </LinkButton>
              </div>
            ) : null}
          </div>

          <ol class="space-y-4">
            {CLIENT_RULES.map((rule, index) => (
              <li>
                <Card class="flex gap-4 p-5">
                  <span
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle font-mono text-xs font-bold text-primary-subtle-foreground tabular"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span>
                    <span class="block font-semibold text-balance">{rule.title}</span>
                    <span class="mt-1 block text-sm leading-relaxed text-muted-foreground text-pretty">
                      {rule.body}
                    </span>
                  </span>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>

    {/* ================= SECURITY ================= */}
    <Section>
      <Container size="prose">
        <SectionHeading
          eyebrow="Security"
          title="Reporting something"
          lede="If you have found a vulnerability, mail it rather than opening an issue, and give us a way to reach you."
        />
        <Card class="p-7">
          <p class="text-sm leading-relaxed text-muted-foreground text-pretty">
            Send it to{" "}
            <a
              href={`mailto:${CONTACT.security}`}
              class="font-mono font-medium text-primary underline underline-offset-4 wrap-anywhere"
            >
              {CONTACT.security}
            </a>
            . We will confirm receipt, keep you posted while it is being fixed, and credit you when
            it ships unless you would rather we did not.
          </p>
          <p class="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty">
            Worth knowing before you start: the API never executes an action, makes an outbound
            request on a caller's behalf, or interprets a parameter's contents. If you have found
            something that makes it do any of those, that is exactly the kind of report we want.
          </p>
        </Card>
      </Container>
    </Section>

    <CtaBand
      title="Still deciding?"
      body="Install the client and use it for a week. It costs nothing, needs no account, and answers more than a documentation page can."
      primary={{ href: "/downloads", label: "Download the client" }}
      secondary={{ href: "/contact", label: "Ask us something" }}
    />
  </Page>
);
