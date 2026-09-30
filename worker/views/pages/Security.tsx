import type { FC } from "hono/jsx";

import { CONTACT } from "@server/content/site";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  IconTile,
  CtaBand,
  Disclosure,
} from "@views/components/Ui";

/**
 * The page for the person who has to approve the purchase.
 *
 * What a security reviewer wants is a short list of properties they can hold
 * us to, then the detailed answers. Properties first, one or two sentences
 * each; the FAQ below carries the nuance. Every line is true.
 */

const PROPERTIES = [
  {
    icon: "shield",
    title: "Nothing runs on a server",
    body: "Zipr stores what your team built; it never executes it. Commands, scripts and links run only on the machine of the person who clicked, when they click.",
  },
  {
    icon: "server",
    title: "Your data, where you choose",
    body: "Self-hosted, it never leaves your infrastructure and we have no copy. Hosted, it sits in a database belonging to your organisation alone — we operate it, so access is governed by contract and policy.",
  },
  {
    icon: "wifi-off",
    title: "Self-hosted doesn't call home",
    body: "No reporting, no check-ins. The licence is verified on your own hardware, so it works with the internet unplugged.",
  },
  {
    icon: "shield-check",
    title: "Every change is attributable",
    body: "Who did what and when, recorded by the server and not editable from any client. An audit question is a query, not a reconstruction.",
  },
  {
    icon: "key-round",
    title: "Sharing doesn't loosen access",
    body: "Work crosses teams only as a published copy, where your administrators allow it. Roles, membership and single sign-on stay yours — and people can't tell whether a catalogue they can't see exists.",
  },
  {
    icon: "download",
    title: "Your data is never held hostage",
    body: "Export everything as one file at any time. If a licence or invoice lapses, reading keeps working while changes are refused.",
  },
];

export const REVIEW_FAQ = [
  {
    q: "Where is our data stored?",
    a: "Self-hosted, on the server you run it on, and we hold nothing. Hosted, in a database provisioned for your organisation alone, so it can be backed up and restored on its own. Either way, each machine also keeps a copy so the app is fast and works offline.",
  },
  {
    q: "What does the app send over the network?",
    a: "Only your catalogue content and the sign-in that authorises it, and only to the deployment it is pointed at. With no deployment configured, it makes no network requests at all.",
  },
  {
    q: "Can we run it somewhere with no internet access?",
    a: "Yes, self-hosted. The licence verifies offline, so air-gapped is a supported configuration, not a workaround — and we'll help you set it up. The hosted service can't be air-gapped.",
  },
  {
    q: "How do we sign in?",
    a: "In your browser — the app opens the sign-in page and never handles your Zipr password itself. Google, Microsoft Entra and Okta are supported, so people join and leave wherever you already manage that.",
  },
  {
    q: "What happens to our data if we stop paying?",
    a: "Reading keeps working while changes are refused, and you can export everything at any point without settling anything first. Hosted, the data is kept for the period set out in your agreement after suspension before anything is removed. Self-hosted, it is on your own disk and we can't touch it; the licence warns you for a month before it expires.",
  },
  {
    q: "Who can see what?",
    a: "Your administrators decide, per workspace. The system won't confirm that something exists just because someone guessed its address.",
  },
  {
    q: "How do we get security updates?",
    a: "New versions are published on the downloads page and you roll them out on your own schedule. Nothing updates itself underneath you.",
  },
  {
    q: "Are the installers signed?",
    a: "Not yet — signing is on the way. Every download is published with a SHA-256 checksum so you can verify exactly what you got.",
  },
];

export const SecurityPage: FC = () => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container>
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Security"
          title="The short answers your reviewer wants"
          lede="Zipr moves knowledge between teams, so these are fair questions. The answers are deliberately boring."
        />
      </Container>
    </Section>

    <Section class="pt-0 sm:pt-0">
      <Container size="wide">
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTIES.map((property) => (
            <Card lift class="flex h-full flex-col p-7">
              <IconTile icon={property.icon} tone="brand" />
              <h2 class="mt-5 text-xl leading-snug text-balance">{property.title}</h2>
              <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {property.body}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* ================= FAQ ================= */}
    <Section>
      <Container size="prose">
        <SectionHeading align="center" eyebrow="Review questions" title="Asked and answered" />
        <div>
          {REVIEW_FAQ.map((item) => (
            <Disclosure question={item.q}>{item.a}</Disclosure>
          ))}
        </div>
        <p class="mt-6 text-center text-sm text-muted-foreground text-pretty">
          Exactly what the website, the app and the hosted service record is listed in the{" "}
          <a href="/privacy" class="font-medium text-primary underline underline-offset-4">
            privacy notice
          </a>
          .
        </p>
      </Container>
    </Section>

    {/* ================= DISCLOSURE ================= */}
    <Section tone="muted">
      <Container size="prose">
        <Card class="p-7">
          <div class="flex items-start gap-4">
            <IconTile icon="bug" tone="brand" />
            <div class="min-w-0">
              <h2 class="text-lg font-bold">Found something?</h2>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                Email it privately. We'll confirm we have it, keep you posted while it's fixed, and
                credit you when it ships unless you'd rather we didn't.
              </p>
              <a
                href={`mailto:${CONTACT.address}?subject=${encodeURIComponent("Zipr security report")}`}
                class="mt-3 inline-block font-mono text-sm font-medium text-primary underline underline-offset-4 wrap-anywhere"
              >
                {CONTACT.address}
              </a>
            </div>
          </div>
        </Card>
      </Container>
    </Section>

    <CtaBand
      title="Need this in writing?"
      body="We'll complete a security questionnaire, sign a DPA, or talk to whoever needs convincing — hosted or self-hosted."
      primary={{ href: "/contact?topic=licence", label: "Talk to us" }}
      secondary={{ href: "/downloads", label: "Try it first" }}
    />
  </Page>
);
