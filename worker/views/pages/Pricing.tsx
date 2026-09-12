import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import { TIERS, COMPARISON, RUNNING_COSTS, PRICING_FAQ } from "@server/content/pricing";
import type { PricingTier } from "@server/content/pricing";
import { formatPrice } from "@views/lib/utils";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
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
        Feature comparison between the free client, Team and Enterprise
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
          title="The client is free. The server is what costs."
          lede="Everything one person can do on one machine is free permanently — not a trial, not a reduced build. You pay at the moment a second person needs to see your catalogue, because that is the moment the API starts doing work."
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
          Prices are in {app.currency}, excluding any tax, and cover the licence only — you host the
          deployment on your own infrastructure.{" "}
          <a href="#running-costs" class="font-medium text-primary underline underline-offset-4">
            What that costs is below.
          </a>
        </p>
      </Container>
    </Section>

    {/* ================= COMPARISON ================= */}
    <Section tone="muted" id="compare">
      <Container size="wide">
        <SectionHeading
          eyebrow="Line by line"
          title="What works alone, and what needs a deployment"
          lede="Every 'no' below is a real consequence of having no server, not a feature withheld. Where a limit has a reason worth knowing, it is written under the row."
        />
        <ComparisonTable />
      </Container>
    </Section>

    {/* ================= RUNNING COSTS ================= */}
    <Section id="running-costs">
      <Container>
        <SectionHeading
          eyebrow="The other half of the bill"
          title="What it costs to run, on top of the licence"
          lede="Zipr is self-hosted, so the infrastructure is yours and so is its cost. Two of the four components below are optional, and the deployment degrades honestly without them rather than failing."
        />

        <TableFrame>
          <table class="w-full min-w-[36rem] border-collapse text-left">
            <thead>
              <tr class="border-b border-border bg-muted/60">
                <th scope="col" class="px-5 py-4 text-sm font-semibold">
                  Component
                </th>
                <th scope="col" class="px-5 py-4 text-sm font-semibold">
                  Needed?
                </th>
                <th scope="col" class="px-5 py-4 text-sm font-semibold">
                  What happens without it
                </th>
              </tr>
            </thead>
            <tbody>
              {RUNNING_COSTS.map((item) => (
                <tr class="border-b border-border last:border-0">
                  <th scope="row" class="px-5 py-4 align-top font-medium whitespace-nowrap">
                    {item.component}
                  </th>
                  <td class="px-5 py-4 align-top">
                    <Badge tone={item.requirement === "Required" ? "warning" : "neutral"}>
                      {item.requirement}
                    </Badge>
                  </td>
                  <td class="px-5 py-4 align-top text-sm leading-relaxed text-muted-foreground text-pretty">
                    {item.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableFrame>

        <div class="mt-6 grid gap-5 md:grid-cols-2">
          <Card class="p-6">
            <h3 class="flex items-center gap-2 font-bold">
              <i data-lucide="server" class="h-4 w-4 text-brand" aria-hidden="true"></i>
              It is not a large stack
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              The self-hosted bundle is nine containers including the database, the identity
              provider and the login pages. A team of twenty fits comfortably on a single modest
              virtual machine, and the whole thing comes up with one Docker Compose command.
            </p>
          </Card>
          <Card class="p-6">
            <h3 class="flex items-center gap-2 font-bold">
              <i data-lucide="key-round" class="h-4 w-4 text-brand" aria-hidden="true"></i>
              One fewer database, if you prefer
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              Let Ory Network run the identity provider and the stack drops to seven containers and
              one database, at the cost of identity data living with Ory. Both options serve the
              same login pages and accept the same client sign-in.
            </p>
          </Card>
        </div>
      </Container>
    </Section>

    {/* ================= FAQ ================= */}
    <Section tone="muted">
      <Container size="prose">
        <SectionHeading align="center" eyebrow="Questions" title="The things people ask first" />
        <div class="border-t border-border">
          {PRICING_FAQ.map((item) => (
            <Disclosure question={item.q}>{item.a}</Disclosure>
          ))}
        </div>
      </Container>
    </Section>

    <CtaBand
      title="Try it before any of this matters."
      body="The client is free, needs no account, and is the same binary a licensed team runs. Come back to this page when somebody else needs to see what you built."
      primary={{ href: "/downloads", label: "Download the client" }}
      secondary={{ href: "/contact?topic=licence", label: "Ask about a licence" }}
    />
  </Page>
);
