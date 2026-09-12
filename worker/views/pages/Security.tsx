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
    title: "Your data never leaves your network",
    body: "A team deployment runs on your infrastructure, in your network, under your backup policy. We have no copy, no access, and no way to get one.",
  },
  {
    icon: "wifi-off",
    title: "It doesn't call home",
    body: "Your deployment does not report to us, license-check against us, or need us to be reachable. If we vanished tomorrow your team would carry on working.",
  },
  {
    icon: "eye-off",
    title: "We can't see your catalogue",
    body: "Not encrypted-so-we-promise-not-to-look. We are simply not in the path — there is nowhere for your content to reach us from.",
  },
  {
    icon: "shield-check",
    title: "Every change is attributable",
    body: "Who did what, when, written by the server rather than the app, and not editable from any client. The answer to an audit question is a query, not a reconstruction.",
  },
  {
    icon: "key-round",
    title: "Access is yours to decide",
    body: "Roles, membership and single sign-on are configured by your administrators. Someone who should not see a catalogue cannot tell whether it exists.",
  },
];

const REVIEW_FAQ = [
  {
    q: "Where is our data stored?",
    a: "On the server you run it on. Individual machines also keep a copy so the app stays fast and works offline; both are inside your control. We hold nothing.",
  },
  {
    q: "What does the app send over the network?",
    a: "Only to your own deployment, and only your catalogue content and the sign-in that authorises it. With no deployment configured the app makes no network requests at all.",
  },
  {
    q: "Can we run it somewhere with no internet access?",
    a: "Yes. Air-gapped installs are supported on Enterprise and we will help you do it.",
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
          lede="Zipr was built so that the awkward questions have boring answers. Here they are, before you have to ask."
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
      body="We will happily go through a security questionnaire, sign a DPA, or talk to whoever needs convincing."
      primary={{ href: "/contact?topic=licence", label: "Talk to us" }}
      secondary={{ href: "/downloads", label: "Try it first" }}
    />
  </Page>
);
