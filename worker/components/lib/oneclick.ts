/**
 * "Four steps. One click." — the pinned story on the home page.
 *
 * The section (`OneClickStory` in views/components/Motion.tsx) is a tall track
 * holding a sticky, screen-high stage; the stylesheet pins it and draws the
 * first frame before this module arrives. This module builds one paused GSAP
 * timeline for the whole story and drives it from scroll:
 *
 *   1. Slide in    the four cards leave the screen edges for a centred column;
 *                  the left-hand ones swap their mirrored layout for the
 *                  ordinary one on the way.
 *   2. Gather      they draw together into a loose, slightly rotated stack.
 *   3. Snap        the stack squares up, flush.
 *   4. Morph       the stack takes the width, height, radius and colour of a
 *                  pill and becomes the "Report IT problem" button.
 *   5. Caption     "These four steps are now one click."
 *
 * Scroll sets a target progress; the timeline follows it with an eased lag
 * (`FOLLOW`), so it is scrubbed both ways but never jerks with a coarse wheel.
 * The last `HOLD` of the track keeps the finished frame on screen, so the
 * button rests a moment before the page moves on.
 *
 * GSAP is loaded only when the section is on the page, and only for visitors
 * who allow motion. Without it the section is the still version the server
 * rendered: `.is-static` is added if the import fails.
 */

import type { gsap as GSAP } from "gsap";

type Gsap = typeof GSAP;

/** The share of the track, at the end, that holds the finished frame. */
const HOLD = 0.12;
/** How far in from the screen edge a card starts, as a share of its width.
 *  Exactly half off the page clips the name; this shows icon and name whole. */
const EDGE_INSET = 0.2;
/** Seconds for the timeline to close about two thirds of the gap to scroll. */
const FOLLOW = 0.12;

type Story = {
  section: HTMLElement;
  stage: HTMLElement;
  cards: HTMLElement[];
  tl: gsap.core.Timeline | null;
  current: number;
  target: number;
};

const stories = new Set<Story>();
let frame = 0;
let last = 0;
let listening = false;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const motionAllowed = () => {
  const root = document.documentElement;
  return (
    root.classList.contains("motion") &&
    !root.classList.contains("motion-failsafe") &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
};

/** How far the stage has travelled through its track, 0 to 1. */
const scrollProgress = (s: Story) => {
  const rect = s.section.getBoundingClientRect();
  const travel = rect.height - s.stage.clientHeight;
  return travel > 0 ? clamp01(-rect.top / travel) : 0;
};

const targetOf = (s: Story) => clamp01(scrollProgress(s) / (1 - HOLD));

const tick = (now: number) => {
  frame = 0;
  const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
  last = now;
  let unsettled = false;
  for (const s of stories) {
    if (!s.section.isConnected) {
      s.tl?.kill();
      stories.delete(s);
      continue;
    }
    s.target = targetOf(s);
    const gap = s.target - s.current;
    if (Math.abs(gap) < 0.0004) {
      s.current = s.target;
    } else {
      s.current += gap * (1 - Math.exp(-dt / FOLLOW));
      unsettled = true;
    }
    s.tl?.progress(s.current);
  }
  if (unsettled) schedule();
  else last = 0;
};

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(tick);
};

/** Every property the timeline writes, so a rebuild starts from clean. */
const CARD_PROPS = "transform,width,height,borderRadius,opacity,zIndex";

const build = (gsap: Gsap, s: Story) => {
  s.tl?.kill();
  const { stage, cards } = s;
  const faces = (selector: string) =>
    cards.flatMap((card) => Array.from(card.querySelectorAll<HTMLElement>(selector)));
  gsap.set(cards, { clearProps: CARD_PROPS });
  gsap.set(faces("[data-oc-face], [data-oc-fill], [data-oc-label]"), { clearProps: "opacity" });

  const W = stage.clientWidth;
  const H = stage.clientHeight;
  const cardH = cards[0].offsetHeight;
  const gap = 12;

  // The cards are centred at 54% of the stage by the stylesheet. Everything
  // they do happens in the room under the heading, which runs to the foot of
  // the stage: the caption is invisible until the button has formed, so it
  // needs no room reserved. On a phone with its browser bars showing (about
  // 660px tall) that room is what keeps the column from overlapping.
  const head = stage.querySelector<HTMLElement>(".oneclick-head");
  const caption = stage.querySelector<HTMLElement>("[data-oc-caption]");
  const roomTop = head ? head.offsetTop + head.offsetHeight + 20 : 0;
  const roomBottom = H - 20;
  const room = roomBottom - roomTop;
  const anchor = H * 0.54;
  const centre = (roomTop + roomBottom) / 2 - anchor;
  // The column: full spacing whenever it fits, squeezed only as a last resort.
  const step = Math.min(cardH + gap, Math.max(cardH * 0.7, (room - cardH) / (cards.length - 1)));
  // The start: spread out further than the column, within the same room, so
  // the staggered cards neither overlap each other nor reach the heading.
  const startStep = Math.max(step, Math.min(H * 0.16, (room - cardH) / (cards.length - 1)));

  const sideOf = (card: HTMLElement) => (card.dataset.side === "left" ? -1 : 1);
  // Centred on the screen edge, then nudged in by `EDGE_INSET` of a card, so
  // the half that shows carries the whole icon and name. Matches `--sx` in
  // the stylesheet, which draws the first frame.
  const startX = W / 2 - cards[0].offsetWidth * EDGE_INSET;
  const startY = (k: number) => centre + (k - 1.5) * startStep;
  const columnY = (k: number) => centre + (k - 1.5) * step;

  // The pill: the size of a real primary button, a little larger.
  const pillH = 60;
  const pillW = Math.min(280, W * 0.76);
  // The caption waits at the foot of the stage, out of the cards' way, and is
  // drawn up to sit under the finished button.
  const captionY = caption ? anchor + centre + pillH / 2 + 28 - caption.offsetTop : 0;

  // Replace the stylesheet's first-frame transform with GSAP's own, at the
  // same place, in the same frame.
  cards.forEach((card, k) => {
    card.style.transform = "none";
    gsap.set(card, {
      xPercent: -50,
      yPercent: -50,
      x: sideOf(card) * startX,
      y: startY(k),
      rotation: 0,
      zIndex: k + 1,
    });
  });

  const front = cards[cards.length - 1];
  const behind = cards.slice(0, -1);
  const leftMirrored = cards
    .filter((card) => card.dataset.side === "left")
    .map((card) => card.querySelector('[data-oc-face="mirrored"]'));
  const leftNormal = cards
    .filter((card) => card.dataset.side === "left")
    .map((card) => card.querySelector('[data-oc-face="normal"]'));

  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  // The hint goes as soon as there is any scroll at all.
  tl.to(stage.querySelector("[data-oc-hint]"), { opacity: 0, duration: 0.05 }, 0);

  // 1. Slide in from the edges to the column, one after another.
  cards.forEach((card, k) => {
    tl.to(card, { x: 0, y: columnY(k), duration: 0.26, ease: "power2.inOut" }, 0.02 + k * 0.03);
  });
  // Out, then in — never both at once, or the two layouts ghost over each
  // other.
  tl.to(leftMirrored, { opacity: 0, duration: 0.05, stagger: 0.06 }, 0.09);
  tl.fromTo(leftNormal, { opacity: 0 }, { opacity: 1, duration: 0.06, stagger: 0.06 }, 0.15);

  // 2. Gather into a loose stack, each card turned a little.
  const tilt = [-6, 4.5, -3, 1.5];
  const nudge = [-12, 9, -6, 0];
  cards.forEach((card, k) => {
    tl.to(
      card,
      {
        x: nudge[k] ?? 0,
        y: centre + (k - 1.5) * 7,
        rotation: tilt[k] ?? 0,
        duration: 0.2,
        ease: "power3.inOut",
      },
      0.37,
    );
  });

  // 3. Snap flush.
  tl.to(cards, { x: 0, y: centre, rotation: 0, duration: 0.07, ease: "back.out(2.2)" }, 0.59);

  // 4. Morph the stack into the pill. All four change shape together, so
  //    nothing pokes out from behind the front card while it shrinks.
  tl.to(
    cards,
    { width: pillW, height: pillH, borderRadius: pillH / 2, duration: 0.2, ease: "power2.inOut" },
    0.68,
  );
  tl.to(faces("[data-oc-fill]"), { opacity: 1, duration: 0.14 }, 0.7);
  tl.to(faces("[data-oc-face]"), { opacity: 0, duration: 0.07 }, 0.68);
  tl.to(behind, { opacity: 0, duration: 0.04 }, 0.86);
  tl.fromTo(
    front.querySelector("[data-oc-label]"),
    { opacity: 0, y: 6 },
    { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" },
    0.82,
  );

  // 5. The caption.
  tl.fromTo(
    caption,
    { opacity: 0, y: captionY + 16 },
    { opacity: 1, y: captionY, duration: 0.1, ease: "power2.out" },
    0.9,
  );

  tl.progress(s.current);
  s.tl = tl;
};

const setup = (gsap: Gsap, section: HTMLElement) => {
  const stage = section.querySelector<HTMLElement>("[data-oc-stage]");
  const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-oc-card]"));
  if (!stage || cards.length === 0) return;

  const s: Story = { section, stage, cards, tl: null, current: 0, target: 0 };
  // Arriving mid-page (a reload, a back button) starts where the scroll is,
  // rather than replaying everything up to it.
  s.current = s.target = targetOf(s);
  build(gsap, s);
  stories.add(s);

  let pending = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => {
      if (section.isConnected) build(gsap, s);
    });
  }).observe(stage);
};

export function initOneClick(root: ParentNode = document) {
  const sections = Array.from(
    root.querySelectorAll<HTMLElement>("[data-oneclick]:not([data-oc-ready])"),
  );
  if (sections.length === 0 || !motionAllowed()) return;
  sections.forEach((section) => (section.dataset.ocReady = ""));

  import("gsap")
    .then(({ gsap }) => {
      sections.forEach((section) => setup(gsap, section));
      if (!listening) {
        listening = true;
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule, { passive: true });
      }
      schedule();
    })
    .catch(() => sections.forEach((section) => section.classList.add("is-static")));
}
