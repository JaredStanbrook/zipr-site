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
 * It replaces what used to be an architecture page: deployment topologies,
 * component counts, which identity provider, which parts are optional and
 * why. All of that answered a question nobody buying was asking, and read as
 * a parts list for anyone thinking of building the same product.
 *
 * What a security reviewer actually wants is a short list of properties they
 * can hold us to. Those are here, and every one of them is true.
 */

const PROPERTIES = [
  {
    icon: "shield",
    title: "Nothing runs on a server",
    body: "Zipr stores what your team built; it never executes any of it. No command, script or link is run anywhere but on the machine of the person who clicked. There is no server-side execution to review, because there isn't any.",
  },
  {
    icon: "server",
    title: "You choose who holds it",
    body: "Self-hosted, your data never leaves your infrastructure, your network or your backup policy, and we have no copy and no way to get one. Hosted, it sits in a database belonging to your organisation alone rather than a shared one — which is what makes a restore of just you possible.",
  },
  {
    icon: "wifi-off",
    title: "A self-hosted deployment doesn't call home",
    body: "It does not report to us or check in with us, and the licence is verified on your own hardware rather than against a service of ours — so it keeps working with the internet unplugged. What it does do is stop accepting changes once the licence expires, after warning for a month; reading is never interrupted.",
  },
  {
    icon: "eye-off",
    title: "We only see what we operate",
    body: "Self-hosted, we are not in the path at all — there is nowhere for your content to reach us from. Hosted, we run the database and can therefore reach it, so the honest answer is a contract and an access policy rather than a claim about physics.",
  },
  {
    icon: "shield-check",
    title: "Every change is attributable",
    body: "Who did what, when, written by the server rather than the app, and not editable from any client. The answer to an audit question is a query, not a reconstruction.",
  },
  {
    icon: "key-round",
    title: "Crossing a boundary is not loosening one",
    body: "Work moves between teams as a published copy, and only where your administrators allow it. Roles, membership and single sign-on stay yours to set — and someone who should not see a catalogue cannot tell whether it exists.",
  },
];

const REVIEW_FAQ = [
  {
    q: "Where is our data stored?",
    a: "Self-hosted, on the server you run it on, and we hold nothing. Hosted, in a database provisioned for your organisation and no one else's. Either way individual machines also keep a copy so the app stays fast and works offline.",
  },
  {
    q: "What does the app send over the network?",
    a: "Only to the deployment it is pointed at, and only your catalogue content and the sign-in that authorises it. With no deployment configured the app makes no network requests at all.",
  },
  {
    q: "Can we run it somewhere with no internet access?",
    a: "Yes, self-hosted. The licence verifies offline, so an air-gapped install is a supported configuration rather than a workaround, and we will help you do it. The hosted service obviously cannot be one of these.",
  },
  {
    q: "How do we sign in?",
    a: "In your browser, never inside the app — the app opens the sign-in page and never handles a password itself. Google, Microsoft Entra and Okta are supported, so accounts can be joined and removed wherever you already do that.",
  },
  {
    q: "What happens to our data if we stop paying?",
    a: "It is not held hostage. Reading keeps working while changes are refused, and you can export everything as one file at any point in that sequence without settling anything first. On the hosted service the data is retained for a stated window after suspension before anything is removed; self-hosted, it is on your own disk and we cannot touch it.",
  },
  {
    q: "Who can see what?",
    a: "Your administrators decide, per workspace. The system is deliberately quiet about things you cannot access — it will not confirm that something exists just because you guessed its address.",
  },
  {
    q: "How do we get security updates?",
    a: "New versions are published here and you roll them out on your own schedule. Nothing updates itself underneath you.",
  },
  {
    q: "Are the installers signed?",
    a: "Not yet, and we would rather say so than have you find out at install time. Every download is published with a checksum so you can verify exactly what you got. Signing is on the way.",
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
          lede="Zipr is built to let knowledge cross between teams, which makes every question below a fair one. They all have boring answers. Here they are, before you have to ask."
        />
      </Container>
    </Section>

    <Section class="pt-0 sm:pt-0">
      <Container size="wide">
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTIES.map((property) => (
            <Card class="flex h-full flex-col p-6">
              <IconTile icon={property.icon} tone="brand" />
              <h2 class="mt-4 text-lg font-bold text-balance">{property.title}</h2>
              <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {property.body}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* ================= THE ONE THAT MATTERS ================= */}
    <Section tone="muted">
      <Container size="prose">
        <Card class="p-8 text-center">
          <IconTile icon="shield" tone="brand" size="lg" class="mx-auto" />
          <h2 class="mt-5 text-2xl font-bold text-balance">The question behind all the others</h2>
          <p class="mt-4 leading-relaxed text-muted-foreground text-pretty">
            "If this tool holds our commands, what can it do with them?" Nothing. It holds them the
            way a document holds text. Running one is always an action a person takes, on their own
            machine, deliberately.
          </p>
        </Card>
      </Container>
    </Section>

    {/* ================= FAQ ================= */}
    <Section>
      <Container size="prose">
        <SectionHeading align="center" eyebrow="Review questions" title="Asked and answered" />
        <div class="border-t border-border">
          {REVIEW_FAQ.map((item) => (
            <Disclosure question={item.q}>{item.a}</Disclosure>
          ))}
        </div>
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
                Mail it rather than filing it publicly, and give us a way to reach you. We will
                confirm we have it, keep you posted while it is fixed, and credit you when it ships
                unless you would rather we didn't.
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
      body="We will happily go through a security questionnaire, sign a DPA, or talk to whoever needs convincing — for either the hosted service or a deployment of your own."
      primary={{ href: "/contact?topic=licence", label: "Talk to us" }}
      secondary={{ href: "/downloads", label: "Try it first" }}
    />
  </Page>
);
