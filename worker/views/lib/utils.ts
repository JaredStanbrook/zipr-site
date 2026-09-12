import { html } from "hono/html";

/**
 * Presentation helpers for views.
 *
 * Locale and currency are per-site (APP_LOCALE / APP_CURRENCY in
 * wrangler.jsonc, surfaced as `c.var.app`), so they are passed in rather than
 * baked in. Formatters are memoised because Intl construction is not free and
 * a table renders hundreds of cells per request.
 */

const DEFAULT_LOCALE = "en-AU";
const DEFAULT_CURRENCY = "AUD";

const currencyFormatters = new Map<string, Intl.NumberFormat>();

const getCurrencyFormatter = (locale = DEFAULT_LOCALE, currency = DEFAULT_CURRENCY) => {
  const key = `${locale}:${currency}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    });
    currencyFormatters.set(key, formatter);
  }
  return formatter;
};

export const capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatDateShort = (date: Date | string | number, locale = DEFAULT_LOCALE) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateCompact = (date: Date | string | number, locale = DEFAULT_LOCALE) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
};

/**
 * Money is stored as integer cents everywhere. Never round-trip it through a
 * float — convert at the edges with these two helpers only.
 */
export const formatCents = (
  cents: number | undefined | null,
  locale = DEFAULT_LOCALE,
  currency = DEFAULT_CURRENCY,
): string => {
  const formatter = getCurrencyFormatter(locale, currency);
  if (cents === undefined || cents === null) return formatter.format(0);
  return formatter.format(cents / 100);
};

/**
 * Money for a price card rather than for a ledger.
 *
 * `formatCents` pins two decimal places, which is right in a table of amounts
 * and wrong at 48px on a pricing card: "$6.00" reads as a figure someone
 * calculated, "$6" as a price someone set. Whole amounts lose the decimals,
 * and anything with cents keeps them — so $7.50 is never shown as $8.
 *
 * `narrowSymbol` matters more than it looks. The default display pairs a
 * non-local currency with its code — an en-AU page priced in USD renders
 * "USD 6", which is correct and reads like a database column. The symbol alone
 * is what a price looks like; the page states the currency in words beside it,
 * which is the right place for that job anyway.
 */
export const formatPrice = (
  cents: number,
  locale = DEFAULT_LOCALE,
  currency = DEFAULT_CURRENCY,
): string =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);

export const dollarsToCents = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null || value === "") return 0;
  const num = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
};

/**
 * File sizes for a download button.
 *
 * Binary units, because that is what every operating system will report for
 * the file once it has landed, and a page that says 84 MB next to a file the
 * Finder calls 80 MB invites the question of which one is lying.
 */
export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KiB", "MiB", "GiB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

export const StatusBadge = (status: string, styles: Record<string, string>, iconName?: string) => {
  // Format label: "pending_review" -> "Pending Review"
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const style = styles[status] || styles.default || "bg-muted text-muted-foreground border-border";

  return html`
    <span
      class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}"
    >
      ${iconName ? html`<i data-lucide="${iconName}" class="w-3 h-3 mr-1.5"></i>` : ""} ${label}
    </span>
  `;
};
