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
 * Source repositories.
 *
 * NOTE: both are private today, so these links 404 for a signed-out visitor.
 * Set `showRepoLinks` to false until they are public, or make them public.
 */
export const REPOS = {
  showRepoLinks: true,
  client: "https://github.com/JaredStanbrook/zipr-client",
  api: "https://github.com/JaredStanbrook/zipr-api",
};

/**
 * The platforms the downloads page draws, in order.
 *
 * `available: false` is not "coming soon" filler — the client's Tauri config
 * names `nsis`, `app` and `dmg` under `bundle.targets` and nothing else, so an
 * Ubuntu runner would compile the binary and have nothing to upload. Saying
 * "build from source" is the true answer and links somewhere useful.
 */
export const PLATFORM_INFO = [
  {
    id: "windows" as const,
    name: "Windows",
    icon: "monitor",
    requirement: "Windows 10 or later, 64-bit",
    format: "NSIS installer (.exe)",
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
    requirement: "A recent distribution with WebKitGTK 4.1",
    format: "Build from source",
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
  "Installers are currently unsigned. Windows SmartScreen and macOS Gatekeeper will both warn you the first time — the checksum beside each download is how you verify what you got.",
  "The client needs no account and makes no network request until you configure a deployment. Installing it does not create one.",
  "Uninstalling leaves your local workspace on disk. Export it first if you want to keep it.",
];

/** Everything the nav needs to know about the public pages. */
export const PUBLIC_NAV = [
  { to: "/features", name: "Features" },
  { to: "/downloads", name: "Downloads" },
  { to: "/pricing", name: "Pricing" },
  { to: "/docs", name: "Docs" },
  { to: "/contact", name: "Contact" },
];
