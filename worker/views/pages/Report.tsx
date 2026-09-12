import type { FC, Child } from "hono/jsx";

import { CONTACT } from "@server/content/site";
import { ISSUE_PRODUCTS, ISSUE_PRODUCT_LABELS, type IssueForm } from "@server/schema/issue.schema";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  SubmitButton,
  IconTile,
} from "@views/components/Ui";

/**
 * Report a bug.
 *
 * The source repositories are private, so there is no public tracker to point
 * anyone at. This is the tracker, and it is deliberately the shortest form the
 * site could get away with: one dropdown, two boxes, and everything else
 * optional. A bug report nobody finishes is a bug nobody fixes.
 */

export type FieldErrors = Partial<Record<keyof IssueForm, string[]>>;

const FIELD_CLASS =
  "clay-field w-full px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";

const Field: FC<{
  name: string;
  label: string;
  hint?: string;
  errors?: string[];
  optional?: boolean;
  children?: Child;
}> = ({ name, label, hint, errors, optional, children }) => (
  <div class="flex h-full flex-col">
    <label for={name} class="block text-sm font-semibold">
      {label}
      {optional ? (
        <span class="ml-2 text-xs font-normal text-muted-foreground">Optional</span>
      ) : null}
    </label>
    {hint ? (
      <p id={`${name}-hint`} class="mt-1 text-xs text-muted-foreground text-pretty">
        {hint}
      </p>
    ) : null}
    <div class="mt-auto pt-2">{children}</div>
    {errors?.length ? (
      /* Announced, not just coloured — a red edge is invisible to a screen
         reader and to a good number of the people who most need the fix. */
      <p id={`${name}-error`} role="alert" class="mt-1.5 text-sm font-medium text-destructive">
        {errors[0]}
      </p>
    ) : null}
  </div>
);

export const ReportForm: FC<{
  values?: Partial<Record<string, string>>;
  errors?: FieldErrors;
  product?: string;
}> = ({ values = {}, errors = {}, product }) => {
  const selected = values.product ?? product ?? "client";
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      id="report-form"
      hx-post="/report"
      hx-target="#report-form"
      hx-swap="outerHTML"
      hx-disabled-elt="find button[type='submit']"
      class="space-y-5"
      novalidate
    >
      {hasErrors ? (
        <div
          role="alert"
          class="flex items-start gap-3 rounded-[var(--radius-sm)] bg-destructive-subtle px-4 py-3 text-sm font-medium text-destructive-subtle-foreground"
        >
          <i data-lucide="circle-x" class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"></i>
          <span>Almost — a couple of fields need another look.</span>
        </div>
      ) : null}

      <Field name="product" label="Where did it happen?" errors={errors.product}>
        <select id="product" name="product" class={FIELD_CLASS}>
          {ISSUE_PRODUCTS.map((value) => (
            <option value={value} selected={value === selected}>
              {ISSUE_PRODUCT_LABELS[value]}
            </option>
          ))}
        </select>
      </Field>

      <Field name="summary" label="What went wrong?" errors={errors.summary}>
        <input
          id="summary"
          name="summary"
          type="text"
          required
          maxlength={160}
          placeholder="Launching an item does nothing on Windows"
          value={values.summary ?? ""}
          aria-invalid={errors.summary ? "true" : undefined}
          aria-describedby={errors.summary ? "summary-error" : undefined}
          class={FIELD_CLASS}
        />
      </Field>

      <Field
        name="detail"
        label="What were you doing?"
        hint="What you expected, and what happened instead. Steps to reproduce it are gold."
        errors={errors.detail}
      >
        <textarea
          id="detail"
          name="detail"
          rows={6}
          required
          aria-invalid={errors.detail ? "true" : undefined}
          aria-describedby={errors.detail ? "detail-error" : "detail-hint"}
          class={FIELD_CLASS}
        >
          {values.detail ?? ""}
        </textarea>
      </Field>

      <div class="grid gap-5 sm:grid-cols-3">
        <Field name="version" label="Version" optional errors={errors.version}>
          <input
            id="version"
            name="version"
            type="text"
            placeholder="0.2.0"
            value={values.version ?? ""}
            class={`${FIELD_CLASS} font-mono tabular`}
          />
        </Field>

        <Field name="platform" label="Platform" optional errors={errors.platform}>
          <input
            id="platform"
            name="platform"
            type="text"
            placeholder="Windows 11"
            value={values.platform ?? ""}
            class={FIELD_CLASS}
          />
        </Field>

        <Field
          name="email"
          label="Email"
          optional
          hint="Only if you want to hear back."
          errors={errors.email}
        >
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            value={values.email ?? ""}
            aria-invalid={errors.email ? "true" : undefined}
            aria-describedby={errors.email ? "email-error" : "email-hint"}
            class={FIELD_CLASS}
          />
        </Field>
      </div>

      {/*
        Honeypot. Positioned off-screen rather than hidden: some bots skip
        `display: none` inputs and almost none skip positioned ones, while
        `tabindex="-1"` and `aria-hidden` keep it away from real people.
        `autocomplete="off"` stops a browser filling it in helpfully and
        getting a genuine report silently dropped.
      */}
      <div class="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label for="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabindex={-1} autocomplete="off" value="" />
      </div>

      <div class="flex flex-wrap items-center gap-4 pt-1">
        <SubmitButton size="lg">
          <i data-lucide="send" class="h-4 w-4" aria-hidden="true"></i>
          Send the report
        </SubmitButton>
        <p class="text-xs text-muted-foreground text-pretty">
          Goes straight to the people who can fix it.
        </p>
      </div>
    </form>
  );
};

export const ReportSuccess: FC = () => (
  <div id="report-form" class="py-10 text-center">
    <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-subtle text-success-subtle-foreground shadow-raised">
      <i data-lucide="circle-check" class="h-6 w-6" aria-hidden="true"></i>
    </span>
    <h2 class="mt-5 text-2xl font-bold">Got it. Thank you.</h2>
    <p class="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground text-pretty">
      Genuinely — a good bug report is worth more than most feature requests. If you left an address
      we will write back once we know what happened.
    </p>
    <p class="mt-6 text-sm text-muted-foreground">
      <a href="/report" class="font-medium text-primary underline underline-offset-4">
        Report another
      </a>
    </p>
  </div>
);

export const ReportPage: FC<{ product?: string }> = ({ product }) => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container size="wide">
        <div class="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <SectionHeading
              as="h1"
              eyebrow="Report a bug"
              title="Something broken? Tell us."
              lede="No account, no tracker to sign up for, no template to fill in. Two boxes and you are done."
            />
            <Card class="p-7 sm:p-8">
              <ReportForm product={product} />
            </Card>
          </div>

          <div class="space-y-5">
            <Card class="p-6">
              <IconTile icon="zap" tone="brand" />
              <h2 class="mt-4 font-bold">What helps most</h2>
              <ul class="mt-3 space-y-2.5 text-sm text-muted-foreground">
                <li class="flex gap-2.5">
                  <i
                    data-lucide="check"
                    class="mt-0.5 h-4 w-4 shrink-0 text-brand"
                    aria-hidden="true"
                  ></i>
                  What you clicked, in order
                </li>
                <li class="flex gap-2.5">
                  <i
                    data-lucide="check"
                    class="mt-0.5 h-4 w-4 shrink-0 text-brand"
                    aria-hidden="true"
                  ></i>
                  What you expected instead
                </li>
                <li class="flex gap-2.5">
                  <i
                    data-lucide="check"
                    class="mt-0.5 h-4 w-4 shrink-0 text-brand"
                    aria-hidden="true"
                  ></i>
                  Whether it happens every time
                </li>
              </ul>
            </Card>

            <Card class="p-6">
              <IconTile icon="shield-check" tone="brand" />
              <h2 class="mt-4 font-bold">Found a security problem?</h2>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                Please don't use this form. Mail it instead, so the details stay between us until
                there is a fix.
              </p>
              <a
                href={`mailto:${CONTACT.address}?subject=${encodeURIComponent("Zipr security report")}`}
                class="mt-3 inline-block font-mono text-sm font-medium text-primary underline underline-offset-4 wrap-anywhere"
              >
                {CONTACT.address}
              </a>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  </Page>
);
