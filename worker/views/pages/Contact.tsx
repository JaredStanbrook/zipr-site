import type { FC, Child } from "hono/jsx";

import { CONTACT, REPOS } from "@server/content/site";
import { ENQUIRY_TOPICS, type EnquiryForm } from "@server/schema/enquiry.schema";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  SubmitButton,
  Eyebrow,
} from "@views/components/Ui";

const TOPIC_LABELS: Record<(typeof ENQUIRY_TOPICS)[number], string> = {
  licence: "Licensing, a quote, or a trial",
  "self-hosting": "Running the deployment",
  support: "Something is broken",
  security: "A security report",
  other: "Something else",
};

/** Field errors, keyed the way Zod's flattened output keys them. */
export type FieldErrors = Partial<Record<keyof EnquiryForm, string[]>>;

const FIELD_CLASS =
  "w-full rounded-[var(--radius-sm)] border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";

const Field: FC<{
  name: string;
  label: string;
  hint?: string;
  errors?: string[];
  required?: boolean;
  children?: Child;
}> = ({ name, label, hint, errors, required, children }) => {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  return (
    /*
     * A column with the input pushed to the bottom, so two fields sitting side
     * by side in the grid line up even when only one of them carries a hint.
     * Without it the hint shoves its own input a line lower than its neighbour.
     */
    <div class="flex h-full flex-col">
      <label for={name} class="block text-sm font-semibold">
        {label}
        {required ? (
          <span class="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        ) : (
          <span class="ml-2 text-xs font-normal text-muted-foreground">Optional</span>
        )}
      </label>
      {hint ? (
        <p id={hintId} class="mt-1 text-xs text-muted-foreground text-pretty">
          {hint}
        </p>
      ) : null}
      <div class="mt-auto pt-2">{children}</div>
      {errors?.length ? (
        /* `role="alert"` so the message is announced, not just coloured — a
           red border is invisible to a screen reader and to a good number of
           the people who most need the correction. */
        <p id={errorId} role="alert" class="mt-1.5 text-sm font-medium text-destructive">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
};

/**
 * The form, as its own fragment so the route can swap just this on a
 * validation failure and leave the rest of the page — and the visitor's scroll
 * position — where they were.
 */
export const ContactForm: FC<{
  values?: Partial<Record<string, string>>;
  errors?: FieldErrors;
  topic?: string;
}> = ({ values = {}, errors = {}, topic }) => {
  const selected = values.topic ?? topic ?? "other";
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      id="contact-form"
      hx-post="/contact"
      hx-target="#contact-form"
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
          <span>Have a look at the fields below — a couple need fixing.</span>
        </div>
      ) : null}

      <div class="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Your name" errors={errors.name} required>
          <input
            id="name"
            name="name"
            type="text"
            autocomplete="name"
            required
            value={values.name ?? ""}
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            class={FIELD_CLASS}
          />
        </Field>

        <Field name="email" label="Email" errors={errors.email} required>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            value={values.email ?? ""}
            aria-invalid={errors.email ? "true" : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            class={FIELD_CLASS}
          />
        </Field>

        <Field name="organisation" label="Organisation" errors={errors.organisation}>
          <input
            id="organisation"
            name="organisation"
            type="text"
            autocomplete="organization"
            value={values.organisation ?? ""}
            class={FIELD_CLASS}
          />
        </Field>

        <Field
          name="seats"
          label="Roughly how many people"
          hint="A guess is fine. It only shapes the answer."
          errors={errors.seats}
        >
          <input
            id="seats"
            name="seats"
            type="number"
            min="1"
            inputmode="numeric"
            value={values.seats ?? ""}
            aria-invalid={errors.seats ? "true" : undefined}
            aria-describedby={errors.seats ? "seats-error" : "seats-hint"}
            class={`${FIELD_CLASS} tabular`}
          />
        </Field>
      </div>

      <Field name="topic" label="What is this about" errors={errors.topic} required>
        <select id="topic" name="topic" class={FIELD_CLASS}>
          {ENQUIRY_TOPICS.map((value) => (
            <option value={value} selected={value === selected}>
              {TOPIC_LABELS[value]}
            </option>
          ))}
        </select>
      </Field>

      <Field
        name="message"
        label="Your message"
        hint="What you are trying to do, and what you need from us."
        errors={errors.message}
        required
      >
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "message-error" : "message-hint"}
          class={FIELD_CLASS}
        >
          {values.message ?? ""}
        </textarea>
      </Field>

      {/*
        Honeypot. Positioned off-screen rather than `display: none`, because
        some bots skip hidden inputs but almost none skip positioned ones, and
        `tabindex="-1"` plus `aria-hidden` keeps it out of a real person's way
        entirely. `autocomplete="off"` stops a browser helpfully filling it in
        and getting a genuine visitor silently dropped.
      */}
      <div class="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label for="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabindex={-1} autocomplete="off" value="" />
      </div>

      <div class="flex flex-wrap items-center gap-4 pt-1">
        <SubmitButton size="lg">
          <i data-lucide="send" class="h-4 w-4" aria-hidden="true"></i>
          Send it
        </SubmitButton>
        <p class="text-xs text-muted-foreground text-pretty">
          We use this to answer you and nothing else. No list, no tracking.
        </p>
      </div>
    </form>
  );
};

/** What replaces the form once it has been accepted. */
export const ContactSuccess: FC<{ name: string }> = ({ name }) => (
  <div id="contact-form" class="py-10 text-center">
    <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-subtle text-success-subtle-foreground">
      <i data-lucide="circle-check" class="h-6 w-6" aria-hidden="true"></i>
    </span>
    <h2 class="mt-5 text-2xl font-bold">Thanks, {name}.</h2>
    <p class="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground text-pretty">
      That has landed. We answer from a real inbox rather than an autoresponder, so give it a
      working day — and if it is urgent, mail{" "}
      <a
        href={`mailto:${CONTACT.support}`}
        class="font-medium text-primary underline underline-offset-4 wrap-anywhere"
      >
        {CONTACT.support}
      </a>{" "}
      directly.
    </p>
  </div>
);

const DIRECT_ROUTES = [
  {
    icon: "receipt-text",
    title: "Licensing and quotes",
    address: CONTACT.sales,
    body: "Trials, seat counts, invoicing, and anything about what a deployment would cost you.",
  },
  {
    icon: "life-buoy",
    title: "Support",
    address: CONTACT.support,
    body: "For licensed teams: deployment trouble, bugs, and questions the docs do not answer.",
  },
  {
    icon: "shield-check",
    title: "Security",
    address: CONTACT.security,
    body: "Vulnerability reports. Please mail these rather than opening a public issue.",
  },
];

export const ContactPage: FC<{ topic?: string }> = ({ topic }) => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container size="wide">
        <div class="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          {/* ---------- FORM ---------- */}
          <div>
            <SectionHeading
              as="h1"
              eyebrow="Contact"
              title="Tell us what you need"
              lede="Whether it is a licence, a deployment that will not start, or a question about whether Zipr suits how your team works — this reaches a person."
            />
            <Card class="p-7 sm:p-8">
              <ContactForm topic={topic} />
            </Card>
          </div>

          {/* ---------- DIRECT ---------- */}
          <div class="space-y-5">
            <div>
              <Eyebrow>Or mail us directly</Eyebrow>
              <p class="text-sm leading-relaxed text-muted-foreground text-pretty">
                The form is easier for us to track, but nothing is lost by writing straight to one
                of these.
              </p>
            </div>

            {DIRECT_ROUTES.map((route) => (
              <Card tone="flat" class="p-5">
                <h2 class="flex items-center gap-2 font-bold">
                  <i data-lucide={route.icon} class="h-4 w-4 text-brand" aria-hidden="true"></i>
                  {route.title}
                </h2>
                <a
                  href={`mailto:${route.address}`}
                  class="mt-2 block font-mono text-sm font-medium text-primary underline underline-offset-4 wrap-anywhere"
                >
                  {route.address}
                </a>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {route.body}
                </p>
              </Card>
            ))}

            {REPOS.showRepoLinks ? (
              <Card tone="flat" class="p-5">
                <h2 class="flex items-center gap-2 font-bold">
                  <i data-lucide="bug" class="h-4 w-4 text-brand" aria-hidden="true"></i>
                  Found a bug?
                </h2>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  Issues go in the repository they belong to, so they end up next to the code that
                  has to change.
                </p>
                <div class="mt-3 flex flex-wrap gap-4">
                  <a
                    href={`${REPOS.client}/issues`}
                    rel="noopener noreferrer"
                    target="_blank"
                    class="text-sm font-medium text-primary underline underline-offset-4"
                  >
                    Client issues
                  </a>
                  <a
                    href={`${REPOS.api}/issues`}
                    rel="noopener noreferrer"
                    target="_blank"
                    class="text-sm font-medium text-primary underline underline-offset-4"
                  >
                    API issues
                  </a>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  </Page>
);
