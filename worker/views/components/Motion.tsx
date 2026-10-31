import type { FC } from "hono/jsx";

import { GALLERY_ROLES } from "@server/content/gallery";
import { Card, Eyebrow, IconTile } from "@views/components/Ui";

/**
 * The scroll-driven showpieces: four steps becoming one click, a chat with
 * Zap, and a role-tabbed carousel of Gallery ideas.
 *
 * Each is ordinary server-rendered markup in its *finished* state. The motion
 * is layered on by CSS (`index.css`, "Scroll motion") and `lib/motion.ts`, which
 * only activates for visitors who allow motion, so with no JavaScript or with
 * reduced motion every one of these reads as a complete, still illustration.
 *
 * The demo content here is a picture of the app, like the screenshots, and is
 * marked `translate="no"` for the same reason. It shows only steps the app has
 * today, and no result Zap could not produce.
 */

/** A soft background object that drifts at its own speed. Decorative only. */
export const ClayPebble: FC<{
  speed: number;
  class: string;
  size: string;
  delay?: string;
}> = ({ speed, class: className, size, delay = "0s" }) => (
  <span
    data-parallax={speed}
    class={`pointer-events-none absolute z-0 hidden lg:block ${className}`}
    aria-hidden="true"
  >
    <span
      class={`float clay-pebble block rounded-[42%] ${size}`}
      style={`--r: 8deg; --d: ${delay};`}
    ></span>
  </span>
);

const ONE_CLICK_STEPS = [
  { icon: "message-square", label: "Ask for Input", line: "Ask what went wrong", side: "left" },
  { icon: "camera", label: "Take Screenshot", line: "Capture the screen as it is", side: "right" },
  {
    icon: "sparkles",
    label: "Generate Text",
    tag: "AI",
    line: "Write it up as a clear report",
    side: "left",
  },
  { icon: "mail", label: "Create Email", line: "Draft it to the IT helpdesk", side: "right" },
] as const;

type OneClickStep = (typeof ONE_CLICK_STEPS)[number];

/** One step card's contents. `mirrored` puts the icon and name on the right,
 *  for a card that starts half off the left-hand edge of the screen. */
const OneClickFace: FC<{ step: OneClickStep; mirrored?: boolean }> = ({
  step,
  mirrored = false,
}) => (
  <span
    class={`oc-face ${mirrored ? "flex-row-reverse text-right" : ""}`}
    data-oc-face={mirrored ? "mirrored" : "normal"}
    aria-hidden={mirrored ? "true" : undefined}
  >
    <IconTile icon={step.icon} tone={step.icon === "sparkles" ? "primary" : "brand"} />
    <span class="min-w-0">
      <span
        class={`flex items-center gap-2 font-mono text-sm font-semibold leading-tight ${
          mirrored ? "justify-end" : ""
        }`}
      >
        {step.label}
        {"tag" in step ? (
          <span class="rounded-[var(--radius-xs)] bg-orange px-1.5 py-px font-sans text-[0.65rem] font-bold text-orange-foreground">
            {step.tag}
          </span>
        ) : null}
      </span>
      <span class="mt-0.5 block truncate text-xs text-muted-foreground">{step.line}</span>
    </span>
  </span>
);

/**
 * Four steps. One click.
 *
 * A pinned, scroll-driven story (`lib/oneclick.ts`, GSAP). A tall track holds
 * a sticky, screen-high stage. The four steps of one real shortcut start half
 * off the page — the first and third centred on the left-hand edge, the
 * second and fourth on the right, staggered down the screen, the left ones
 * laid out mirrored so their icon and name are the half that shows. Scrolling
 * slides them into a column, draws them together into a loose stack, snaps
 * them flush, and then the stack becomes the one button that runs them.
 * Scrolling back plays it backwards.
 *
 * This markup is the finished, still version: with no JavaScript, or with
 * reduced motion, it is the four steps in a column, the button they become,
 * and the caption. The pinned layout hangs off `html.motion` (see "One click"
 * in index.css), so it is in place before the script arrives.
 *
 * The step names are the app's own, so they stay untranslated and monospace.
 */
export const OneClickStory: FC = () => (
  <section id="one-click" class="oneclick" data-oneclick aria-labelledby="one-click-title">
    <div class="oneclick-stage" data-oc-stage>
      <div class="oneclick-head">
        <Eyebrow class="justify-center">One shortcut</Eyebrow>
        <h2 id="one-click-title" class="text-4xl leading-[1.0] text-balance sm:text-6xl">
          Four steps. <em>One click.</em>
        </h2>
      </div>

      <ol
        class="oneclick-cards"
        aria-label="The steps in the Report IT problem shortcut"
        translate="no"
      >
        {ONE_CLICK_STEPS.map((step, k) => (
          <li class="oc-card" data-oc-card data-side={step.side} style={`--k: ${k};`}>
            <span class="oc-fill" data-oc-fill aria-hidden="true"></span>
            <OneClickFace step={step} mirrored />
            <OneClickFace step={step} />
            {k === ONE_CLICK_STEPS.length - 1 ? (
              <span class="oc-label" data-oc-label aria-hidden="true">
                <i data-lucide="play" class="h-4 w-4" aria-hidden="true"></i>
                Report IT problem
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      {/* The button they become, for the still version. The moving version
          grows it out of the front card instead. */}
      <p class="oc-static-result" translate="no">
        <span class="inline-flex h-14 items-center gap-2 rounded-full bg-ink px-7 font-semibold text-ink-foreground">
          <i data-lucide="play" class="h-4 w-4" aria-hidden="true"></i>
          Report IT problem
        </span>
      </p>

      <p class="oneclick-caption" data-oc-caption>
        These four steps are now one click.
      </p>

      <p class="oneclick-hint" data-oc-hint aria-hidden="true">
        <i data-lucide="chevron-down" class="h-4 w-4" aria-hidden="true"></i>
        Scroll
      </p>
    </div>
  </section>
);

/** Timings for the Zap demo, in seconds, so the sequence reads in one place. */
const AT = { user: 0.2, type: 0.5, dots: 2.2, reply: 4.2, steps: [4.6, 5.2, 5.8], run: 6.6 };

const ZAP_NODES = [
  { icon: "circle-help", label: "Choose from List", line: "Client A, Client B, Client C" },
  { icon: "link", label: "Open Link", line: "Open their CRM page" },
  { icon: "folder", label: "Open Folder", line: "Open their shared folder" },
];

/**
 * Zap in action: a chat, set in a well, that plays once as it scrolls into view.
 * A request is typed, Zap thinks, answers, and its three steps connect into a
 * draft shortcut ready to test. Purely a picture — nothing here calls anything.
 */
export const ZapDemo: FC = () => (
  <figure
    class="zapdemo well relative overflow-hidden p-4 sm:p-6"
    data-play
    translate="no"
    aria-label="A demo of Zap turning a request into a shortcut"
  >
    <div class="mb-4 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <IconTile icon="zap" tone="primary" />
        <div>
          <p class="text-sm font-bold leading-tight">Zap</p>
          <p class="text-xs text-muted-foreground">Builds shortcuts from your words</p>
        </div>
      </div>
      <button
        type="button"
        data-replay
        class="btn btn-grey inline-flex h-11 items-center gap-2 rounded-full px-4 text-xs font-semibold"
        aria-label="Replay the demo"
      >
        <i data-lucide="rotate-ccw" class="h-3.5 w-3.5" aria-hidden="true"></i>
        Replay
      </button>
    </div>

    <div class="space-y-3">
      {/* The request, typed. */}
      <div class="flex justify-end">
        <div
          class="zd surface-ink max-w-[88%] rounded-[1.25rem] rounded-br-sm px-4 py-3 text-sm leading-relaxed"
          style={`--at: ${AT.user}s;`}
        >
          <span class="zd-type inline-block" style={`--at: ${AT.type}s;`}>
            Ask which client I'm working with, then open their CRM page and shared folder.
          </span>
        </div>
      </div>

      {/* Zap: thinking, then the answer, in the same bubble. */}
      <div class="flex">
        <div
          class="zd grid max-w-[88%] rounded-[1.25rem] rounded-bl-sm bg-background px-4 py-3 text-sm leading-relaxed"
          style={`--at: ${AT.dots}s;`}
        >
          <span
            class="zd-dots col-start-1 row-start-1 flex items-center gap-1.5 py-1"
            style={`--at: ${AT.dots}s;`}
            aria-hidden="true"
          >
            <span class="h-2 w-2 rounded-full bg-muted-foreground/60"></span>
            <span class="h-2 w-2 rounded-full bg-muted-foreground/60"></span>
            <span class="h-2 w-2 rounded-full bg-muted-foreground/60"></span>
          </span>
          <span class="zd-reply col-start-1 row-start-1" style={`--at: ${AT.reply}s;`}>
            Here's a draft with three steps. Test it before you keep it.
          </span>
        </div>
      </div>

      {/* The steps connect into a draft shortcut. */}
      <div class="rounded-[var(--radius-lg)] border border-border bg-background p-4 sm:p-5">
        <p
          class="zd mb-3 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-primary"
          style={`--at: ${AT.steps[0]}s;`}
        >
          Draft shortcut
        </p>
        <ol class="flex flex-col items-stretch">
          {ZAP_NODES.map((node, i) => (
            <>
              <li
                class="zd flex items-center gap-3 rounded-full border border-border py-2 pl-2 pr-4"
                style={`--at: ${AT.steps[i]}s;`}
              >
                <IconTile icon={node.icon} tone={i === 1 ? "primary" : "brand"} />
                <div class="min-w-0">
                  <p class="text-sm font-bold leading-tight">{node.label}</p>
                  <p class="truncate text-xs text-muted-foreground">{node.line}</p>
                </div>
              </li>
              {i < ZAP_NODES.length - 1 ? (
                <li
                  aria-hidden="true"
                  class="zd zd-string mx-auto h-5 w-1 rounded-full bg-border"
                  style={`--at: ${AT.steps[i] + 0.35}s;`}
                ></li>
              ) : null}
            </>
          ))}
        </ol>
        <div class="mt-4 flex justify-end">
          <span
            class="zd zd-run clay-primary inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold"
            style={`--at: ${AT.run}s;`}
          >
            <i data-lucide="play" class="h-4 w-4" aria-hidden="true"></i>
            Test
          </span>
        </div>
      </div>
    </div>
  </figure>
);

/** The role tabs, in the Gallery's own order, with the cards they filter. */
export const GalleryCarousel: FC = () => {
  const roles = GALLERY_ROLES;
  return (
    <div data-carousel class="relative">
      <div
        role="tablist"
        aria-label="Roles"
        class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-4 pt-1 sm:flex-wrap sm:justify-center sm:overflow-visible"
      >
        {roles.map((role, i) => (
          <button
            type="button"
            role="tab"
            id={`gtab-${role.id}`}
            data-tab={role.id}
            aria-selected={i === 0 ? "true" : "false"}
            aria-controls="gallery-track"
            tabindex={i === 0 ? 0 : -1}
            class="clay-chip inline-flex h-11 shrink-0 items-center gap-2 px-4 text-sm font-semibold"
          >
            <i data-lucide={role.icon} class="h-4 w-4" aria-hidden="true"></i>
            {role.role}
          </button>
        ))}
      </div>

      <div
        id="gallery-track"
        role="tabpanel"
        data-track
        tabindex={0}
        class="carousel-track rounded-[1.5rem] outline-offset-4"
        aria-label="Gallery examples"
      >
        {roles.flatMap((role) =>
          role.examples.map((example) => (
            <article data-role={role.id} class="carousel-card">
              <Card lift class="flex h-full flex-col p-6">
                <p class="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-primary">
                  {role.role}
                </p>
                <h3 class="mt-1 text-xl leading-snug text-balance">{example.name}</h3>
                <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {example.does}
                </p>

                {/* A mini workflow: numbered orange squares down a hairline. */}
                <ol class="mt-5 flex flex-1 flex-col border-t border-border pt-4">
                  {example.recipe.slice(0, 4).map((step, n, all) => (
                    <>
                      <li class="flex items-start gap-2.5 text-sm">
                        <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-xs)] bg-orange font-mono text-xs font-bold text-orange-foreground tabular">
                          {n + 1}
                        </span>
                        <span class="pt-0.5 leading-snug">{step.sentence}</span>
                      </li>
                      {n < all.length - 1 ? (
                        <li
                          aria-hidden="true"
                          class="ml-[0.7rem] h-3 w-0.5 rounded-full bg-border"
                        ></li>
                      ) : null}
                    </>
                  ))}
                </ol>
              </Card>
            </article>
          )),
        )}
      </div>

      <div class="mt-1 flex items-center justify-center gap-3">
        <button
          type="button"
          data-prev
          aria-label="Previous examples"
          class="btn btn-grey inline-flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-40"
        >
          <i data-lucide="chevron-down" class="h-5 w-5 rotate-90" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          data-next
          aria-label="Next examples"
          class="btn btn-grey inline-flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-40"
        >
          <i data-lucide="chevron-down" class="h-5 w-5 -rotate-90" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
};
