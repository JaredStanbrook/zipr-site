import type { FC, Child } from "hono/jsx";

import { SCREENSHOTS, SCREENSHOT_BASE, type ScreenshotId } from "@server/content/site";

/**
 * The site's layout vocabulary.
 *
 * Two systems meeting: the structure is Swiss — a wide measure, a real grid,
 * generous vertical rhythm, one weight of emphasis per screen — and the
 * surfaces are the client's clay, so the page a visitor reads and the app they
 * download look like one product.
 *
 * The clay goes all the way down now. Sections are trays pressed into the
 * page, the primary action is a lump of lit orange with a lip under it, the
 * headings are a soft serif that looks moulded rather than typeset, and the
 * logo is built out of bricks rather than printed. Depth is still a
 * vocabulary — raised, pressed, well, tray — never a shadow guessed per box.
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
 * Every page starts here. The header floats a few pixels below the top edge
 * and is 56px tall, so `pt-20` clears it with a little air; a page's first
 * section adds its own on top.
 */
export const Page: FC<{ children?: Child }> = ({ children }) => (
  <div class="pt-20 animate-in fade-in duration-500">{children}</div>
);

/**
 * A labelled band. `muted` no longer paints a stripe: it presses the band into
 * the page as a tray with rounded ends, inset from the viewport edge so the
 * rim of the tray is visible on both sides.
 */
export const Section: FC<{
  id?: string;
  tone?: "default" | "muted";
  class?: string;
  children?: Child;
}> = ({ id, tone = "default", class: className = "", children }) =>
  tone === "muted" ? (
    <section id={id} class="px-2 py-4 sm:px-4">
      <div
        class={`clay-tray mx-auto max-w-[96rem] rounded-[2rem] py-16 sm:rounded-[3rem] sm:py-24 ${className}`}
      >
        {children}
      </div>
    </section>
  ) : (
    <section id={id} class={`py-16 sm:py-24 ${className}`}>
      {children}
    </section>
  );

/**
 * The small label above a heading, as a raised chip with a lit dot.
 *
 * Tracked and sized to stay legible — uppercase at 12px with default tracking
 * is measurably harder to read than the same string spaced out, and this
 * appears above every section on the site.
 */
export const Eyebrow: FC<{ children?: Child; class?: string }> = ({
  children,
  class: className = "",
}) => (
  <p
    class={`clay-raised mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-brand-subtle-foreground ${className}`}
  >
    <span
      class="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_0_3px_var(--primary-subtle)]"
      aria-hidden="true"
    ></span>
    {children}
  </p>
);

export const SectionHeading: FC<{
  eyebrow?: string;
  title: Child;
  lede?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}> = ({ eyebrow, title, lede, align = "left", as: Heading = "h2" }) => (
  <div class={`${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} mb-12`}>
    {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
    <Heading
      class={
        Heading === "h1"
          ? "text-[2.6rem] leading-[1.02] text-balance sm:text-6xl lg:text-7xl"
          : "text-3xl leading-[1.08] text-balance sm:text-[2.75rem]"
      }
    >
      {title}
    </Heading>
    {lede ? (
      <p class="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">{lede}</p>
    ) : null}
  </div>
);

/**
 * A clay surface, in the three states the client's own stylesheet defines: one
 * sitting above the page, one cut into it, and one floating over it.
 *
 * There is deliberately no flat, bordered tone. A bordered box is the thing
 * claymorphism replaces — depth instead of lines. `lift` makes the surface
 * rise towards the pointer, for cards a reader is likely to scan across.
 */
export const Card: FC<{
  tone?: "raised" | "floating" | "well";
  lift?: boolean;
  class?: string;
  style?: string;
  /** HTMX needs a stable target for any fragment it swaps in place. */
  id?: string;
  children?: Child;
}> = ({ tone = "raised", lift = false, class: className = "", id, style, children }) => {
  const base = tone === "well" ? "clay-well" : tone === "floating" ? "clay-floating" : "clay";
  return (
    <div id={id} style={style} class={`${base} ${lift ? "clay-lift" : ""} ${className}`}>
      {children}
    </div>
  );
};

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "inverse";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "clay-primary",
  secondary: "clay-press bg-secondary text-secondary-foreground shadow-raised hover:brightness-105",
  outline: "clay-press bg-card text-foreground shadow-raised hover:bg-popover",
  ghost: "clay-press text-foreground hover:bg-accent hover:text-accent-foreground",
  /* For a button sitting on a primary-coloured slab, where the primary
     button would vanish into its own background. */
  inverse: "clay-press bg-card text-foreground shadow-floating hover:bg-popover",
};

const buttonClass = (variant: ButtonVariant, size: "default" | "lg", extra: string) =>
  `inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold no-underline transition [&_svg]:size-4 [&_svg]:shrink-0 ${
    size === "lg" ? "h-12 px-6 text-base" : "h-10 px-5 text-sm"
  } ${BUTTON_VARIANTS[variant]} ${extra}`;

/**
 * The client's button, as an anchor.
 *
 * Every variant presses: a pixel down, the shadow collapsing inward, so a
 * click reads as physical rather than as a colour change. The primary has its
 * own three-position version with a lip, in `.clay-primary`.
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
  <a href={href} class={buttonClass(variant, size, className)} {...rest}>
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
  <button type="submit" class={buttonClass(variant, size, className)}>
    {children}
  </button>
);

/**
 * The small square that holds a section's icon.
 *
 * Raised rather than a flat tint: at this size the client's control-scale
 * elevation is exactly right, and it is what stops a page of icons reading as
 * stickers. A little tilt, because a row of perfectly square tiles is a grid
 * and a row of slightly handled ones is a set of objects.
 */
export const IconTile: FC<{
  icon: string;
  tone?: "primary" | "brand";
  size?: "default" | "lg";
  class?: string;
}> = ({ icon, tone = "primary", size = "default", class: className = "" }) => (
  <span
    class={`clay-raised inline-flex shrink-0 -rotate-3 items-center justify-center rounded-[0.9rem] ${
      size === "lg" ? "h-14 w-14" : "h-11 w-11"
    } ${
      tone === "brand"
        ? "bg-brand-subtle text-brand-subtle-foreground"
        : "bg-primary-subtle text-primary-subtle-foreground"
    } ${className}`}
  >
    <i data-lucide={icon} class={size === "lg" ? "h-6 w-6" : "h-5 w-5"} aria-hidden="true"></i>
  </span>
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
      class={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-[inset_0_1px_0_0_var(--clay-highlight),0_1px_2px_var(--clay-shadow)] ${tones[tone]} ${className}`}
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
    <span class="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-success-subtle text-success-subtle-foreground shadow-raised">
      <i data-lucide="check" class="h-4 w-4" aria-hidden="true"></i>
      <span class="sr-only">Included</span>
    </span>
  ) : (
    <span class="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-inset">
      <i data-lucide="minus" class="h-4 w-4" aria-hidden="true"></i>
      <span class="sr-only">Not included</span>
    </span>
  );
};

/** A tick-led list item, used through the pricing cards and feature lists. */
export const CheckItem: FC<{ children?: Child }> = ({ children }) => (
  <li class="flex gap-3">
    <span class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand-subtle-foreground shadow-[inset_0_1px_0_0_var(--clay-highlight),0_1px_2px_var(--clay-shadow)]">
      <i data-lucide="check" class="h-3 w-3" aria-hidden="true"></i>
    </span>
    <span class="text-sm leading-relaxed text-muted-foreground">{children}</span>
  </li>
);

/**
 * A horizontally scrollable table on a clay surface.
 *
 * The scroll container is the clay, so the rounded corners clip the table and
 * a wide one scrolls inside the shape rather than out of a bordered rectangle.
 */
export const TableFrame: FC<{ class?: string; children?: Child }> = ({
  class: className = "",
  children,
}) => <div class={`clay overflow-x-auto ${className}`}>{children}</div>;

/**
 * The logo, built from clay.
 *
 * `public/logo.svg` is a 16x4 grid of square blocks (see the note in that
 * file), which means it can be assembled out of raised bricks rather than
 * drawn — and the bricks can zip shut left to right when the page loads,
 * which is what the mark depicts. Each row is the SVG's rects, one character
 * per cell.
 */
const LOGO_ROWS = [".OOOOOOOOOOO....", "..O.O.O.O.O.OOOO", ".O.O.O.O.O.OO.OO", "OOOOOOOOOOO....."];

export const LogoBricks: FC<{ cell?: string; animate?: boolean; class?: string }> = ({
  cell = "0.9rem",
  animate = true,
  class: className = "",
}) => (
  <div
    class={`grid w-max ${className}`}
    style={`grid-template-columns: repeat(16, ${cell}); gap: calc(${cell} * 0.14);`}
    role="img"
    aria-label="Zipr"
  >
    {LOGO_ROWS.flatMap((row) =>
      row
        .split("")
        .map((c, x) =>
          c === "O" ? (
            <span
              class={`brick ${animate ? "zip-in" : ""}`}
              style={`height: ${cell}; --i: ${x};`}
              aria-hidden="true"
            ></span>
          ) : (
            <span style={`height: ${cell};`} aria-hidden="true"></span>
          ),
        ),
    )}
  </div>
);

/**
 * A closing call to action. Every public page ends with one, because a page
 * that answers a question and then stops leaves the reader to hunt the nav.
 *
 * The one place the site goes loud: a whole slab of lit orange clay, with a
 * few stray bricks resting on it.
 */
export const CtaBand: FC<{
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}> = ({ title, body, primary, secondary }) => (
  <Section>
    <Container>
      <div class="clay-slab relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center sm:px-14 sm:py-20">
        <span
          class="brick float absolute left-[7%] top-[18%] hidden h-7 w-7 sm:block"
          style="--r: -12deg; --d: -1s;"
          aria-hidden="true"
        ></span>
        <span
          class="brick float absolute bottom-[16%] left-[12%] hidden h-4 w-4 sm:block"
          style="--r: 18deg; --d: -3s;"
          aria-hidden="true"
        ></span>
        <span
          class="brick float absolute right-[9%] top-[26%] hidden h-5 w-5 sm:block"
          style="--r: 8deg; --d: -5s;"
          aria-hidden="true"
        ></span>
        <span
          class="brick float absolute bottom-[20%] right-[6%] hidden h-9 w-9 sm:block"
          style="--r: -6deg; --d: -2s;"
          aria-hidden="true"
        ></span>

        <h2 class="relative mx-auto max-w-3xl text-4xl leading-[1.05] text-balance sm:text-5xl">
          {title}
        </h2>
        <p class="relative mx-auto mt-5 max-w-2xl text-lg leading-relaxed opacity-90 text-pretty">
          {body}
        </p>
        <div class="relative mt-9 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href={primary.href} variant="inverse" size="lg">
            {primary.label}
            <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
          </LinkButton>
          {secondary ? (
            <a
              href={secondary.href}
              class="inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold underline decoration-2 underline-offset-[6px] opacity-90 transition hover:opacity-100"
            >
              {secondary.label}
            </a>
          ) : null}
        </div>
      </div>
    </Container>
  </Section>
);

/**
 * A native disclosure. Chosen over a scripted accordion because it is
 * keyboard-accessible, searchable by the browser's find-in-page, and works
 * with no JavaScript at all — which matters for an FAQ that answers the
 * objection standing between a reader and a purchase.
 *
 * Each question is its own raised tile; opening one presses its chevron in.
 */
export const Disclosure: FC<{ question: string; children?: Child }> = ({ question, children }) => (
  <details class="group clay-raised mb-3 rounded-[var(--radius-lg)] px-5 py-4 sm:px-6">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
      <span class="text-pretty">{question}</span>
      <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted shadow-raised transition group-open:shadow-inset">
        <i
          data-lucide="chevron-down"
          class="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        ></i>
      </span>
    </summary>
    <div class="mt-3 pb-1 leading-relaxed text-muted-foreground text-pretty">{children}</div>
  </details>
);

/**
 * A product screenshot that follows the site's theme.
 *
 * Two images, one per theme, and the stylesheet shows the one that matches
 * (`.shot-light` / `.shot-dark` in index.css). A `<picture>` with a
 * `prefers-color-scheme` source would follow the operating system only, and
 * the theme toggle in the header would then disagree with the pictures.
 *
 * The image carries its own corners and shadow (transparent PNG), so nothing
 * here rounds, clips or shades it.
 *
 * The hidden image is lazy, so a browser does not download it. `eager` is for
 * the picture at the top of the page, where lazy loading would delay the
 * largest paint; it costs the hidden variant too, which is the price of not
 * knowing the theme on the server.
 */
export const Screenshot: FC<{ id: ScreenshotId; eager?: boolean; class?: string }> = ({
  id,
  eager = false,
  class: className = "",
}) => {
  const shot = SCREENSHOTS[id];
  const image = (theme: "light" | "dark") => (
    <img
      class={`shot-${theme} h-auto w-full`}
      src={`${SCREENSHOT_BASE}/${id}-${theme}.png`}
      width={shot.width}
      height={shot.height}
      alt={shot.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
  return (
    <span class={`shot block ${className}`}>
      {image("light")}
      {image("dark")}
    </span>
  );
};

/**
 * Two screenshots taking turns in one place, crossfading.
 *
 * Pure CSS: every slide animates on the same cycle, offset by its place in
 * the line, so there is nothing to start, stop or fall out of step. The slides
 * share one grid cell, so the box is as tall as the tallest and does not
 * resize as they change. With reduced motion only the first is shown.
 */
export const ScreenshotSwap: FC<{ ids: [ScreenshotId, ScreenshotId]; class?: string }> = ({
  ids,
  class: className = "",
}) => (
  <div class={`shot-swap ${className}`} style={`--n: ${ids.length};`}>
    {ids.map((id, i) => (
      <div class="shot-slide" style={`--i: ${i};`}>
        <Screenshot id={id} eager={i === 0} />
      </div>
    ))}
  </div>
);
