import type { FC } from "hono/jsx";

import { PILLARS, ACTION_TYPES, LOCAL_LIMITS } from "@server/content/features";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  IconTile,
  Badge,
  CtaBand,
  CheckItem,
} from "@views/components/Ui";

/**
 * The detail page, for a reader who is already interested.
 *
 * It ends on what the free client *cannot* do, deliberately. Someone
 * evaluating a self-hosted product will find those limits within an hour of
 * installing; finding them here first is the difference between an expectation
 * and a disappointment.
 */

const CONCURRENCY_STEPS = [
  {
    label: "Both clients read revision 7",
    detail: "Each has the whole item, including its ordered list of actions.",
  },
  {
    label: "Alice saves, and the item becomes revision 8",
    detail: "Her write carried `If-Match: 7`, so the server knew what she was changing.",
  },
  {
    label: "Bob saves, still against revision 7",
    detail: "The server does not reject him and does not overwrite her.",
  },
  {
    label: "The server merges all three versions",
    detail:
      "Base, hers and his. Fields only one of them touched are applied. Fields both touched come back as a conflict, named individually.",
  },
  {
    label: "Bob sees exactly what collided",
    detail: "Two people editing different parts of one item never interrupt each other at all.",
  },
];

export const FeaturesPage: FC = () => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow="Features"
          title="What Zipr actually does"
          lede="A catalogue of launchable items, mirrored to every machine that can see it, edited by several people at once without anybody losing work — and executed only ever on the machine of the person who clicked."
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
                  {pillar.tier === "client" ? "Free client" : "Needs the API"}
                </Badge>
              </div>
              <h2 class="mt-5 text-xl font-bold text-balance">{pillar.title}</h2>
              <p class="mt-3 leading-relaxed text-muted-foreground text-pretty">{pillar.body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* ================= ACTIONS ================= */}
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Actions"
          title="An item is an ordered list of things to do"
          lede="They run in order on the machine that launched them. A step can be conditional on the one before it, and it can carry different parameters per operating system without becoming a second item."
        />

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ACTION_TYPES.map((action) => (
            <Card class="p-5">
              <code class="font-mono text-sm font-semibold text-primary wrap-anywhere">
                {action.name}
              </code>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {action.blurb}
              </p>
            </Card>
          ))}
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-2">
          <Card class="p-6">
            <h3 class="font-bold">Conditions and error handling</h3>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              Each step says whether it runs <code class="font-mono text-xs">always</code>, only{" "}
              <code class="font-mono text-xs">on_success</code>, or only{" "}
              <code class="font-mono text-xs">on_failure</code> — and what a failure should do: stop
              the chain, carry on, or notify. The server validates that those values are members of
              their set and never evaluates one.
            </p>
          </Card>
          <Card class="p-6">
            <h3 class="font-bold">Per-OS, without duplication</h3>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              An action declares which systems it applies to and how its parameters differ between
              them — two separate questions, so you can have either without the other. Choosing the
              variant for the machine it is running on is the client's job.
            </p>
          </Card>
        </div>
      </Container>
    </Section>

    {/* ================= CONCURRENCY ================= */}
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Concurrency"
          title="Two people, one item, a Tuesday afternoon"
          lede="The case most tools handle by locking the row or by quietly letting the last write win. Zipr does neither."
        />

        <ol class="relative space-y-1 border-l-2 border-border pl-8">
          {CONCURRENCY_STEPS.map((step, index) => (
            <li class="relative pb-7 last:pb-0">
              <span
                class="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground tabular"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <p class="font-semibold text-balance">{step.label}</p>
              <p class="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>

        <Card class="mt-10 p-6">
          <div class="flex items-start gap-4">
            <i data-lucide="info" class="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden="true"></i>
            <p class="text-sm leading-relaxed text-muted-foreground text-pretty">
              Every write also carries an idempotency key, so a request that fails on the network is
              safe to send again — the server returns what the first attempt did rather than
              applying it twice. This is why a flaky connection cannot produce two copies of the
              same item.
            </p>
          </div>
        </Card>
      </Container>
    </Section>

    {/* ================= OFFLINE ================= */}
    <Section>
      <Container>
        <div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Offline"
              title="A queued edit is never drawn as though it landed"
            />
            <p class="leading-relaxed text-muted-foreground text-pretty">
              The client keeps its own idea of how sure it is about every item, and shows it. An
              item is confirmed — what the last sync returned — or queued, meaning the outbox still
              holds it, or in need of attention. Rendering a queued edit as confirmed is the single
              most misleading thing an offline client can do, so it gets its own colours rather than
              whichever one a screen reached for.
            </p>
            <p class="mt-4 leading-relaxed text-muted-foreground text-pretty">
              An item in your local workspace is a fourth state, and not a degree of the other
              three: it is saved, durably, and no server has it or ever will.
            </p>
          </div>

          <Card class="p-6">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              How an item can be
            </h3>
            <ul class="mt-5 space-y-4">
              {[
                {
                  token: "bg-success",
                  name: "Confirmed",
                  body: "The last sync returned this. The server has it.",
                },
                {
                  token: "bg-warning",
                  name: "Queued",
                  body: "You changed it, the outbox still holds it, it will land.",
                },
                {
                  token: "bg-destructive",
                  name: "Needs attention",
                  body: "Something went wrong and a person has to look.",
                },
                {
                  token: "bg-info",
                  name: "Local",
                  body: "Saved on this machine. No server has it, and none will.",
                },
              ].map((state) => (
                <li class="flex gap-3">
                  <span
                    class={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${state.token}`}
                    aria-hidden="true"
                  ></span>
                  <span>
                    <span class="block font-semibold">{state.name}</span>
                    <span class="block text-sm text-muted-foreground text-pretty">
                      {state.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Container>
    </Section>

    {/* ================= THE HONEST BIT ================= */}
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Being straight with you"
          title="What the free client cannot do"
          lede="None of these is a feature held back to sell you something. Each follows from there being exactly one machine and no server — and you would find every one of them within an hour of installing, so here they are now."
        />

        <div class="grid gap-5 md:grid-cols-2">
          {LOCAL_LIMITS.map((item) => (
            <Card class="p-6">
              <h3 class="flex items-center gap-2 font-bold">
                <i
                  data-lucide="minus"
                  class="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                ></i>
                {item.limit}
              </h3>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {item.why}
              </p>
            </Card>
          ))}
        </div>

        <Card class="mt-8 p-7">
          <h3 class="text-lg font-bold">What you keep, whatever happens</h3>
          <ul class="mt-4 grid gap-3 sm:grid-cols-2">
            <CheckItem>
              Your local workspace is never restored from anywhere, and clearing the cache does not
              touch it.
            </CheckItem>
            <CheckItem>
              Publishing to a team is a copy. The local catalogue stays local and stays yours.
            </CheckItem>
            <CheckItem>
              Everything exports as one JSON document, written to a path you choose.
            </CheckItem>
            <CheckItem>
              Launching a local item touches no network, so it works with the API switched off
              forever.
            </CheckItem>
          </ul>
        </Card>
      </Container>
    </Section>

    <CtaBand
      title="See where the line falls."
      body="The pricing page lays out feature by feature what works alone and what needs a deployment, including what the infrastructure will cost you."
      primary={{ href: "/pricing", label: "Pricing and comparison" }}
      secondary={{ href: "/downloads", label: "Download the client" }}
    />
  </Page>
);
