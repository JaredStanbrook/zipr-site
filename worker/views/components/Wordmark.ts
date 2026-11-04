import { html } from "hono/html";

/**
 * The Zipr wordmark: pixel letters on a grid (`public/wordmark.svg`). That
 * file's canvas is 25 wide but the letters end at 19, so the inlined copy is
 * cropped to 19: no empty run after the R to throw off centring or spacing.
 *
 * Inlined rather than loaded as an image so it takes its colour from the page
 * (`currentColor`): orange in the header, the well's own grey with lit and
 * shaded edges in the footer. It is drawn, not typed, so it does not change
 * with the app's configured name; the accessible name does.
 *
 * `html` rather than JSX, because the header and footer that use it are `html`
 * templates themselves.
 */
const RECTS: Array<[x: number, y: number, w: number]> = [
  [0, 0, 4],
  [5, 0, 2],
  [8, 0, 4],
  [14, 0, 5],
  [2, 1, 2],
  [8, 1, 2],
  [11, 1, 2],
  [14, 1, 2],
  [17, 1, 2],
  [0, 2, 2],
  [5, 2, 2],
  [8, 2, 5],
  [14, 2, 4],
  [0, 3, 4],
  [5, 3, 2],
  [8, 3, 2],
  [14, 3, 2],
  [17, 3, 2],
];

/** Pass `label` to name it for screen readers; leave it out where it is decoration. */
export const wordmark = ({ label, class: className = "" }: { label?: string; class?: string }) =>
  html`<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 19 4"
    shape-rendering="crispEdges"
    class="${className}"
    ${label ? html`role="img" aria-label="${label}"` : html`aria-hidden="true"`}
    focusable="false"
  >
    <g fill="currentColor">
      ${RECTS.map(([x, y, w]) => html`<rect x="${x}" y="${y}" width="${w}" height="1" />`)}
    </g>
  </svg>`;
