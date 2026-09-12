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
  Badge,
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
 * smaller half of the bill is how a product loses a customer in month two.
 */

const TierCard: FC<{ tier: PricingTier; app: AppConfig }> = ({ tier, app }) => {
  const money = (cents: number) => formatPrice(cents, app.locale, app.currency);

  return (
    <Card
      class={`relative flex h-full flex-col p-7 ${
        tier.featured ? "ring-2 ring-primary lg:-my-3 lg:py-10" : ""
      }`}
    >
      {tier.featured ? (
        <span class="absolute -top-3 left-7">
          <Badge tone="primary" class="shadow-raised">
            Most teams start here
          </Badge>
        </span>
      ) : null}

      <h3 class="text-xl font-bold">{tier.name}</h3>
      <p class="mt-2 min-h-[3rem] text-sm leading-relaxed text-muted-foreground text-pretty">
        {tier.summary}
      </p>

      <div class="mt-6 border-y border-border py-6">
        {tier.annualMonthlyCents === null ? (
          <p class="text-4xl font-extrabold tracking-tight">Let's talk</p>
        ) : tier.annualMonthlyCents === 0 ? (
          <p class="text-5xl font-extrabold tracking-tight tabular">{money(0)}</p>
        ) : (
          <p class="flex items-baseline gap-1.5">
            <span class="text-5xl font-extrabold tracking-tight tabular">
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
        Feature comparison between the Free, Team and Enterprise plans
      </caption>
      <thead>
        <tr class="border-b border-border bg-muted/60">
          <th scope="col" class="w-[38%] px-5 py-4 text-sm font-semibold">
            Feature
          </th>
          <th scope="col" class="px-5 py-4 text-sm font-semibold">
            Client
            <span class="block text-xs font-normal text-muted-foreground">Free</span>
          </th>
          <th scope="col" class="px-5 py-4 text-sm font-semibold text-primary">
            Team
            <span class="block text-xs font-normal text-muted-foreground">Licensed</span>
          </th>
          <th scope="col" class="px-5 py-4 text-sm font-semibold">
            Enterprise
            <span class="block text-xs font-normal text-muted-foreground">Licensed</span>
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
                <Mark value={row.team} />
              </td>
              <td class="px-5 py-4 align-top">
                <Mark value={row.enterprise} />
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
          title="Free for you. Paid for your team."
          lede="Everything one person can do on one machine is free, permanently. Not a trial, not a cut-down build. You pay the day somebody else needs in."
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
          Prices in {app.currency}, excluding tax. The licence covers the software; the server is
          yours.{" "}
          <a href="#running-costs" class="font-medium text-primary underline underline-offset-4">
            Here's what running it involves.
          </a>
        </p>
      </Container>
    </Section>

    {/* ================= COMPARISON ================= */}
    <Section tone="muted" id="compare">
      <Container size="wide">
        <SectionHeading
          eyebrow="Line by line"
          title="Free versus team, line by line"
          lede="No asterisks. Everything in the free column works forever on your own machine; the team column is what arrives when you share it."
        />
        <ComparisonTable />
      </Container>
    </Section>

    {/* ================= RUNNING COSTS ================= */}
    <Section id="running-costs">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Running it yourself"
          title="Less work than you're bracing for"
          lede="Self-hosted has a reputation, and most of it is earned by other software. This is one server and one command."
        />

        <div class="grid gap-5 md:grid-cols-3">
          {RUNNING_NOTES.map((note) => (
            <Card class="flex h-full flex-col p-6 text-center">
              <IconTile icon={note.icon} tone="brand" class="mx-auto" />
              <h3 class="mt-4 font-bold">{note.title}</h3>
              <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {note.body}
              </p>
            </Card>
          ))}
        </div>

        <p class="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground text-pretty">
          The licence covers the software and the support. The server is yours, on whichever cloud
          or rack you already use — which is the point, because it is also where your data stays.
        </p>
      </Container>
    </Section>

    {/* ================= FAQ ================= */}
    <Section tone="muted">
      <Container size="prose">
        <SectionHeading align="center" eyebrow="Questions" title="Before you ask" />
        <div class="border-t border-border">
          {PRICING_FAQ.map((item) => (
            <Disclosure question={item.q}>{item.a}</Disclosure>
          ))}
        </div>
      </Container>
    </Section>

    <CtaBand
      title="Try it before any of this matters."
      body="The free app needs no account and is the same one licensed teams run. Come back here the day somebody else wants what you built."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/contact?topic=licence", label: "Ask about a licence" }}
    />
  </Page>
);
