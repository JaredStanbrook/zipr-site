/**
 * Scroll motion for the marketing pages.
 *
 * Three small behaviours, all driven by attributes the server renders, none of
 * them animating anything but `transform` and `opacity` (so the browser can do
 * it on the compositor and stay at 60fps):
 *
 *   data-reveal            fades and floats an element in once, when it first
 *                          scrolls into view. `--i` staggers a group.
 *   data-scrub             writes `--p` (0 to 1) on the element as it scrolls
 *                          through the viewport. CSS turns that one number into
 *                          a whole choreography, so there is no per-frame JS
 *                          beyond one custom property per visible block.
 *   data-parallax="0.12"   drifts an element against the scroll, at its own
 *                          speed, through `--py`.
 *   data-play              starts a one-shot CSS sequence (`is-playing`) the
 *                          first time it is mostly in view.
 *
 * Reduced motion is respected twice. The head script only adds `html.motion`
 * when the visitor allows motion, and every initial "hidden" state in the
 * stylesheet hangs off that class, so without it (or without JS) every page
 * renders complete and still. This module also stays idle in that case.
 *
 * Pages arrive both by full load and by an HTMX swap, so everything here is
 * safe to call repeatedly: elements are marked once they are handled.
 */

const motionAllowed = () =>
  document.documentElement.classList.contains("motion") &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

let revealObserver: IntersectionObserver | null = null;
let playObserver: IntersectionObserver | null = null;
const live = new Set<HTMLElement>();
let visibleObserver: IntersectionObserver | null = null;
let frame = 0;

/** How far through its pass an element is: 0 as it enters, 1 once it is settled. */
const progressOf = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  // Starts only once the top has climbed to 70% of the way down the screen, so
  // nothing begins while it is still a sliver at the bottom edge, and finishes
  // once most of the element's own height has scrolled in.
  const distance = rect.height * 0.7 + vh * 0.1;
  return clamp01((vh * 0.7 - rect.top) / distance);
};

const update = () => {
  frame = 0;
  const vh = window.innerHeight;
  for (const el of live) {
    if (el.dataset.scrub !== undefined) {
      el.style.setProperty("--p", progressOf(el).toFixed(4));
    }
    const speed = Number(el.dataset.parallax);
    if (speed) {
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
      el.style.setProperty("--py", `${(-offset).toFixed(1)}px`);
    }
  }
};

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(update);
};

export function initMotion(root: ParentNode = document) {
  if (!motionAllowed() || !("IntersectionObserver" in window)) {
    // Nothing will animate, so make sure nothing is left waiting to.
    root
      .querySelectorAll<HTMLElement>("[data-reveal]")
      .forEach((el) => el.setAttribute("data-reveal", "done"));
    return;
  }

  document.documentElement.classList.add("motion-live");

  revealObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        revealObserver?.unobserve(el);
        el.classList.add("is-in");
        // Once it has settled, hand its own transitions back: a card's hover
        // lift must not inherit the slow entrance timing.
        window.setTimeout(() => el.setAttribute("data-reveal", "done"), 1400);
      }
    },
    { rootMargin: "0px 0px -16% 0px", threshold: 0.2 },
  );

  // Plays once it is mostly in view. A block too tall to ever be 65% visible (a
  // phone held sideways) still plays once it is well up the screen.
  playObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const high = entry.boundingClientRect.top < window.innerHeight * 0.45;
        if (!(entry.intersectionRatio >= 0.65 || (entry.intersectionRatio >= 0.3 && high)))
          continue;
        playObserver?.unobserve(entry.target);
        entry.target.classList.add("is-playing");
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: [0.3, 0.65] },
  );

  // Only blocks near the viewport are kept in the per-frame set.
  visibleObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) live.add(el);
        else live.delete(el);
      }
      schedule();
    },
    { rootMargin: "20% 0px 20% 0px" },
  );

  root.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => {
    if (el.getAttribute("data-reveal") === "done" || el.dataset.motionBound) return;
    el.dataset.motionBound = "1";
    revealObserver?.observe(el);
  });

  root.querySelectorAll<HTMLElement>("[data-play]").forEach((el) => {
    if (el.dataset.motionBound) return;
    el.dataset.motionBound = "1";
    playObserver?.observe(el);
  });

  root.querySelectorAll<HTMLElement>("[data-scrub], [data-parallax]").forEach((el) => {
    if (el.dataset.motionBound) return;
    el.dataset.motionBound = "1";
    visibleObserver?.observe(el);
  });

  schedule();
}

window.addEventListener("scroll", schedule, { passive: true });
window.addEventListener("resize", schedule, { passive: true });

/**
 * A clay carousel with role tabs.
 *
 * Without JavaScript every card is shown and the tabs are inert links to the
 * full Gallery, so nothing is hidden behind something that cannot work. Once
 * this runs, the tabs become real tabs: choosing one shows that role's cards,
 * scrolls the track back to the start and settles the cards in again.
 */
export function initCarousels(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-carousel]").forEach((carousel) => {
    if (carousel.dataset.bound) return;
    carousel.dataset.bound = "1";
    carousel.classList.add("is-live");

    const tabs = Array.from(carousel.querySelectorAll<HTMLElement>('[role="tab"]'));
    const track = carousel.querySelector<HTMLElement>("[data-track]");
    const cards = Array.from(carousel.querySelectorAll<HTMLElement>("[data-role]"));
    const prev = carousel.querySelector<HTMLButtonElement>("[data-prev]");
    const next = carousel.querySelector<HTMLButtonElement>("[data-next]");
    if (!track || tabs.length === 0) return;

    const edges = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    };

    const select = (tab: HTMLElement, focus = false, animate = true) => {
      const role = tab.dataset.tab;
      for (const t of tabs) {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      }
      // Every write first, then one forced layout, then the entrance class.
      // Reading `offsetWidth` per card inside the loop forced a full layout
      // for each of them — half a second of a phone's main thread on load.
      const shown: HTMLElement[] = [];
      for (const card of cards) {
        const match = card.dataset.role === role;
        card.hidden = !match;
        card.classList.remove("carousel-in");
        if (match) {
          card.style.setProperty("--i", String(shown.length));
          shown.push(card);
        }
      }
      // Restart the entrance so a new set of cards settles in, one by one.
      // Not on the first selection: nothing has been seen yet to replace.
      if (animate && shown.length > 0) {
        void track.offsetWidth;
        for (const card of shown) card.classList.add("carousel-in");
      }
      track.scrollTo({ left: 0, behavior: "auto" });
      track.setAttribute("aria-labelledby", tab.id);
      if (focus) tab.focus();
      edges();
    };

    for (const tab of tabs) {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (event) => {
        const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const at = tabs.indexOf(tab);
        const to =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : (at + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        select(tabs[to], true);
      });
    }

    const step = (dir: 1 | -1) => {
      const card = cards.find((c) => !c.hidden);
      const width = (card?.offsetWidth ?? 320) + 20;
      track.scrollBy({ left: dir * width, behavior: "smooth" });
    };
    prev?.addEventListener("click", () => step(-1));
    next?.addEventListener("click", () => step(1));
    track.addEventListener("scroll", edges, { passive: true });
    window.addEventListener("resize", edges, { passive: true });

    select(tabs.find((t) => t.getAttribute("aria-selected") === "true") ?? tabs[0], false, false);
  });
}

/** "Replay" on a one-shot demo: restart its CSS sequence from the top. */
export function initReplay(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-replay]").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "1";
    button.addEventListener("click", () => {
      const target = button.closest<HTMLElement>("[data-play]");
      if (!target) return;
      target.classList.remove("is-playing");
      void target.offsetWidth;
      target.classList.add("is-playing");
    });
  });
}
