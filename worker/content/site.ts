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

/**
 * The header's links, in the brand guide's order. Download is the button at the
 * end of the bar (and the last item on the phone menu) rather than a link in
 * this list, so it stays the loudest thing in the header. Security and Contact
 * live in the footer.
 */
export const PUBLIC_NAV = [
  { to: "/features", name: "Features" },
  { to: "/gallery", name: "Gallery" },
  { to: "/zap", name: "Build with Zap" },
  { to: "/teams", name: "For teams" },
  { to: "/pricing", name: "Pricing" },
];

/**
 * Product screenshots, served from `public/screenshots/`.
 *
 * Each is rendered from the app's own screen gallery
 * (`scripts/capture-marketing.mjs` in zipr-client) and named `<id>-light.png`.
 * The site is light only, so the dark renders are not kept here. They are
 * transparent PNGs of the window
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
    width: 1232,
    height: 1304,
    alt: "The Zipr launcher: a search box above a list of shortcuts — Start my workday pinned at the top, then the recent ones, Join my next meeting, Focus for an hour, Check the VPN and Start my day connected, then Present my screen, Fill in my timesheet and more — each with its own icon and colour.",
  },
  "overlay-grid": {
    width: 1232,
    height: 1060,
    alt: "The Zipr launcher in its grid layout: a search box above tiles for Start my workday, Start my day connected, Join my next meeting, Present my screen, Fill in my timesheet and Book a meeting room, each with an icon and a one-line description.",
  },
  // Seven other people's launchers, for the home page's "In use" strip: each
  // their own shortcuts, with the launcher set up their own way. Rendered from
  // the client's `persona-*` gallery scenarios (fixtures/personas.ts).
  "overlay-developer": {
    width: 1232,
    height: 1372,
    alt: "A developer's Zipr launcher as a dense list in small text, without colours: Start the dev stack and Open my review queue pinned, then Tail the API logs, Run the tests, Deploy to staging, Who is on call?, Open the staging database and Clear the build cache.",
  },
  "overlay-designer": {
    width: 1632,
    height: 1064,
    alt: "A designer's Zipr launcher as a roomy grid of large, colourful tiles with names only: Export for review, Open the brand kit, Start a moodboard, Resize for social, Open the type library and Send to the client.",
  },
  "overlay-helpdesk": {
    width: 1392,
    height: 1350,
    alt: "An IT support person's Zipr launcher with no search field, grouped under headings: their own shortcuts — Open my ticket queue, Start a remote session, Search the knowledge base — then the Acme IT team's, from Check certificate expiry to Page the on-call engineer.",
  },
  "overlay-sales": {
    width: 1392,
    height: 1132,
    alt: "A salesperson's Zipr launcher in large, roomy text, opened over a selected company name, Northwind Traders, ready to run with it: Look up the account pinned, then Log this call, Send the proposal, Book a follow-up and Open my pipeline.",
  },
  "overlay-teacher": {
    width: 2192,
    height: 1128,
    alt: "A teacher's Zipr launcher as a grid that scrolls sideways: Take the register, Start the class timer, Mark homework, Show my screen, Open today's lesson, Share the worksheet, Email parents and Open the seating plan, each with a short description.",
  },
  "overlay-finance": {
    width: 1312,
    height: 1342,
    alt: "A finance person's Zipr launcher as a plain list of words, with no icons or colours: Reconcile yesterday's payments pinned, then Approve pending invoices, Export the month-end report, Open the budget, Check exchange rates, File an expense and Prepare the supplier run.",
  },
  "overlay-home": {
    width: 1992,
    height: 1486,
    alt: "A Zipr launcher at home in the largest text size, as big tiles with short names: Family call pinned, then My photos, The news, My radio, Weather and New letter.",
  },
  "editor-steps": {
    width: 2592,
    height: 1808,
    alt: "The Zipr shortcut editor open on Start my workday, a personal shortcut that starts on its own at 08:45 on weekdays. Its trigger sits above its steps, switched on, with its next run. Three steps run in order — open my email, open my calendar, open the stand-up notes — each ticked from its last run, and the last is selected, with its web address and what to do if it fails in the panel beside it.",
  },
  "editor-branches": {
    width: 2992,
    height: 1928,
    alt: "The Zipr shortcut editor open on Check the VPN. After a check, an If step sends the shortcut down two paths: when the VPN is connected it opens the intranet, otherwise it asks what to do — connect, open the help page or leave it. The If is selected, and its condition is set out in the panel beside it.",
  },
  "editor-tour": {
    width: 3392,
    height: 2168,
    alt: "The Zipr app with the shortcut editor open on Start my day connected. At the top of its steps sits its trigger, weekdays at 08:30, switched on, with its next run. The shortcut checks the VPN, then an If sends it down one of two paths — open the intranet when it is connected, or connect to the VPN and give it a moment — and both paths join again to open email and the stand-up notes. A line shows the If reading the check's result, each step is ticked from its last run, an overview map sits in the corner, and the If is selected with its condition in the panel beside it.",
  },
  "run-history": {
    width: 3072,
    height: 1568,
    alt: "Run history for Start my day connected: five runs, each with whether it worked, when, how long it took and what started it. The failed one is open, listing each step in order with its time — the VPN check and the If done, then Connect to the VPN failed, because the program could not be started.",
  },
  "app-shortcuts": {
    width: 2752,
    height: 1808,
    alt: "The Zipr app's Library: a sidebar grouping Library, Teams and Zap, plugins, insights and settings, with your account at its foot; a search box with a filter; and your personal shortcuts — Book a meeting room, Check the VPN, Fill in my timesheet, Start my workday and more — each with its number of steps and when it last changed, above the shortcuts of your team, Acme IT, in its Helpdesk group.",
  },
  zap: {
    width: 2392,
    height: 2910,
    alt: "Zap building a shortcut called Friday tidy-up. The request asks for screenshots to go into Pictures and anything untouched for a month to be zipped into an archive. Zap builds it, then, asked not to make an empty zip, counts the old files first and wraps the archiving in an If. The steps: get today's date, go back 30 days, find and move the screenshots, find and count the old files, then, if there are any, zip them under today's date, send the originals to the bin and say what was archived — otherwise say it was already tidy. A test shows every step succeeded.",
  },
  "zap-release": {
    width: 2392,
    height: 3506,
    alt: "Zap building a shortcut called Release notes, after checking git is on this computer. It runs a git script for the commits since the last tag, splits them into lines, leaves out merge commits, joins them back up and has an AI model write customer-friendly release notes. A menu then offers three paths: copy the notes, draft an email to the team, or post them to the changelog — where an If shows a notification when the changelog accepts them and its answer when it does not. A panel lists the three steps that need allowing before a test: the script, the AI step and the post.",
  },
} as const;

export type ScreenshotId = keyof typeof SCREENSHOTS;
