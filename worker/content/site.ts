// worker/content/site.ts
//
// Addresses, links and the download story. The things most likely to need
// changing after launch, kept out of the views that render them.

/**
 * Where everything reaches us.
 *
 * One address, not one per topic. The earlier shape had `sales@`, `support@`
 * and `security@` on the theory that a security report should not queue behind
 * a licensing question — which is a real concern the moment there is more than
 * one person reading, and pure theatre while there is not. Three aliases into
 * one inbox would have bought nothing and implied a support organisation that
 * does not exist.
 *
 * What actually does the routing is the subject line: every link on the
 * contact page opens with one, so filtering is a mail rule away and the sender
 * never has to guess which address to pick.
 */
export const CONTACT = {
  address: "zipr@stanbrook.me",
};

/**
 * Where a bug goes.
 *
 * Both source repositories are private, so there is no public tracker to link
 * to and the site carries its own — `/report`, backed by the same database as
 * everything else here. That is not a workaround: a reporter who has to make a
 * GitHub account first mostly does not bother.
 */
export const REPORT_PATH = "/report";

/**
 * The platforms the downloads page draws, in order.
 *
 * `available: false` is not "coming soon" filler — there is genuinely no Linux
 * build yet. The page says so and offers to take your name for it, which is
 * both true and a better signal than a greyed-out button.
 *
 * The strings here are what a person needs in order to decide whether it will
 * run: version and file type. Not which toolchain produced it — that is ours,
 * and it was previously legible from the wording.
 */
export const PLATFORM_INFO = [
  {
    id: "windows" as const,
    name: "Windows",
    icon: "monitor",
    requirement: "Windows 10 or later, 64-bit",
    format: "Installer (.exe)",
    available: true,
    /** Matched against the user-agent to pre-select a platform. */
    uaMatch: /windows|win32|win64/i,
  },
  {
    id: "macos" as const,
    name: "macOS",
    icon: "laptop",
    requirement: "macOS 12 Monterey or later",
    format: "Disk image (.dmg)",
    available: true,
    uaMatch: /macintosh|mac os x/i,
  },
  {
    id: "linux" as const,
    name: "Linux",
    icon: "terminal",
    requirement: "Not yet — tell us if you want it",
    format: "Coming later",
    available: false,
    uaMatch: /linux|x11|ubuntu/i,
  },
];

/**
 * Shown on the downloads page whatever is in the database, because it is true
 * of every build and a person deciding whether to install something wants it
 * before the button, not after.
 */
export const INSTALL_NOTES = [
  "We haven't signed the installers yet, so Windows and macOS will both warn you the first time. Every download lists a checksum so you can confirm you got what we published.",
  "No account, and no network request until you point it at a team server. Installing it does not sign you up for anything.",
  "Uninstalling leaves your work on disk. Export it first if you want to keep it.",
];

/** Everything the nav needs to know about the public pages. */
export const PUBLIC_NAV = [
  { to: "/features", name: "Features" },
  { to: "/downloads", name: "Downloads" },
  { to: "/pricing", name: "Pricing" },
  { to: "/security", name: "Security" },
  { to: "/contact", name: "Contact" },
];

/**
 * Product screenshots, served from `public/screenshots/`.
 *
 * Each is rendered from the app's own screen gallery in both themes and named
 * `<id>-light.png` / `<id>-dark.png`. They are transparent PNGs of the window
 * alone, with its own rounded corners and a margin that holds its shadow, so
 * the page adds no frame, radius or shadow of its own. Width and height are the rendered
 * pixels, kept here so the page reserves the right box before the file
 * arrives and nothing jumps. If a file is re-rendered at a different size,
 * change it here.
 *
 * The alt text describes what is in the picture, not what it is for: it is the
 * only way a screen-reader user learns what the launcher looks like.
 */
export const SCREENSHOT_BASE = "/screenshots";

export const SCREENSHOTS = {
  "overlay-list": {
    width: 1792,
    height: 1422,
    alt: "The Zipr launcher: a search box above a list of items — Start my workday, Join my next meeting, Present my screen and more — each with its own icon and colour.",
  },
  "overlay-grid": {
    width: 1992,
    height: 1494,
    alt: "The Zipr launcher in its grid layout: a search box above tiles for Start my workday, Join my next meeting, Present my screen and others, each with an icon and a one-line description.",
  },
  "item-detail": {
    width: 2192,
    height: 1326,
    alt: "A Zipr item, Deploy to production, with its tags and three steps: ask for a yes or no, run a command, and open a web address.",
  },
  "app-browse": {
    width: 2752,
    height: 1928,
    alt: "The Zipr app's Browse screen: a sidebar of sections, a list of catalogues, and a grid of items such as Start my workday and Book a meeting room.",
  },
} as const;

export type ScreenshotId = keyof typeof SCREENSHOTS;
