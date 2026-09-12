import type { FC, Child } from "hono/jsx";

/**
 * The site's layout vocabulary.
 *
 * Two systems meeting: the structure is Swiss — a wide measure, a real grid,
 * generous vertical rhythm, one weight of emphasis per screen — and the
 * surfaces are the client's clay, so the page a visitor reads and the app they
 * download look like one product.
 *
 * Everything here is a pure function of props, rendered on the server. Nothing
 * in this file may reach for browser state.
 */

/** The page's horizontal measure. `wide` for tables, `prose` for reading. */
export const Container: FC<{
  size?: "prose" | "default" | "wide";
  class?: string;
  children?: Child;
}> = ({ size = "default", class: className = "", children }) => {
  const width = size === "prose" ? "max-w-2xl" : size === "wide" ? "max-w-7xl" : "max-w-6xl";
  return <div class={`mx-auto w-full ${width} px-5 sm:px-8 ${className}`}>{children}</div>;
};

/**
 * Every page starts here. `pt-14` clears the fixed header exactly; the extra
 * top padding is the page's own air, so a page that wants to open with a
 * full-bleed band can drop it without also losing the header offset.
 */
export const Page: FC<{ children?: Child }> = ({ children }) => (
  <div class="pt-14 animate-in fade-in duration-500">{children}</div>
);

/** A labelled band. `muted` alternates the background to separate sections. */
export const Section: FC<{
  id?: string;
  tone?: "default" | "muted";
  class?: string;
  children?: Child;
}> = ({ id, tone = "default", class: className = "", children }) => (
  <section id={id} class={`py-16 sm:py-24 ${tone === "muted" ? "bg-muted/40" : ""} ${className}`}>
    {children}
  </section>
);

/**
 * The small uppercase label above a heading.
 *
 * Tracked and sized to stay legible at that weight — uppercase at 12px with
 * default tracking is measurably harder to read than the same string spaced
 * out, and this appears above every section on the site.
 */
export const Eyebrow: FC<{ children?: Child }> = ({ children }) => (
  <p class="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-subtle-foreground">
    {children}
  </p>
);

export const SectionHeading: FC<{
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}> = ({ eyebrow, title, lede, align = "left", as: Heading = "h2" }) => (
  <div class={`${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} mb-12`}>
    {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
    <Heading
      class={
        Heading === "h1"
          ? "text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          : "text-3xl font-bold tracking-tight text-balance sm:text-4xl"
      }
    >
      {title}
    </Heading>
    {lede ? (
      <p class="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">{lede}</p>
    ) : null}
  </div>
);

/** A clay surface. `flat` drops the lift for cards that sit inside one. */
export const Card: FC<{
  tone?: "raised" | "flat" | "well";
  class?: string;
  /** HTMX needs a stable target for any fragment it swaps in place. */
  id?: string;
  children?: Child;
}> = ({ tone = "raised", class: className = "", id, children }) => {
  const base =
    tone === "well"
      ? "clay-well"
      : tone === "flat"
        ? "rounded-[var(--radius-lg)] border border-border bg-card"
        : "clay";
  return (
    <div id={id} class={`${base} ${className}`}>
      {children}
    </div>
  );
};

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground shadow-raised hover:brightness-110",
  secondary: "bg-secondary text-secondary-foreground shadow-raised hover:brightness-105",
  outline: "border border-border-strong bg-card text-foreground shadow-raised hover:bg-muted",
  ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
};

/**
 * The client's button, as an anchor.
 *
 * `clay-press` is what makes a click read as physical rather than as a colour
 * change, and it is the same gesture in the app — a pixel down, the shadow
 * collapsing inward. Every raised variant carries it.
 */
export const LinkButton: FC<{
  href: string;
  variant?: ButtonVariant;
  size?: "default" | "lg";
  class?: string;
  download?: boolean;
  rel?: string;
  target?: string;
  children?: Child;
}> = ({
  href,
  variant = "primary",
  size = "default",
  class: className = "",
  children,
  ...rest
}) => (
  <a
    href={href}
    class={`clay-press inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] font-semibold no-underline [&_svg]:size-4 [&_svg]:shrink-0 ${
      size === "lg" ? "h-12 px-6 text-base" : "h-10 px-4 text-sm"
    } ${BUTTON_VARIANTS[variant]} ${className}`}
    {...rest}
  >
    {children}
  </a>
);

/** Same shape, for a real `<button>` inside a form. */
export const SubmitButton: FC<{
  variant?: ButtonVariant;
  size?: "default" | "lg";
  class?: string;
  children?: Child;
}> = ({ variant = "primary", size = "default", class: className = "", children }) => (
  <button
    type="submit"
    class={`clay-press inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] font-semibold [&_svg]:size-4 [&_svg]:shrink-0 ${
      size === "lg" ? "h-12 px-6 text-base" : "h-10 px-4 text-sm"
    } ${BUTTON_VARIANTS[variant]} ${className}`}
  >
    {children}
  </button>
);

export const Badge: FC<{
  tone?: "neutral" | "primary" | "brand" | "success" | "warning";
  class?: string;
  children?: Child;
}> = ({ tone = "neutral", class: className = "", children }) => {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    primary: "bg-primary-subtle text-primary-subtle-foreground",
    brand: "bg-brand-subtle text-brand-subtle-foreground",
    success: "bg-success-subtle text-success-subtle-foreground",
    warning: "bg-warning-subtle text-warning-subtle-foreground",
  };
  return (
    <span
      class={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
};

/**
 * A yes or a no in the comparison table.
 *
 * The mark carries a visually-hidden word as well as a shape, because a table
 * whose only answer is a green tick is unreadable to a screen reader and
 * ambiguous to anyone who cannot separate it from the red cross.
 *
 * `relative` on the wrapper is load-bearing, not decoration. Tailwind's
 * `sr-only` is `position: absolute`, so without a positioned ancestor these
 * spans resolve against the nearest one — which is the page's `<main>`. They
 * then sit at their static position *inside a horizontally scrolled table*,
 * escape its scroll container, and stretch the document a couple of hundred
 * pixels wider than the phone holding it. The whole site scrolls sideways
 * because of two hidden words.
 */
export const Mark: FC<{ value: boolean | string }> = ({ value }) => {
  if (typeof value === "string") {
    return <span class="text-sm font-medium text-foreground">{value}</span>;
  }
  return value ? (
    <span class="relative inline-flex items-center gap-1.5 text-success">
      <i data-lucide="circle-check" class="h-4 w-4" aria-hidden="true"></i>
      <span class="sr-only">Included</span>
    </span>
  ) : (
    <span class="relative inline-flex items-center gap-1.5 text-muted-foreground">
      <i data-lucide="minus" class="h-4 w-4" aria-hidden="true"></i>
      <span class="sr-only">Not included</span>
    </span>
  );
};

/** A tick-led list item, used through the pricing cards and feature lists. */
export const CheckItem: FC<{ children?: Child }> = ({ children }) => (
  <li class="flex gap-3">
    <i data-lucide="check" class="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true"></i>
    <span class="text-sm leading-relaxed text-muted-foreground">{children}</span>
  </li>
);

/**
 * A closing call to action. Every public page ends with one, because a page
 * that answers a question and then stops leaves the reader to hunt the nav.
 */
export const CtaBand: FC<{
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}> = ({ title, body, primary, secondary }) => (
  <Section tone="muted">
    <Container>
      <Card class="px-6 py-12 text-center sm:px-12">
        <h2 class="text-3xl font-bold tracking-tight text-balance">{title}</h2>
        <p class="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">{body}</p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href={primary.href} size="lg">
            {primary.label}
          </LinkButton>
          {secondary ? (
            <LinkButton href={secondary.href} variant="outline" size="lg">
              {secondary.label}
            </LinkButton>
          ) : null}
        </div>
      </Card>
    </Container>
  </Section>
);

/**
 * A native disclosure. Chosen over a scripted accordion because it is
 * keyboard-accessible, searchable by the browser's find-in-page, and works
 * with no JavaScript at all — which matters for an FAQ that answers the
 * objection standing between a reader and a purchase.
 */
export const Disclosure: FC<{ question: string; children?: Child }> = ({ question, children }) => (
  <details class="group border-b border-border py-5">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
      <span class="text-pretty">{question}</span>
      <i
        data-lucide="chevron-down"
        class="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
        aria-hidden="true"
      ></i>
    </summary>
    <div class="mt-3 text-muted-foreground leading-relaxed text-pretty">{children}</div>
  </details>
);
