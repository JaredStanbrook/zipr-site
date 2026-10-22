/**
 * Click a picture, see it large.
 *
 * Every trigger is a `[data-lightbox]` button wrapping the picture (see
 * `ZoomTrigger` in views/components/Ui.tsx), and there is one `<dialog>` in the
 * layout. Delegated listeners on the document mean this works for pages that
 * arrive by an HTMX swap without any re-binding.
 *
 * The dialog is the platform's own: `showModal()` makes the rest of the page
 * inert, keeps Tab inside it, closes on Escape and returns focus to the trigger.
 * What this adds is filling it in, closing on a click outside the picture, and
 * stopping the page behind from scrolling.
 */

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

const openLightbox = (trigger: HTMLElement) => {
  const dialog = document.getElementById("lightbox") as HTMLDialogElement | null;
  const source = shownImage(trigger);
  if (!dialog || !source || typeof dialog.showModal !== "function") return;

  const img = dialog.querySelector<HTMLImageElement>(".lightbox-img");
  const caption = dialog.querySelector<HTMLElement>("#lightbox-caption");
  if (!img) return;

  img.src = source.currentSrc || source.src;
  img.alt = source.alt;
  img.width = source.naturalWidth || source.width;
  img.height = source.naturalHeight || source.height;
  if (caption) caption.textContent = source.alt;

  document.documentElement.classList.add("lightbox-open");
  dialog.showModal();
};

document.addEventListener("click", (event) => {
  const target = event.target as Element | null;
  const trigger = target?.closest<HTMLElement>("[data-lightbox]");
  if (trigger) {
    event.preventDefault();
    openLightbox(trigger);
    return;
  }

  const dialog = document.getElementById("lightbox") as HTMLDialogElement | null;
  if (!dialog?.open) return;
  // The close button, or a click on the dim area around the picture. Clicks on
  // the picture itself stay open, so it can be looked at without a mis-tap.
  if (target?.closest("[data-lightbox-close]") || target === dialog) dialog.close();
});

// Whatever closed it — Escape, the button, a backdrop click — unlock the page.
document.addEventListener(
  "close",
  (event) => {
    if ((event.target as HTMLElement | null)?.id === "lightbox") {
      document.documentElement.classList.remove("lightbox-open");
    }
  },
  true,
);

// Navigating (an HTMX swap) must not leave a viewer open over the new page.
document.body?.addEventListener("htmx:beforeSwap", () => {
  const dialog = document.getElementById("lightbox") as HTMLDialogElement | null;
  if (dialog?.open) dialog.close();
});
export {};
