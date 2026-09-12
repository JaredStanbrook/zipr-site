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
