// worker/content/site.ts
//
// Addresses, links and the download story. The things most likely to need
// changing after launch, kept out of the views that render them.

/**
 * CHANGE_ME — the domain the contact addresses live on.
 *
 * Deliberately left as the same placeholder the rest of the unconfigured repo
 * uses, so `grep -in "change.me" -r worker/` finds it alongside the Cloudflare
 * ids. A mailto link pointing at a domain nobody owns fails silently: the
 * visitor writes a real message and it goes nowhere.
 */
export const CONTACT_DOMAIN = "change-me.example.com";

export const CONTACT = {
  /** Licensing, quotes, trials. */
  sales: `sales@${CONTACT_DOMAIN}`,
  /** Deployment trouble, bugs, questions from a licensed team. */
  support: `support@${CONTACT_DOMAIN}`,
  /**
   * Vulnerability reports. Kept separate and published plainly — a researcher
   * who cannot find where to send a report sends it somewhere worse.
   */
  security: `security@${CONTACT_DOMAIN}`,
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
