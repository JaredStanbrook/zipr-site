import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import {
  ENQUIRY_STATUSES,
  type SelectEnquiry,
  type EnquiryStatus,
} from "@server/schema/enquiry.schema";
import { formatDateShort } from "@views/lib/utils";
import { Page, Container, Card, Badge } from "@views/components/Ui";

const STATUS_TONE: Record<EnquiryStatus, "warning" | "primary" | "success"> = {
  new: "warning",
  open: "primary",
  handled: "success",
};

const TOPIC_LABELS: Record<string, string> = {
  licence: "Licensing",
  "self-hosting": "Self-hosting",
  support: "Support",
  security: "Security",
  other: "Other",
};

/**
 * One enquiry.
 *
 * A native `<details>` rather than a scripted accordion: the message is the
 * whole point of the row, and it has to be readable with no JavaScript and
 * findable with the browser's own find-in-page.
 */
export const EnquiryRow: FC<{ item: SelectEnquiry; locale: string }> = ({ item, locale }) => (
  <details id={`enquiry-${item.id}`} class="group border-b border-border last:border-0">
    <summary class="flex cursor-pointer list-none items-center gap-4 px-5 py-4 marker:hidden hover:bg-accent/50 [&::-webkit-details-marker]:hidden">
      <i
        data-lucide="chevron-right"
        class="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
        aria-hidden="true"
      ></i>

      <span class="min-w-0 flex-1">
        <span class="block truncate font-semibold">
          {item.name}
          {item.organisation ? (
            <span class="font-normal text-muted-foreground"> · {item.organisation}</span>
          ) : null}
        </span>
        <span class="block truncate text-sm text-muted-foreground">{item.email}</span>
      </span>

      <span class="hidden shrink-0 sm:block">
        <Badge tone="neutral">{TOPIC_LABELS[item.topic] ?? item.topic}</Badge>
      </span>

      {item.seats ? (
        <span class="hidden shrink-0 text-sm text-muted-foreground tabular md:block">
          {item.seats} people
        </span>
      ) : null}

      <span class="hidden shrink-0 text-sm text-muted-foreground md:block">
        {formatDateShort(item.createdAt, locale)}
      </span>

      <span class="shrink-0">
        <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
      </span>
    </summary>

    <div class="border-t border-border bg-muted/30 px-5 py-5 pl-14">
      <p class="whitespace-pre-wrap text-sm leading-relaxed">{item.message}</p>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        {ENQUIRY_STATUSES.map((status) => (
          <button
            type="button"
            hx-post={`/admin/enquiries/${item.id}/status`}
            hx-vals={JSON.stringify({ status })}
            hx-target={`#enquiry-${item.id}`}
            hx-swap="outerHTML"
            disabled={status === item.status}
            class="clay-press inline-flex h-8 cursor-pointer items-center rounded-[var(--radius-sm)] border border-border-strong bg-card px-3 text-xs font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark {status}
          </button>
        ))}

        <a
          href={`mailto:${item.email}?subject=${encodeURIComponent("Re: your Zipr enquiry")}`}
          class="clay-press inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] bg-primary px-3 text-xs font-semibold text-primary-foreground no-underline hover:brightness-110"
        >
          <i data-lucide="send" class="h-3 w-3" aria-hidden="true"></i>
          Reply
        </a>

        <button
          type="button"
          hx-delete={`/admin/enquiries/${item.id}`}
          hx-target={`#enquiry-${item.id}`}
          hx-swap="outerHTML"
          hx-confirm="Delete this enquiry? It stays in the database but disappears from here."
          class="clay-press ml-auto inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          <i data-lucide="trash-2" class="h-3 w-3" aria-hidden="true"></i>
          Delete
        </button>
      </div>

      {item.handledAt ? (
        <p class="mt-4 text-xs text-muted-foreground">
          Marked {item.status} on {formatDateShort(item.handledAt, locale)}.
        </p>
      ) : null}
    </div>
  </details>
);

interface InboxProps {
  items: SelectEnquiry[];
  counts: Record<EnquiryStatus | "all", number>;
  filter: EnquiryStatus | "";
  app: AppConfig;
}

/** The list, as its own fragment so the filter tabs can swap just this. */
export const EnquiryList: FC<InboxProps> = ({ items, app }) => (
  <div id="enquiry-list">
    {items.length === 0 ? (
      <div class="px-5 py-16 text-center">
        <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <i data-lucide="inbox" class="h-5 w-5" aria-hidden="true"></i>
        </span>
        <p class="mt-4 font-semibold">Nothing here</p>
        <p class="mt-1 text-sm text-muted-foreground">No enquiries match this filter.</p>
      </div>
    ) : (
      items.map((item) => <EnquiryRow item={item} locale={app.locale} />)
    )}
  </div>
);

export const EnquiriesPage: FC<InboxProps> = (props) => {
  const { counts, filter } = props;
  const tabs: Array<{ value: EnquiryStatus | ""; label: string; count: number }> = [
    { value: "", label: "All", count: counts.all },
    { value: "new", label: "New", count: counts.new },
    { value: "open", label: "Open", count: counts.open },
    { value: "handled", label: "Handled", count: counts.handled },
  ];

  return (
    <Page>
      <Container size="wide" class="py-10">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold tracking-tight">Enquiries</h1>
            <p class="mt-1 text-muted-foreground">
              Everything the contact form has taken. Replying happens in your mail client.
            </p>
          </div>
          <a
            href="/admin/releases"
            class="text-sm font-medium text-primary underline underline-offset-4"
          >
            Releases →
          </a>
        </div>

        <div class="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {tabs.map((tab) => {
            const active = filter === tab.value;
            return (
              <a
                href={tab.value ? `/admin/enquiries?status=${tab.value}` : "/admin/enquiries"}
                aria-current={active ? "page" : undefined}
                class={`clay-press inline-flex h-9 items-center gap-2 rounded-[var(--radius-sm)] px-3.5 text-sm font-semibold no-underline ${
                  active
                    ? "bg-primary text-primary-foreground shadow-raised"
                    : "border border-border-strong bg-card text-foreground shadow-raised hover:bg-muted"
                }`}
              >
                {tab.label}
                <span class="tabular opacity-70">{tab.count}</span>
              </a>
            );
          })}
        </div>

        <Card class="overflow-hidden p-0">
          <EnquiryList {...props} />
        </Card>
      </Container>
    </Page>
  );
};
