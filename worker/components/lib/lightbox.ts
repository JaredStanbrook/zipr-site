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
 */

import type PhotoSwipe from "photoswipe";
import type { SlideData } from "photoswipe";
import { ChevronLeft, ChevronRight, createElement, X, ZoomIn, ZoomOut } from "lucide";

/** The screenshots are rendered at twice their size, for sharp high-density
 *  screens. Shown at "full size" they should be the size they were drawn at,
 *  so PhotoSwipe is told half the pixel size: zoomed all the way in, a
 *  high-density screen then shows every pixel and no more. */
const PIXELS_PER_POINT = 2;

const opacityOf = (img: HTMLImageElement) => {
  // The home hero crossfades two screenshots; enlarge whichever is showing.
  const slide = img.closest<HTMLElement>(".shot-slide");
  return slide ? Number.parseFloat(getComputedStyle(slide).opacity) : 1;
};

/** The picture a trigger is showing right now: the current theme's, and the
 *  slide currently in front. */
const shownImage = (trigger: HTMLElement) => {
  const imgs = Array.from(trigger.querySelectorAll<HTMLImageElement>("img")).filter(
    (img) => img.getClientRects().length > 0,
  );
  return imgs.sort((a, b) => opacityOf(b) - opacityOf(a))[0] ?? null;
};

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

const openLightbox = async (trigger: HTMLElement) => {
  // Every trigger on the page showing a picture right now, in page order.
  const triggers = Array.from(document.querySelectorAll<HTMLElement>("[data-lightbox]")).filter(
    (candidate) => shownImage(candidate),
  );
  const index = triggers.indexOf(trigger);
  const source = shownImage(trigger);
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

  const viewer = new Viewer({
    dataSource: triggers.map((each) => slideFor(shownImage(each)!)),
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
    // Safari does not focus a clicked button, so there is nothing for
    // PhotoSwipe to hand focus back to; put it on the trigger instead.
    const active = document.activeElement;
    if (trigger.isConnected && (!active || active === document.body)) {
      trigger.focus({ preventScroll: true });
    }
  });

  open = viewer;
  viewer.init();
};

document.addEventListener("click", (event) => {
  const trigger = (event.target as Element | null)?.closest<HTMLElement>("[data-lightbox]");
  if (!trigger) return;
  event.preventDefault();
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
