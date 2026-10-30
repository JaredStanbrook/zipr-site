/**
 * Marquees: rows that slide across the page on their own, and can be grabbed.
 *
 * The server renders `[data-marquee]` (see `Marquee` in views/components/Ui.tsx)
 * as an ordinary horizontal scroller, which is what anyone without JavaScript
 * gets. This module turns it into a loop:
 *
 *   - the set of items is cloned until the row is long enough to wrap
 *     seamlessly, and the clones are hidden from assistive tech and the tab
 *     order (a screen reader hears the list once);
 *   - the track moves by a transform, not by scrolling, so it is smooth at
 *     fractions of a pixel per frame;
 *   - a pointer (mouse, pen or finger) can grab it and drag it either way. Let
 *     go and it carries on from wherever it was left;
 *   - a horizontal wheel or trackpad swipe moves it too, and the arrow keys do
 *     when it has focus;
 *   - it holds still while it has keyboard focus, while the picture viewer is
 *     open over it, and while it is off screen;
 *   - with reduced motion it never moves by itself; it can still be dragged.
 *
 * A drag must not also be a click, or letting go of a screenshot would open
 * it in the viewer: a click that ends a drag is swallowed before the
 * lightbox's own listener sees it.
 */

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Beyond this many pixels of travel a press is a drag, not a click. */
const DRAG_THRESHOLD = 5;
/** How long a wheel or key nudge holds off the automatic motion. */
const NUDGE_HOLD_MS = 1200;

type State = {
  root: HTMLElement;
  viewport: HTMLElement;
  track: HTMLElement;
  /** Width of one set of items, the distance after which the loop repeats. */
  period: number;
  pos: number;
  /** +1: content travels left (the default); -1: it travels right. */
  dir: 1 | -1;
  speed: number;
  /** Never moves by itself (reduced motion). */
  stopped: boolean;
  visible: boolean;
  focused: boolean;
  heldUntil: number;
  drag: { id: number; startX: number; startPos: number; moved: boolean } | null;
  swallowClick: boolean;
};

const marquees = new Set<State>();
let frame = 0;
let last = 0;

const wrap = (s: State) => {
  if (s.period <= 0) return;
  s.pos = ((s.pos % s.period) + s.period) % s.period;
};

const paint = (s: State) => {
  s.track.style.transform = `translate3d(${(-s.pos).toFixed(2)}px, 0, 0)`;
};

const viewerOpen = () => document.documentElement.classList.contains("lightbox-open");

const tick = (now: number) => {
  frame = 0;
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
  last = now;
  let running = false;
  for (const s of marquees) {
    if (!s.root.isConnected) {
      marquees.delete(s);
      continue;
    }
    const moving =
      !s.stopped && s.visible && !s.focused && !s.drag && now >= s.heldUntil && !viewerOpen();
    if (moving) {
      s.pos += s.dir * s.speed * dt;
      wrap(s);
      paint(s);
    }
    if (s.visible) running = true;
  }
  if (running) schedule();
  else last = 0;
};

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(tick);
};

/** Strip a clone of everything that would make it a second copy to a screen
 *  reader or the keyboard, but keep it clickable: a cloned screenshot still
 *  opens, as its original. */
const quieten = (clone: Element) => {
  clone.setAttribute("aria-hidden", "true");
  clone.querySelectorAll<HTMLElement>("a, button, [tabindex]").forEach((el) => {
    el.setAttribute("tabindex", "-1");
  });
  clone.querySelectorAll<HTMLElement>("[data-lightbox]").forEach((el) => {
    el.setAttribute("data-lightbox-dup", "");
  });
  clone.querySelectorAll<HTMLElement>("[id]").forEach((el) => el.removeAttribute("id"));
};

/** Clone the set until the row covers one period plus a viewport, so the
 *  wrap point is never on screen. Re-run on resize. */
const fill = (s: State) => {
  s.track.querySelectorAll("[data-marquee-clone]").forEach((el) => el.remove());
  const originals = Array.from(s.track.children) as HTMLElement[];
  if (originals.length === 0) return;

  originals.forEach((item, k) => {
    item.querySelectorAll<HTMLElement>("[data-lightbox]").forEach((trigger, j) => {
      trigger.dataset.lightboxKey ??= `${Math.random().toString(36).slice(2)}-${k}-${j}`;
    });
  });

  const first = originals[0];
  const span = () => s.track.scrollWidth;
  const setWidth = span();
  let copies = 0;
  while ((span() < setWidth + s.viewport.clientWidth + 1 || copies < 1) && copies < 12) {
    for (const item of originals) {
      const clone = item.cloneNode(true) as HTMLElement;
      clone.setAttribute("data-marquee-clone", "");
      quieten(clone);
      s.track.appendChild(clone);
    }
    copies++;
  }
  const firstClone = s.track.querySelector<HTMLElement>("[data-marquee-clone]");
  s.period = firstClone ? firstClone.offsetLeft - first.offsetLeft : setWidth;
  wrap(s);
  paint(s);
};

let visibility: IntersectionObserver | null = null;
let resizing: ResizeObserver | null = null;
const byElement = new WeakMap<Element, State>();

const setup = (root: HTMLElement) => {
  const viewport = root.querySelector<HTMLElement>("[data-marquee-viewport]");
  const track = root.querySelector<HTMLElement>("[data-marquee-track]");
  if (!viewport || !track) return;
  root.dataset.marqueeReady = "";

  const s: State = {
    root,
    viewport,
    track,
    period: 0,
    pos: 0,
    dir: root.dataset.direction === "right" ? -1 : 1,
    speed: Number(root.dataset.speed) || 36,
    stopped: reducedMotion(),
    visible: true,
    focused: false,
    heldUntil: 0,
    drag: null,
    swallowClick: false,
  };
  root.classList.add("is-live");
  viewport.scrollLeft = 0;
  fill(s);
  marquees.add(s);
  byElement.set(root, s);

  // Keyboard focus anywhere inside holds it still, so nothing slides out
  // from under the focus ring. Only keyboard focus: a click focuses the row
  // too, and that must not stop it carrying on once the pointer lets go.
  viewport.addEventListener("focusin", (event) => {
    const target = event.target as HTMLElement;
    s.focused = target.matches(":focus-visible");
    if (!s.focused || target === viewport) return;
    // Bring the focused item clear of the faded ends.
    const item = target.closest<HTMLElement>("[data-marquee-track] > *");
    if (!item) return;
    const margin = viewport.clientWidth * 0.08;
    const left = item.offsetLeft;
    if (left < s.pos + margin || left + item.offsetWidth > s.pos + viewport.clientWidth - margin) {
      s.pos = left - margin;
      wrap(s);
      paint(s);
    }
  });
  viewport.addEventListener("focusout", (event) => {
    if (!viewport.contains(event.relatedTarget as Node | null)) {
      s.focused = false;
      schedule();
    }
  });

  // Grab and drag. Pointer capture waits until the press is clearly a drag,
  // so an ordinary click still lands on the button under it.
  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    s.drag = { id: event.pointerId, startX: event.clientX, startPos: s.pos, moved: false };
  });
  viewport.addEventListener("pointermove", (event) => {
    const drag = s.drag;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      drag.moved = true;
      root.classList.add("is-dragging");
      viewport.setPointerCapture(event.pointerId);
    }
    if (drag.moved) {
      s.pos = drag.startPos - dx;
      wrap(s);
      paint(s);
    }
  });
  const release = (event: PointerEvent) => {
    const drag = s.drag;
    if (!drag || drag.id !== event.pointerId) return;
    if (drag.moved) s.swallowClick = true;
    s.drag = null;
    root.classList.remove("is-dragging");
    // And it carries on from wherever it was let go.
    schedule();
  };
  viewport.addEventListener("pointerup", release);
  viewport.addEventListener("pointercancel", release);
  viewport.addEventListener(
    "click",
    (event) => {
      if (!s.swallowClick) return;
      s.swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );
  // Pictures and links are draggable by default; that would fight the grab.
  viewport.addEventListener("dragstart", (event) => event.preventDefault());

  // A sideways wheel or trackpad swipe moves it; a vertical one scrolls the
  // page as usual.
  viewport.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      s.pos += event.deltaX;
      wrap(s);
      paint(s);
      s.heldUntil = performance.now() + NUDGE_HOLD_MS;
      schedule();
    },
    { passive: false },
  );

  viewport.addEventListener("keydown", (event) => {
    if (event.target !== viewport) return;
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    s.pos += step * Math.max(120, viewport.clientWidth * 0.4);
    wrap(s);
    paint(s);
  });

  visibility?.observe(root);
  resizing?.observe(viewport);
};

export function initMarquees(root: ParentNode = document) {
  visibility ??=
    "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          for (const entry of entries) {
            const s = byElement.get(entry.target);
            if (!s) continue;
            s.visible = entry.isIntersecting;
            if (s.visible) schedule();
          }
        })
      : null;
  resizing ??=
    "ResizeObserver" in window
      ? new ResizeObserver((entries) => {
          for (const entry of entries) {
            const s = byElement.get(entry.target.closest("[data-marquee]") as Element);
            if (s) fill(s);
          }
        })
      : null;

  root.querySelectorAll<HTMLElement>("[data-marquee]:not([data-marquee-ready])").forEach(setup);
  schedule();
}
