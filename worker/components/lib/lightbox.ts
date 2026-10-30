/**
 * Click a picture, see it large — PhotoSwipe, opened over the page.
 *
 * Every trigger is a `[data-lightbox]` button wrapping the picture (see
 * `ZoomTrigger` in views/components/Ui.tsx). Delegated listeners on the
 * document mean this works for pages that arrive by an HTMX swap without any
 * re-binding. The page's pictures form one gallery, in page order, so the
 * arrows, the arrow keys and a swipe step through them.
 *
 * PhotoSwipe brings what a hand-made viewer does badly: pinch and double-tap
 * zoom, panning, swipe to step and to close, a placeholder while the picture
 * loads, and a focus trap that hands focus back on close. It is loaded only
 * when it is about to be needed — on hover or focus of a trigger, or at the
 * latest on the click — so a page nobody zooms on pays nothing for it. If it
 * cannot be loaded (a dropped connection, a stale deploy), the click opens the
 * picture itself instead.
 *
 * However a picture is drawn on the page — clipped off its edge, small in a
 * stack, sliding past in a marquee — the viewer shows the whole of it, on its
 * own. A marquee's clones (`data-lightbox-dup`, see lib/marquee.ts) are not
 * extra pictures: clicking one opens its original, and they are left out of
 * the gallery so each picture appears in it once.
 */

import type PhotoSwipe from "photoswipe";
import type { SlideData } from "photoswipe";
import { ChevronLeft, ChevronRight, createElement, X, ZoomIn, ZoomOut } from "lucide";

/** The screenshots are rendered at twice their size, for sharp high-density
 *  screens. Shown at "full size" they should be the size they were drawn at,
 *  so PhotoSwipe is told half the pixel size: zoomed all the way in, a
 *  high-density screen then shows every pixel and no more. */
const PIXELS_PER_POINT = 2;

/** The picture a trigger is showing: the current theme's. */
const shownImage = (trigger: HTMLElement) =>
  Array.from(trigger.querySelectorAll<HTMLImageElement>("img")).find(
    (img) => img.getClientRects().length > 0,
  ) ?? null;

const slideFor = (img: HTMLImageElement): SlideData => {
  const src = img.currentSrc || img.src;
  const width = Number(img.getAttribute("width")) || img.naturalWidth;
  const height = Number(img.getAttribute("height")) || img.naturalHeight;
  return {
    src,
    // Shown stretched while the full picture loads; it is the same file, so
    // usually already in the cache and the swap is invisible.
    msrc: src,
    width: width / PIXELS_PER_POINT,
    height: height / PIXELS_PER_POINT,
    alt: img.alt,
    // The picture zooms out of, and back into, its place on the page.
    element: img,
  };
};

/** A label from the layout's `#lightbox-text`, translated with the page. */
const text = (key: string, fallback: string) =>
  document.querySelector(`[data-lightbox-text="${key}"]`)?.textContent?.trim() || fallback;

const icon = (...nodes: Parameters<typeof createElement>[0][]) =>
  nodes.map((node) => createElement(node).outerHTML).join("");

let loading: Promise<typeof PhotoSwipe> | null = null;
const load = () => {
  loading ??= import("photoswipe").then((module) => module.default);
  // A failed load is not cached, so the next click tries again.
  loading.catch(() => (loading = null));
  return loading;
};

let open: PhotoSwipe | null = null;
/** Between the click and the viewer existing, while PhotoSwipe downloads. */
let opening = false;

/** The trigger a marquee clone stands in for. */
const originalOf = (trigger: HTMLElement) => {
  if (!trigger.hasAttribute("data-lightbox-dup")) return trigger;
  const key = trigger.dataset.lightboxKey;
  return (
    (key &&
      document.querySelector<HTMLElement>(
        `[data-lightbox][data-lightbox-key="${key}"]:not([data-lightbox-dup])`,
      )) ||
    trigger
  );
};

const openLightbox = async (clicked: HTMLElement) => {
  const trigger = originalOf(clicked);
  // Every trigger on the page showing a picture right now, in page order.
  const triggers = Array.from(
    document.querySelectorAll<HTMLElement>("[data-lightbox]:not([data-lightbox-dup])"),
  ).filter((candidate) => shownImage(candidate));
  const index = triggers.indexOf(trigger);
  const source = shownImage(clicked) ?? shownImage(trigger);
  if (!source || index < 0 || open || opening) return;

  let Viewer: typeof PhotoSwipe;
  opening = true;
  try {
    Viewer = await load();
  } catch {
    window.location.assign(source.currentSrc || source.src);
    return;
  } finally {
    opening = false;
  }

  const slides = triggers.map((each) => slideFor(shownImage(each)!));
  // Zoom out of the copy that was actually clicked, not an original that may
  // be off screen.
  slides[index] = slideFor(source);

  const viewer = new Viewer({
    dataSource: slides,
    index,
    bgOpacity: 0.72,
    // Fits the screen first; the zoom button and a double tap go to full size.
    initialZoomLevel: "fit",
    secondaryZoomLevel: 1,
    maxZoomLevel: 1,
    // A narrow gap between pictures as they slide, and none around a picture
    // that already fits: the controls float over it.
    spacing: 0.06,
    closeTitle: text("close", "Close enlarged image"),
    zoomTitle: text("zoom", "Zoom in or out"),
    arrowPrevTitle: text("previous", "Previous picture"),
    arrowNextTitle: text("next", "Next picture"),
    errorMsg: text("error", "This picture didn't load."),
    closeSVG: icon(X),
    zoomSVG: icon(ZoomIn, ZoomOut),
    arrowPrevSVG: icon(ChevronLeft),
    arrowNextSVG: icon(ChevronRight),
  });

  viewer.on("uiRegister", () => {
    // Read the picture's description out as it opens and on each step. The
    // slides themselves are not a live region, so nothing else would.
    viewer.ui?.registerElement({
      name: "caption",
      className: "sr-only",
      appendTo: "root",
      onInit: (element) => {
        element.setAttribute("aria-live", "polite");
        viewer.on("change", () => {
          element.textContent = viewer.currSlide?.data.alt ?? "";
        });
      },
    });
  });

  viewer.on("bindEvents", () => {
    // PhotoSwipe marks its root a dialog; give it a name, and say it is modal
    // so a screen reader does not wander into the page behind.
    viewer.element?.setAttribute("aria-modal", "true");
    viewer.element?.setAttribute("aria-label", text("dialog", "Enlarged picture"));
  });

  viewer.on("destroy", () => {
    open = null;
    document.documentElement.classList.remove("lightbox-open");
    // Safari does not focus a clicked button, so there is nothing for
    // PhotoSwipe to hand focus back to; put it on the trigger instead.
    const active = document.activeElement;
    if (trigger.isConnected && (!active || active === document.body)) {
      trigger.focus({ preventScroll: true });
    }
  });

  open = viewer;
  // Marquees hold still while the viewer is over them.
  document.documentElement.classList.add("lightbox-open");
  viewer.init();
};

document.addEventListener("click", (event) => {
  const trigger = (event.target as Element | null)?.closest<HTMLElement>("[data-lightbox]");
  if (!trigger) return;
  event.preventDefault();
  // The trigger that was clicked, which may be a marquee's clone; the
  // original is looked up when the viewer opens.
  void openLightbox(trigger);
});

// Start fetching the viewer as soon as someone looks like they might open it.
for (const type of ["pointerover", "focusin"]) {
  document.addEventListener(type, (event) => {
    if ((event.target as Element | null)?.closest("[data-lightbox]")) void load().catch(() => {});
  });
}

// Navigating (an HTMX swap) must not leave a viewer open over the new page.
document.body?.addEventListener("htmx:beforeSwap", () => open?.close());
