import type { FC } from "hono/jsx";

import { CONTACT } from "@server/content/site";
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
 * No form here — a mail client already solves this, and a form would need
 * somewhere to put what it collected plus a reason to believe anyone reads it.
 * What that costs is the chance to prompt for team size or topic, which is why
 * each link arrives with a subject line already written and two of them with
 * the questions we would have asked anyway.
 *
 * All four reach the same address. The routing is the subject line, which is
 * honest about there being one inbox rather than implying a support desk with
 * departments in it. Bug reports are the exception and have their own form at
 * /report, because those need structure and the repositories are private.
 */

/**
 * `mailto:` with a subject, and a body where one helps.
 *
 * Encoded rather than interpolated raw: an unencoded `&` in a subject ends the
 * query string and silently truncates the body.
 *
 * `encodeURIComponent` rather than `URLSearchParams`, which was the first
 * thing tried. URLSearchParams is form encoding: it writes a space as `+`,
 * which is correct for a form submission and wrong here, because a mail client
 * reading a mailto is not required to decode it that way — several show the
 * subject with literal plus signs in it. Since the subject line is the whole
 * routing mechanism on this page, that is not a cosmetic difference.
 */
const mailto = (address: string, subject: string, body?: string) => {
  const query = [
    `subject=${encodeURIComponent(subject)}`,
    ...(body ? [`body=${encodeURIComponent(body)}`] : []),
  ].join("&");
  return `mailto:${address}?${query}`;
};

interface Route {
  id: string;
  icon: string;
  title: string;
  blurb: string;
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
    blurb: "Trials, team size, invoicing, and what it would actually come to for you.",
    subject: "Zipr licence enquiry",
    body: [
      "Roughly how many people:",
      "Where you'd run it (your own servers, a cloud provider, air-gapped):",
      "What you're hoping to share:",
      "",
      "",
    ].join("\n"),
    cta: "Ask about a licence",
  },
  {
    id: "self-hosting",
    icon: "server",
    title: "Setting it up",
    blurb: "Questions about putting Zipr on your own servers, before you commit to anything.",
    subject: "Zipr self-hosting question",
    cta: "Ask about self-hosting",
  },
  {
    id: "support",
    icon: "life-buoy",
    title: "Help, for teams",
    blurb: "You're a customer and something isn't behaving. Jump the queue here.",
    subject: "Zipr support request",
    body: [
      "What you were doing:",
      "What happened instead:",
      "Version, if you know it:",
      "",
      "",
    ].join("\n"),
    cta: "Get support",
  },
  {
    id: "security",
    icon: "shield-check",
    title: "A security report",
    blurb: "Found a vulnerability? Tell us privately and we'll keep you posted until it's fixed.",
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
 * all four are present and reachable either way.
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

    <LinkButton
      href={mailto(CONTACT.address, route.subject, route.body)}
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
          title="Talk to a person"
          lede="Pick whichever fits. Each one opens a message with the subject already written — and where it helps, the questions we'd have asked anyway."
        />

        <div class="grid gap-5 sm:grid-cols-2">
          {ROUTES.map((route) => (
            <RouteCard route={route} highlighted={route.id === topic} />
          ))}
        </div>

        <p class="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground text-pretty">
          They all reach{" "}
          <a
            href={`mailto:${CONTACT.address}`}
            class="font-mono font-medium text-primary underline underline-offset-4 wrap-anywhere"
          >
            {CONTACT.address}
          </a>
          — a real inbox, not an autoresponder, so give us a working day. No form, no list, no
          follow-up sequence. We use your address to answer you.
        </p>
      </Container>
    </Section>

    {/* ================= BUGS ================= */}
    <Section tone="muted">
      <Container size="prose">
        <Card class="p-7 text-center">
          <IconTile icon="bug" tone="brand" size="lg" class="mx-auto" />
          <h2 class="mt-4 text-xl font-bold">Something's broken?</h2>
          <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
            There's a form for that, and it takes about thirty seconds. No account, no tracker to
            sign up for.
          </p>
          <LinkButton href="/report" class="mt-6">
            <i data-lucide="bug" class="h-4 w-4" aria-hidden="true"></i>
            Report a bug
          </LinkButton>
        </Card>
      </Container>
    </Section>
  </Page>
);
