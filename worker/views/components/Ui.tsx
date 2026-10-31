import type { FC, Child } from "hono/jsx";

import { SCREENSHOTS, SCREENSHOT_BASE, type ScreenshotId } from "@server/content/site";

/**
 * The site's layout vocabulary.
 *
 * Structured sections, precise geometry, generous spacing — and flat. The
 * page is paper; content sits on it, never above it. Depth is three layers of
 * flat paint (paper, grey, ink, in that order and no further), and the one way
 * to set content apart is a well: a grey tray cut into the page, used
 * sparingly. See the header of `index.css` for the whole system.
 *
 * Headings are Space Grotesk, body is Inter, and anything technical is
 * monospace.
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
 * Every page starts here. The header is a flat 64px bar fixed to the top
 * edge, so `pt-20` clears it with a little air; a page's first section adds
 * its own on top.
 */
export const Page: FC<{ children?: Child }> = ({ children }) => (
  <div class="pt-20 animate-in fade-in duration-500">{children}</div>
);

/**
 * A labelled band. `muted` paints it grey, edge to edge — layer two, flat.
 * For one piece of content that needs setting apart, use a `Well` instead.
 */
export const Section: FC<{
  id?: string;
  tone?: "default" | "muted";
  class?: string;
  children?: Child;
}> = ({ id, tone = "default", class: className = "", children }) => (
  <section id={id} class={`py-16 sm:py-24 ${tone === "muted" ? "surface-grey" : ""} ${className}`}>
    {children}
  </section>
);

/**
 * A well: grey, cut a hair into the page. The only place content in the body
 * may sit "inside" something — so use it sparingly, for the one thing on a
 * screen that should be set apart. Grey buttons inside one turn white.
 */
export const Well: FC<{
  class?: string;
  id?: string;
  as?: "div" | "section" | "aside" | "figure";
  label?: string;
  children?: Child;
}> = ({ class: className = "", id, as: Tag = "div", label, children }) => (
  <Tag id={id} class={`well ${className}`} aria-label={label}>
    {children}
  </Tag>
);

/**
 * The small label above a heading: one orange square — the logo's unit — and
 * the label, tracked out. Tracked because uppercase at this size with default
 * spacing is measurably harder to read, and this sits above every section.
 */
export const Eyebrow: FC<{ children?: Child; class?: string }> = ({
  children,
  class: className = "",
}) => (
  <p
    class={`mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground text-balance ${className}`}
  >
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
    {eyebrow ? (
      <Eyebrow class={align === "center" ? "text-center" : undefined}>{eyebrow}</Eyebrow>
    ) : null}
    <Heading
      class={
        Heading === "h1"
          ? "text-[2.6rem] leading-[1.0] text-balance sm:text-6xl lg:text-7xl"
          : "text-3xl leading-[1.05] text-balance sm:text-[2.75rem]"
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
 * A card. Flat on the page with a hairline edge — never lifted off it. `well`
 * cuts it into the page instead, for the one card on a screen that should be
 * set apart. (`raised` and `floating` are the old names for the flat card and
 * still render as one.) `lift` sharpens the edge under the pointer.
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
  const base = tone === "well" ? "well" : "flat";
  return (
    <div id={id} style={style} class={`${base} ${lift ? "clay-lift" : ""} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Buttons are coloured by where they go, not by how much they matter:
 *
 *   primary (black)        leaves the page — another page, a download, a site.
 *   outline (black edge)   a second way off the page, beside a first.
 *   secondary (grey)       stays on the page — a toggle, a jump, a submit that
 *                          swaps in place. White on any grey surface.
 *   ghost                  a quiet in-page control.
 *   inverse                the old name for a button on a slab; now grey.
 *   important              the one call to action on a screen that matters
 *                          most: frosted glass with a slow orange-to-clay
 *                          glow turning round its rim. Use once per screen.
 *
 * Every one of them glows on hover and focus (`.btn` in index.css).
 */
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "inverse" | "important";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "btn-ink",
  outline: "btn-ink-outline",
  secondary: "btn-grey",
  inverse: "btn-grey",
  ghost: "btn-ghost",
  important: "btn-important",
};

/** The rotating inner glow an `important` button carries. */
const GlassGlow: FC = () => <span class="glass-glow" aria-hidden="true"></span>;

const buttonClass = (variant: ButtonVariant, size: "default" | "lg", extra: string) =>
  `btn inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-btn)] font-semibold no-underline transition-colors [&_svg]:size-4 [&_svg]:shrink-0 ${
    size === "lg" ? "h-12 px-6 text-base" : "h-11 px-5 text-sm"
  } ${BUTTON_VARIANTS[variant]} ${extra}`;

/** A link that stays on this page is an in-page action, so it is grey. */
const variantFor = (href: string): ButtonVariant =>
  href.startsWith("#") ? "secondary" : "primary";

/**
 * A button that is a link. Its colour follows its destination unless told
 * otherwise: a `#fragment` stays on the page and is grey, anything else
 * leaves it and is black.
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
}> = ({ href, variant, size = "default", class: className = "", children, ...rest }) => {
  const resolved = variant ?? variantFor(href);
  return (
    <a href={href} class={buttonClass(resolved, size, className)} {...rest}>
      {resolved === "important" ? <GlassGlow /> : null}
      {children}
    </a>
  );
};

/** Same shape, for a real `<button>` inside a form. A submit that swaps its
 *  result in place stays on the page, so it is grey unless told otherwise. */
export const SubmitButton: FC<{
  variant?: ButtonVariant;
  size?: "default" | "lg";
  class?: string;
  children?: Child;
}> = ({ variant = "secondary", size = "default", class: className = "", children }) => (
  <button type="submit" class={buttonClass(variant, size, className)}>
    {children}
  </button>
);

/** A plain in-page `<button>`: grey, glowing, and the shape of the others. */
export const ActionButton: FC<{
  variant?: ButtonVariant;
  size?: "default" | "lg";
  class?: string;
  id?: string;
  label?: string;
  pressed?: boolean;
  data?: Record<string, string>;
  children?: Child;
}> = ({
  variant = "secondary",
  size = "default",
  class: className = "",
  id,
  label,
  pressed,
  data = {},
  children,
}) => (
  <button
    type="button"
    id={id}
    aria-label={label}
    aria-pressed={pressed === undefined ? undefined : pressed ? "true" : "false"}
    class={buttonClass(variant, size, className)}
    {...Object.fromEntries(Object.entries(data).map(([k, v]) => [`data-${k}`, v]))}
  >
    {children}
  </button>
);

/**
 * The small square that holds a section's icon. Flat: `primary` is a solid
 * orange square carrying a near-black glyph, `brand` a hairline square on
 * whatever surface it sits on. Square, untilted — the grid is the point.
 */
export const IconTile: FC<{
  icon: string;
  tone?: "primary" | "brand";
  size?: "default" | "lg";
  class?: string;
}> = ({ icon, tone = "primary", size = "default", class: className = "" }) => (
  <span
    class={`inline-flex shrink-0 items-center justify-center rounded-[var(--radius-md)] ${
      size === "lg" ? "h-14 w-14" : "h-11 w-11"
    } ${
      tone === "brand"
        ? "border border-border bg-surface text-foreground"
        : "bg-orange text-orange-foreground"
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
    primary: "bg-orange text-orange-foreground",
    brand: "bg-ink text-ink-foreground",
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
    <span class="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-success-subtle text-success-subtle-foreground">
      <i data-lucide="check" class="h-4 w-4" aria-hidden="true"></i>
      <span class="sr-only">Included</span>
    </span>
  ) : (
    <span class="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <i data-lucide="minus" class="h-4 w-4" aria-hidden="true"></i>
      <span class="sr-only">Not included</span>
    </span>
  );
};

/** A tick-led list item, used through the pricing cards and feature lists. */
export const CheckItem: FC<{ children?: Child }> = ({ children }) => (
  <li class="flex gap-3">
    <span class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-xs)] bg-orange text-orange-foreground">
      <i data-lucide="check" class="h-3 w-3" aria-hidden="true"></i>
    </span>
    <span class="text-sm leading-relaxed text-muted-foreground">{children}</span>
  </li>
);

/**
 * A horizontally scrollable table on a flat, bordered frame. The frame is the
 * scroll container, so a wide table scrolls inside it rather than out of it.
 */
export const TableFrame: FC<{ class?: string; children?: Child }> = ({
  class: className = "",
  children,
}) => <div class={`flat overflow-x-auto ${className}`}>{children}</div>;

/**
 * The logo, built from bricks.
 *
 * `public/logo.svg` is a 16x4 grid of square blocks (see the note in that
 * file), which means it can be assembled out of flat orange squares rather
 * than drawn — and the bricks can zip shut left to right when the page loads,
 * which is what the mark depicts. Each row is the SVG's rects, one character
 * per cell. Exported for the footer, which builds its raised copy in `html`.
 */
export const LOGO_ROWS = [
  ".OOOOOOOOOOO....",
  "..O.O.O.O.O.OOOO",
  ".O.O.O.O.O.OO.OO",
  "OOOOOOOOOOO.....",
];

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
 * It used to be a slab of orange; now it is a well — the page's one piece of
 * emphasis, cut in rather than shouted. Asymmetric: the argument on the left,
 * the way out on the right.
 */
export const CtaBand: FC<{
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}> = ({ title, body, primary, secondary }) => (
  <Section>
    <Container size="wide">
      <div class="well grid gap-10 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-12 lg:items-end">
        <div class="lg:col-span-7">
          <Eyebrow>Next step</Eyebrow>
          <h2 class="max-w-3xl text-4xl leading-[1.02] text-balance sm:text-5xl">{title}</h2>
          <p class="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {body}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3 lg:col-span-5 lg:justify-end">
          <LinkButton href={primary.href} variant="important" size="lg">
            {primary.label}
            <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
          </LinkButton>
          {secondary ? (
            <LinkButton href={secondary.href} variant="outline" size="lg">
              {secondary.label}
            </LinkButton>
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
 * Flat rows ruled by a hairline. The chevron is a grey in-page control, and
 * the row glows while it has focus.
 */
export const Disclosure: FC<{ question: string; children?: Child }> = ({ question, children }) => (
  <details class="group border-b border-border py-1 first:border-t">
    <summary class="glow flex cursor-pointer list-none items-center justify-between gap-4 rounded-[var(--radius-md)] bg-surface px-1 py-4 font-display text-lg font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
      <span class="text-pretty">{question}</span>
      <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-btn)] bg-[var(--btn-grey)] transition group-open:bg-ink group-open:[&_svg]:text-ink-foreground">
        <i
          data-lucide="chevron-down"
          class="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        ></i>
      </span>
    </summary>
    <div class="px-1 pb-5 leading-relaxed text-muted-foreground text-pretty">{children}</div>
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
export const Screenshot: FC<{
  id: ScreenshotId;
  eager?: boolean;
  class?: string;
  /** Wrap in the lightbox trigger. Off only where a parent already is one. */
  zoom?: boolean;
}> = ({ id, eager = false, class: className = "", zoom = true }) => {
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
  const pictures = (
    <span class={`shot block ${className}`}>
      {image("light")}
      {image("dark")}
    </span>
  );
  return zoom ? <ZoomTrigger>{pictures}</ZoomTrigger> : pictures;
};

/**
 * Makes a picture open in the lightbox (`lib/lightbox.ts`, one `<dialog>` in
 * the layout). It is a real button, so it is reachable and operable from the
 * keyboard; its name comes from the picture's own alt text, and
 * `aria-haspopup="dialog"` says what it does. Without JavaScript it is simply
 * a picture.
 */
export const ZoomTrigger: FC<{ children?: Child }> = ({ children }) => (
  <button
    type="button"
    data-lightbox
    aria-haspopup="dialog"
    class="zoom-trigger block w-full cursor-zoom-in rounded-[var(--radius-lg)] text-left"
  >
    {children}
  </button>
);

/**
 * A screenshot that runs off the edge of the page: drawn wider than its
 * column, so part of it sits on the page and the rest is clipped by the
 * section (which must carry `overflow-x-clip`). Clicking it still opens the
 * whole picture in the viewer.
 *
 * `spill` is how wide the picture is against its column — "150%" puts a third
 * of it past the edge.
 */
export const EdgeShot: FC<{
  id: ScreenshotId;
  edge?: "left" | "right";
  spill?: "130%" | "150%" | "170%";
  eager?: boolean;
  class?: string;
}> = ({ id, edge = "right", spill = "150%", eager = false, class: className = "" }) => (
  <div class={`edge-shot ${className}`} data-edge={edge} style={`--spill: ${spill};`}>
    <Screenshot id={id} eager={eager} />
  </div>
);

/**
 * A horizontal marquee: its items slide across the page and off it, on a
 * loop, and can be grabbed and dragged — let go, and it carries on. The
 * motion is `lib/marquee.ts`; without JavaScript this is an ordinary
 * horizontal scroller, and with reduced motion it does not move by itself.
 *
 * `direction` is the way the content travels.
 */
export const Marquee: FC<{
  label: string;
  direction?: "left" | "right";
  /** Pixels per second. */
  speed?: number;
  gap?: string;
  class?: string;
  children?: Child;
}> = ({
  label,
  direction = "left",
  speed = 36,
  gap = "1.25rem",
  class: className = "",
  children,
}) => (
  <div
    class={`marquee relative ${className}`}
    data-marquee
    data-direction={direction}
    data-speed={String(speed)}
    style={`--gap: ${gap};`}
  >
    <div
      class="marquee-viewport"
      data-marquee-viewport
      role="region"
      aria-label={label}
      tabindex={0}
    >
      <ul class="marquee-track" data-marquee-track>
        {children}
      </ul>
    </div>
  </div>
);

/** A row of screenshots in a marquee, each one opening in the viewer. */
export const ScreenshotMarquee: FC<{
  ids: ScreenshotId[];
  label: string;
  direction?: "left" | "right";
  speed?: number;
}> = ({ ids, label, direction = "right", speed = 30 }) => (
  <Marquee label={label} direction={direction} speed={speed} gap="1.5rem">
    {ids.map((id) => (
      <li class="marquee-shot">
        <Screenshot id={id} />
      </li>
    ))}
  </Marquee>
);

/**
 * Product video that behaves like a GIF: centred, muted, on a loop, starting
 * by itself — `playsinline` so a phone does not hijack it into full screen,
 * and no controls, because there is nothing to control. One file per theme,
 * shown the way the screenshots are. The poster is the first frame, so the
 * picture is right before the first byte arrives and stays right for anyone
 * whose browser declines to autoplay. Each clip starts and ends on the same
 * frame, so the loop has no seam.
 */
export const LoopVideo: FC<{
  /** Base path without the theme or extension: `/media/editor-pan` serves
   *  `editor-pan-light.webm`, `.mp4` and `.jpg`, and their dark twins. */
  src: string;
  width: number;
  height: number;
  label: string;
  class?: string;
}> = ({ src, width, height, label, class: className = "" }) => (
  <div class={`mx-auto w-full max-w-4xl ${className}`}>
    {(["light", "dark"] as const).map((theme) => (
      <video
        class={`loop-video shot-${theme}`}
        poster={`${src}-${theme}.jpg`}
        width={width}
        height={height}
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        aria-label={label}
      >
        {/* WebM first: smaller, and the only one an open-source Chromium can
            play. MP4 for Safari. */}
        <source src={`${src}-${theme}.webm`} type="video/webm" />
        <source src={`${src}-${theme}.mp4`} type="video/mp4" />
      </video>
    ))}
  </div>
);
