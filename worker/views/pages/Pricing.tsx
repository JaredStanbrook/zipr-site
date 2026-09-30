import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import { TIERS, COMPARISON, RUNNING_NOTES, PRICING_FAQ } from "@server/content/pricing";
import type { PricingTier } from "@server/content/pricing";
import { formatPrice } from "@views/lib/utils";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  IconTile,
  LinkButton,
  CheckItem,
  Mark,
  Disclosure,
  CtaBand,
  TableFrame,
} from "@views/components/Ui";

/**
 * Hero, three cards, the full comparison, what it costs to *run*, FAQ, CTA.
 *
 * The running-costs section is the one most pricing pages leave out and the
 * one a self-hosted buyer most needs: a licence fee that turns out to be the
 * smaller half of the bill is how a product loses a customer in month two. It
 * now sits under the self-hosted heading rather than reading as the universal
 * story, because for a hosted customer that bill is ours.
 *
 * Nothing on this page is a checkout. Both paid routes are a conversation, so
 * every paid button goes to /contact — see the note in content/pricing.ts.
 */

const TierCard: FC<{ tier: PricingTier; app: AppConfig }> = ({ tier, app }) => {
  const money = (cents: number) => formatPrice(cents, app.locale, app.currency);

  return (
    <Card
      tone={tier.featured ? "floating" : "raised"}
      lift
      class={`relative flex h-full flex-col p-7 ${
        tier.featured
          ? "outline-2 outline-offset-4 outline-primary/40 outline-dashed lg:-my-4 lg:py-11"
          : ""
      }`}
    >
      {tier.featured ? (
        <span class="absolute -top-3.5 left-7">
          <span class="clay-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
            <i data-lucide="zap" class="h-3 w-3" aria-hidden="true"></i>
            Most teams start here
          </span>
        </span>
      ) : null}

      <h3 class="text-2xl">{tier.name}</h3>
      <p class="mt-2 min-h-[3rem] text-sm leading-relaxed text-muted-foreground text-pretty">
        {tier.summary}
      </p>

      {/* The price sits in a well cut into the card: the number is the thing
          being held, and the card is holding it. */}
      <div class="clay-well mt-6 rounded-[1.1rem] p-5">
        {tier.annualMonthlyCents === null ? (
          <p class="font-display text-4xl font-semibold">Let's talk</p>
        ) : tier.annualMonthlyCents === 0 ? (
          <p class="font-display text-5xl font-semibold tabular">{money(0)}</p>
        ) : (
          <p class="flex flex-wrap items-baseline gap-1.5">
            <span class="font-display text-5xl font-semibold tabular">
              {money(tier.annualMonthlyCents)}
            </span>
            <span class="text-sm font-medium text-muted-foreground">/ person / month</span>
          </p>
        )}

        <p class="mt-2 text-sm text-muted-foreground text-pretty">{tier.priceNote}</p>

        {tier.monthlyCents !== null && tier.monthlyCents > 0 ? (
          <p class="mt-3 text-sm text-muted-foreground">
            <span class="tabular">{money(tier.monthlyCents)}</span> month to month.
            {tier.minimumSeats ? (
              <>
                {" "}
                Minimum <span class="tabular">{tier.minimumSeats}</span> people, so{" "}
                <span class="tabular font-medium text-foreground">
                  {money(tier.annualMonthlyCents! * tier.minimumSeats * 12)}
                </span>{" "}
                a year at the smallest.
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      <ul class="mt-6 flex-1 space-y-3">
        {tier.features.map((feature) => (
          <CheckItem>{feature}</CheckItem>
        ))}
      </ul>

      <LinkButton
        href={tier.cta.href}
        variant={tier.featured ? "primary" : "outline"}
        size="lg"
        class="mt-8 w-full"
      >
        {tier.cta.label}
      </LinkButton>
    </Card>
  );
};

const ComparisonTable: FC = () => (
  <TableFrame>
    <table class="relative w-full min-w-[46rem] border-collapse text-left">
      <caption class="sr-only">
        Feature comparison between the Free app, the Hosted service and a Self-hosted deployment
      </caption>
      <thead>
        <tr class="border-b border-border bg-muted/60">
          <th scope="col" class="w-[38%] px-5 py-4 text-sm font-semibold">
            Feature
          </th>
          <th scope="col" class="px-5 py-4 text-sm font-semibold">
            Free
            <span class="block text-xs font-normal text-muted-foreground">On your machine</span>
          </th>
          <th scope="col" class="px-5 py-4 text-sm font-semibold text-primary">
            Hosted
            <span class="block text-xs font-normal text-muted-foreground">Per person</span>
          </th>
          <th scope="col" class="px-5 py-4 text-sm font-semibold">
            Self-hosted
            <span class="block text-xs font-normal text-muted-foreground">Per deployment</span>
          </th>
        </tr>
      </thead>

      {COMPARISON.map((group) => (
        <tbody>
          <tr>
            <th
              colspan={4}
              scope="colgroup"
              class="border-y border-border bg-muted/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {group.title}
            </th>
          </tr>
          {group.rows.map((row) => (
            <tr class="border-b border-border last:border-0">
              <th scope="row" class="px-5 py-4 align-top font-medium">
                <span class="block text-pretty">{row.feature}</span>
                {row.note ? (
                  <span class="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground text-pretty">
                    {row.note}
                  </span>
                ) : null}
              </th>
              <td class="px-5 py-4 align-top">
                <Mark value={row.free} />
              </td>
              <td class="px-5 py-4 align-top">
                <Mark value={row.cloud} />
              </td>
              <td class="px-5 py-4 align-top">
                <Mark value={row.selfHosted} />
              </td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  </TableFrame>
);

export const PricingPage: FC<{ app: AppConfig }> = ({ app }) => (
  <Page>
    {/* ================= HERO ================= */}
    <Section class="pt-12 sm:pt-20">
      <Container>
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Pricing"
          title={
            <>
              Free for you. <em>Paid</em> for your team.
            </>
          }
          lede="The whole app is free for one person, permanently. You pay when your team shares — and you choose who runs the server."
        />
      </Container>
    </Section>

    {/* ================= CARDS ================= */}
    <Section class="pt-0 sm:pt-0">
      <Container size="wide">
        <div class="grid items-stretch gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <TierCard tier={tier} app={app} />
          ))}
        </div>

        <p class="mt-8 text-center text-sm text-muted-foreground text-pretty">
          Prices in {app.currency}, excluding tax. Both paid options start with a conversation and a
          quote.{" "}
          <a href="#running-costs" class="font-medium text-primary underline underline-offset-4">
            What self-hosting involves
          </a>
        </p>
      </Container>
    </Section>

    {/* ================= COMPARISON ================= */}
    <Section tone="muted" id="compare">
      <Container size="wide">
        <SectionHeading
          eyebrow="Compare plans"
          title="Every feature, side by side"
          lede="Hosted and self-hosted are the same software. They differ in who runs it and how it's billed, not in what it can do."
        />
        <ComparisonTable />
      </Container>
    </Section>

    {/* ================= RUNNING COSTS ================= */}
    <Section id="running-costs">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="If you run it yourself"
          title="Less work than you're bracing for"
          lede="One server and one command. If you'd rather not, the hosted option is us doing it for you."
        />

        <div class="grid gap-5 md:grid-cols-3">
          {RUNNING_NOTES.map((note) => (
            <Card lift class="flex h-full flex-col p-7 text-center">
              <IconTile icon={note.icon} tone="brand" size="lg" class="mx-auto" />
              <h3 class="mt-5 text-xl">{note.title}</h3>
              <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {note.body}
              </p>
            </Card>
          ))}
        </div>

        <p class="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground text-pretty">
          The agreement covers the software and support. The server is yours, on whichever cloud or
          rack you already use — and because a deployment counts nobody, the price doesn't move when
          the team grows.
        </p>
      </Container>
    </Section>

    {/* ================= FAQ ================= */}
    <Section tone="muted">
      <Container size="prose">
        <SectionHeading align="center" eyebrow="Questions" title="Before you ask" />
        <div>
          {PRICING_FAQ.map((item) => (
            <Disclosure question={item.q}>{item.a}</Disclosure>
          ))}
        </div>
      </Container>
    </Section>

    <CtaBand
      title="Try it before any of this matters."
      body="The free app needs no account and is the same one paying teams run."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/contact?topic=cloud", label: "Talk to us about a team" }}
    />
  </Page>
);
