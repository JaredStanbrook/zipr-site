import type { FC } from "hono/jsx";

import { GALLERY_ROLES } from "@server/content/gallery";
import { Card, IconTile } from "@views/components/Ui";

/**
 * The scroll-driven showpieces: a shortcut being built and run, a chat with
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

const BUILD_STEPS = [
  { icon: "circle-help", label: "Choose from List", line: "Choose a client" },
  { icon: "link", label: "Open Link", line: "Open their CRM page" },
  { icon: "folder", label: "Open Folder", line: "Open their shared folder" },
];

/**
 * Build it, then run it.
 *
 * One scroll position, `--p`, drives the whole sequence (see `.builder` in the
 * stylesheet): the steps float in one by one, clay strings connect them, they
 * compress into the Run button, which lights, and then the shortcut runs — a
 * bar fills and each step lights in turn.
 */
export const ShortcutBuilder: FC = () => (
  <figure
    class="builder space-y-5"
    data-scrub
    translate="no"
    aria-label="A shortcut being built from three steps, then run"
  >
    {/* ----- The build ----- */}
    <div class="clay-floating relative p-5 sm:p-7">
      <div class="mb-5 flex items-center gap-3">
        <IconTile icon="layers" tone="brand" />
        <div>
          <p class="text-sm font-bold leading-tight">Open a client</p>
          <p class="text-xs text-muted-foreground">Three steps</p>
        </div>
      </div>

      <ol class="flex flex-col items-stretch gap-0 lg:flex-row lg:items-center">
        {BUILD_STEPS.map((step, k) => (
          <>
            <li class="bstep lg:shrink-0" style={`--k: ${k};`}>
              <div class="clay-raised clay-squish flex items-center gap-3 rounded-full py-2.5 pl-2.5 pr-5">
                <IconTile icon={step.icon} tone={k === 1 ? "primary" : "brand"} />
                <div class="min-w-0">
                  <p class="text-sm font-bold leading-tight">{step.label}</p>
                  <p class="truncate text-xs text-muted-foreground">{step.line}</p>
                </div>
              </div>
            </li>
            <li
              aria-hidden="true"
              class="bstring mx-auto h-7 w-1.5 lg:mx-0 lg:h-1.5 lg:w-auto lg:min-w-6 lg:flex-1"
              style={`--k: ${k}; --a: calc(0.02 + ${k} * 0.13);`}
            ></li>
          </>
        ))}
        <li class="bstep mx-auto lg:mx-0 lg:shrink-0" style="--k: 3; --cs: 0;">
          <span class="brun clay-primary clay-press inline-flex h-14 items-center gap-2 rounded-full px-7 text-base font-bold">
            <i data-lucide="play" class="h-5 w-5" aria-hidden="true"></i>
            Run
          </span>
        </li>
      </ol>
    </div>

    {/* ----- The run ----- */}
    <div class="clay-raised rounded-[1.75rem] p-5 sm:p-7">
      <div class="mb-4 flex items-center justify-between gap-3">
        <p class="text-sm font-bold">Running Open a client</p>
        <span class="bdone inline-flex items-center gap-1.5 text-xs font-semibold text-success">
          <i data-lucide="circle-check" class="h-4 w-4" aria-hidden="true"></i>
          Done
        </span>
      </div>
      <div class="h-3 overflow-hidden rounded-full bg-muted shadow-inset" aria-hidden="true">
        <div class="bbar h-full w-full"></div>
      </div>
      <ul class="mt-5 grid gap-3 sm:grid-cols-3">
        {BUILD_STEPS.map((step, j) => (
          <li
            class="brow relative flex items-center gap-3 rounded-2xl bg-muted p-3"
            style={`--a2: ${(0.1 + j * 0.3).toFixed(2)};`}
          >
            <span class="brow-glow absolute inset-0" aria-hidden="true"></span>
            <span class="brow-icon relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-card text-primary shadow-raised">
              <i data-lucide={step.icon} class="h-4 w-4" aria-hidden="true"></i>
            </span>
            <span class="relative min-w-0">
              <span class="block text-sm font-semibold leading-tight">{step.label}</span>
              <span class="block truncate text-xs text-muted-foreground">{step.line}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  </figure>
);

/** Timings for the Zap demo, in seconds, so the sequence reads in one place. */
const AT = { user: 0.2, type: 0.5, dots: 2.2, reply: 4.2, steps: [4.6, 5.2, 5.8], run: 6.6 };

const ZAP_NODES = [
  { icon: "circle-help", label: "Choose from List", line: "Client A, Client B, Client C" },
  { icon: "link", label: "Open Link", line: "Open their CRM page" },
  { icon: "folder", label: "Open Folder", line: "Open their shared folder" },
];

/**
 * Zap in action: a soft clay chat that plays once as it scrolls into view.
 * A request is typed, Zap thinks, answers, and its three steps connect into a
 * draft shortcut ready to test. Purely a picture — nothing here calls anything.
 */
export const ZapDemo: FC = () => (
  <figure
    class="zapdemo clay-floating relative overflow-hidden p-4 sm:p-6"
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
        class="clay-chip clay-press inline-flex h-11 items-center gap-2 px-4 text-xs font-semibold"
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
          class="zd clay-slab max-w-[88%] rounded-[1.4rem] rounded-br-md px-4 py-3 text-sm leading-relaxed"
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
          class="zd clay-raised grid max-w-[88%] rounded-[1.4rem] rounded-bl-md px-4 py-3 text-sm leading-relaxed"
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
      <div class="clay-well rounded-[1.6rem] p-4 sm:p-5">
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
                class="zd clay-raised clay-squish flex items-center gap-3 rounded-full py-2 pl-2 pr-4"
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
                  class="zd zd-string mx-auto h-5 w-1.5 rounded-full bg-muted shadow-inset"
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

                {/* A mini workflow: numbered clay nodes on a string. */}
                <ol class="clay-well mt-5 flex flex-1 flex-col rounded-[1.25rem] p-4">
                  {example.recipe.slice(0, 4).map((step, n, all) => (
                    <>
                      <li class="flex items-start gap-2.5 text-sm">
                        <span class="clay-raised inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary tabular">
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
          class="clay-chip clay-press inline-flex h-11 w-11 items-center justify-center disabled:opacity-40"
        >
          <i data-lucide="chevron-down" class="h-5 w-5 rotate-90" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          data-next
          aria-label="Next examples"
          class="clay-chip clay-press inline-flex h-11 w-11 items-center justify-center disabled:opacity-40"
        >
          <i data-lucide="chevron-down" class="h-5 w-5 -rotate-90" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
};
