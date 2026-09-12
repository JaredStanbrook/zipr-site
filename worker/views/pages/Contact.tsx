import type { FC } from "hono/jsx";

import { CONTACT, REPOS } from "@server/content/site";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  LinkButton,
  Badge,
  IconTile,
} from "@views/components/Ui";

/**
 * Contact, by email.
 *
 * There is no form. A form would need somewhere to put what it collected, a
 * screen for somebody to read it on, and a reason to trust that anyone
 * actually does — and a mail client already solves all three. What it costs is
 * that we cannot prompt for team size or topic, which is why each address
 * below arrives with a subject line already written.
 *
 * The addresses are one per question rather than a single `hello@`, because
 * the three go to different people and a security report waiting behind a
 * licensing question is the failure that matters.
 */

/**
 * `mailto:` with a subject, and a body where one helps.
 *
 * Encoded rather than interpolated raw: an unencoded `&` in a subject ends the
 * query string and silently truncates the body.
 */
const mailto = (address: string, subject: string, body?: string) => {
  const params = new URLSearchParams({ subject, ...(body ? { body } : {}) });
  return `mailto:${address}?${params.toString()}`;
};

interface Route {
  id: string;
  icon: string;
  title: string;
  blurb: string;
  address: string;
  subject: string;
  /** Pre-filled prompts, so the first reply can be a useful one. */
  body?: string;
  cta: string;
}

const ROUTES: Route[] = [
  {
    id: "licence",
    icon: "receipt-text",
    title: "Licensing and quotes",
    blurb:
      "Trials, seat counts, invoicing, and anything about what a deployment would actually cost you.",
    address: CONTACT.sales,
    subject: "Zipr licence enquiry",
    body: [
      "Roughly how many people:",
      "Where you would run it (your own servers, a cloud provider, air-gapped):",
      "What you are hoping to share as a catalogue:",
      "",
      "",
    ].join("\n"),
    cta: "Ask about a licence",
  },
  {
    id: "self-hosting",
    icon: "server",
    title: "Running the deployment",
    blurb:
      "Questions about standing the API up, the two identity options, or what the infrastructure needs to be.",
    address: CONTACT.support,
    subject: "Zipr self-hosting question",
    cta: "Ask about self-hosting",
  },
  {
    id: "support",
    icon: "life-buoy",
    title: "Something is broken",
    blurb:
      "For licensed teams: deployment trouble, bugs, and the questions the documentation does not answer.",
    address: CONTACT.support,
    subject: "Zipr support request",
    body: [
      "What you were doing:",
      "What happened instead:",
      "Client version, and the API version if you have one:",
      "",
      "",
    ].join("\n"),
    cta: "Get support",
  },
  {
    id: "security",
    icon: "shield-check",
    title: "A security report",
    blurb:
      "Vulnerability reports. Please mail these rather than opening a public issue, and give us a way to reach you.",
    address: CONTACT.security,
    subject: "Zipr security report",
    cta: "Report privately",
  },
];

/**
 * Which card leads.
 *
 * The pricing and downloads pages link here with `?topic=…`, and arriving at a
 * page of four equal options having just clicked "ask about a licence" is a
 * small failure of follow-through. The parameter only ever adds emphasis;
 * every address is present and reachable either way.
 */
const RouteCard: FC<{ route: Route; highlighted: boolean }> = ({ route, highlighted }) => (
  <Card class={`flex h-full flex-col p-6 ${highlighted ? "ring-2 ring-primary" : ""}`}>
    <div class="flex items-start justify-between gap-3">
      <IconTile icon={route.icon} />
      {highlighted ? <Badge tone="primary">You were asking about this</Badge> : null}
    </div>

    <h2 class="mt-4 text-lg font-bold text-balance">{route.title}</h2>
    <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
      {route.blurb}
    </p>

    <a
      href={mailto(route.address, route.subject, route.body)}
      class="mt-4 block font-mono text-sm font-medium text-primary underline underline-offset-4 wrap-anywhere"
    >
      {route.address}
    </a>

    <LinkButton
      href={mailto(route.address, route.subject, route.body)}
      variant={highlighted ? "primary" : "outline"}
      class="mt-5 w-full"
    >
      <i data-lucide="send" class="h-4 w-4" aria-hidden="true"></i>
      {route.cta}
    </LinkButton>
  </Card>
);

export const ContactPage: FC<{ topic?: string }> = ({ topic }) => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container size="wide">
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Contact"
          title="Tell us what you need"
          lede="Whether it is a licence, a deployment that will not start, or a question about whether Zipr suits how your team works — every address below reaches a person, and each one opens with the questions we would have asked anyway."
        />

        <div class="grid gap-5 sm:grid-cols-2">
          {ROUTES.map((route) => (
            <RouteCard route={route} highlighted={route.id === topic} />
          ))}
        </div>

        <p class="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground text-pretty">
          We answer from a real inbox rather than an autoresponder, so give it a working day. There
          is no form here and no list to be added to — your address is used to reply to you and for
          nothing else.
        </p>
      </Container>
    </Section>

    {/* ================= ISSUES ================= */}
    {REPOS.showRepoLinks ? (
      <Section tone="muted">
        <Container size="prose">
          <Card class="p-7 text-center">
            <IconTile icon="bug" tone="brand" size="lg" class="mx-auto" />
            <h2 class="mt-4 text-xl font-bold">Found a bug?</h2>
            <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
              Issues go in the repository they belong to, so they end up next to the code that has
              to change. A security problem is the exception — mail that one instead.
            </p>
            <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
              <LinkButton
                href={`${REPOS.client}/issues`}
                variant="outline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Client issues
                <i data-lucide="external-link" class="h-4 w-4" aria-hidden="true"></i>
              </LinkButton>
              <LinkButton
                href={`${REPOS.api}/issues`}
                variant="outline"
                rel="noopener noreferrer"
                target="_blank"
              >
                API issues
                <i data-lucide="external-link" class="h-4 w-4" aria-hidden="true"></i>
              </LinkButton>
            </div>
          </Card>
        </Container>
      </Section>
    ) : null}
  </Page>
);
