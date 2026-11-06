import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import { DIRECT_SOURCE } from "@server/schema/analytics.schema";
import { Page, Container, Card } from "@views/components/Ui";

export const RANGES = [7, 30, 90] as const;

type Row = { key: string; views: number };

interface AnalyticsProps {
  app: AppConfig;
  days: number;
  series: { day: string; views: number }[];
  totalViews: number;
  entries: number;
  pages: Row[];
  sources: Row[];
  countries: Row[];
  devices: Row[];
  downloads: Row[];
}

const countryName = (code: string, locale: string) => {
  if (code === "XX") return "Unknown";
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};

const dayLabel = (day: string, locale: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const Stat: FC<{ label: string; value: string; hint: string }> = ({ label, value, hint }) => (
  <Card class="p-5">
    <p class="text-sm font-semibold text-muted-foreground">{label}</p>
    <p class="tabular mt-1 text-3xl font-bold">{value}</p>
    <p class="mt-1 text-xs text-muted-foreground">{hint}</p>
  </Card>
);

/** A ranked list with a thin bar per row, so the share reads at a glance. */
const Breakdown: FC<{
  title: string;
  rows: Row[];
  format?: (key: string) => string;
  empty?: string;
  locale: string;
}> = ({ title, rows, format = (k) => k, empty = "No views yet.", locale }) => {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <Card class="p-5">
      <h2 class="text-base font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p class="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <table class="mt-3 w-full text-sm">
          <tbody>
            {rows.map((row) => (
              <tr>
                <td class="py-1.5 pr-3">
                  <span class="block truncate">{format(row.key)}</span>
                  <span class="mt-1 block h-1 rounded-full bg-muted">
                    <span
                      class="block h-1 rounded-full bg-chart-1"
                      style={`width:${(row.views / max) * 100}%`}
                    ></span>
                  </span>
                </td>
                <td class="tabular w-16 py-1.5 text-right align-top font-semibold">
                  {row.views.toLocaleString(locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
};

/** Views per day: one series, so no legend — the heading names it. */
const DailyChart: FC<{ series: AnalyticsProps["series"]; locale: string }> = ({
  series,
  locale,
}) => {
  const max = Math.max(1, ...series.map((d) => d.views));
  return (
    <Card class="p-5">
      <div class="flex items-baseline justify-between gap-4">
        <h2 class="text-base font-bold">Page views per day</h2>
        <span class="tabular text-xs text-muted-foreground">peak {max.toLocaleString(locale)}</span>
      </div>
      <div
        class="mt-4 flex h-40 items-end gap-[2px] border-b border-border"
        role="img"
        aria-label="Page views per day; the same figures are in the table below."
      >
        {series.map((d) => (
          <div
            class="group relative flex h-full flex-1 items-end"
            title={`${dayLabel(d.day, locale)}: ${d.views.toLocaleString(locale)} views`}
          >
            <div
              class="w-full rounded-t-[4px] bg-chart-1 group-hover:brightness-110"
              style={`height:${d.views === 0 ? 0 : Math.max(2, (d.views / max) * 100)}%`}
            ></div>
            <span class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm group-hover:block">
              {dayLabel(d.day, locale)} · {d.views.toLocaleString(locale)}
            </span>
          </div>
        ))}
      </div>
      <div class="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{dayLabel(series[0].day, locale)}</span>
        <span>{dayLabel(series[series.length - 1].day, locale)}</span>
      </div>
      <details class="mt-4 text-sm">
        <summary class="cursor-pointer font-semibold text-muted-foreground">
          Show as a table
        </summary>
        <table class="mt-2 w-full">
          <tbody>
            {[...series].reverse().map((d) => (
              <tr class="border-b border-border last:border-0">
                <td class="py-1">{dayLabel(d.day, locale)}</td>
                <td class="tabular py-1 text-right">{d.views.toLocaleString(locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Card>
  );
};

export const AnalyticsPage: FC<AnalyticsProps> = (props) => {
  const { app, days, totalViews, entries } = props;
  const locale = app.locale;
  const downloadTotal = props.downloads.reduce((sum, r) => sum + r.views, 0);
  const n = (value: number) => value.toLocaleString(locale);

  return (
    <Page>
      <Container size="wide" class="py-10">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold tracking-tight">Analytics</h1>
            <p class="mt-1 max-w-2xl text-muted-foreground text-pretty">
              Cookieless counts of page views: which page, which day, where the visitor came from,
              their country and device type. No cookies, IP addresses or visitor IDs are stored, so
              there are no unique-visitor figures. Your own visits while signed in are not counted.
            </p>
          </div>
          <a href="/admin" class="text-sm font-medium text-primary underline underline-offset-4">
            ← Admin
          </a>
        </div>

        <div class="mb-6 flex flex-wrap gap-2" role="group" aria-label="Date range">
          {RANGES.map((range) => (
            <a
              href={`/admin/analytics?days=${range}`}
              aria-current={range === days ? "page" : undefined}
              class={`clay-press inline-flex h-11 items-center rounded-[var(--radius-sm)] px-4 text-sm font-semibold no-underline ${
                range === days
                  ? "bg-primary text-primary-foreground"
                  : "border border-border-strong bg-card text-foreground hover:bg-muted"
              }`}
            >
              Last {range} days
            </a>
          ))}
        </div>

        <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Page views" value={n(totalViews)} hint={`Last ${days} days`} />
          <Stat label="Visits" value={n(entries)} hint="Views that arrived from outside the site" />
          <Stat
            label="Pages per visit"
            value={entries ? (totalViews / entries).toFixed(1) : "–"}
            hint="Page views ÷ visits"
          />
          <Stat label="Downloads" value={n(downloadTotal)} hint="Every installer, all time" />
        </div>

        <div class="mb-6">
          <DailyChart series={props.series} locale={locale} />
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <Breakdown title="Top pages" rows={props.pages} locale={locale} />
          <Breakdown
            title="Where visits came from"
            rows={props.sources}
            format={(k) => (k === DIRECT_SOURCE ? "Direct or unknown" : k)}
            empty="No visits from outside yet."
            locale={locale}
          />
          <Breakdown
            title="Countries"
            rows={props.countries}
            format={(k) => countryName(k, locale)}
            locale={locale}
          />
          <Breakdown
            title="Devices"
            rows={props.devices}
            format={(k) => k.charAt(0).toUpperCase() + k.slice(1)}
            locale={locale}
          />
          <Breakdown
            title="Downloads by platform (all time)"
            rows={props.downloads}
            empty="No installers published yet."
            locale={locale}
          />
        </div>

        <p class="mt-6 text-sm text-muted-foreground">
          Tag links you share with <code>?utm_source=name</code> (for example{" "}
          <code>?utm_source=linkedin</code>) and their visits show under that name.
        </p>
      </Container>
    </Page>
  );
};
