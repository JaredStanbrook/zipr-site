// worker/content/features.ts
//
// The product, in the customer's words.
//
// The brief this file is written against:
//
//   Zipr exists for people who feel their ideas have to be experienced to be
//   understood — so that an out-of-the-box concept does not sit in a box. It
//   blurs the boundaries between teams so knowledge can move, without
//   disturbing the hierarchy those teams already have.
//
// That is the whole argument, and every string here is a piece of it. The
// product is not a launcher that happens to sync; it is the shortest path
// between one person having an idea and everybody else being able to run it.
//
// Two rules, unchanged:
//
// 1. Say what they get, not how we built it. No stack names, no algorithms,
//    no internal vocabulary. If a sentence would only impress an engineer who
//    already works here, it is the wrong sentence.
// 2. Every claim stays true. Marketing voice, not marketing fiction — the
//    first thing a trial does is check.

export interface Feature {
  /** Lucide icon name. Must also be registered in components/lib/icons.ts. */
  icon: string;
  title: string;
  body: string;
  /** Which side of the line this sits on. */
  tier: "client" | "api";
}

/**
 * The eight benefits, grouped by where they sit: the first four are the free
 * app, the last four arrive with a team server. The features page renders
 * them in those two groups, so keep them in this order.
 *
 * One or two sentences each. Every one says what the reader gets, then the
 * fact that makes it true — never the other way round.
 */
export const PILLARS: Feature[] = [
  {
    icon: "zap",
    title: "One click instead of a walkthrough",
    body: "The steps you worked out become one named item. A colleague clicks it and it runs — no document to follow, no script to be talked through.",
    tier: "client",
  },
  {
    icon: "wifi-off",
    title: "Instant, and it works offline",
    body: "Everything is already on your machine, so Zipr opens straight away and keeps working on a plane.",
    tier: "client",
  },
  {
    icon: "shield",
    title: "Runs only where you click",
    body: "Every command executes on the machine of the person who clicked — never on our servers or yours. That is the short answer to your security team's first question.",
    tier: "client",
  },
  {
    icon: "puzzle",
    title: "Plugins for everything else",
    body: "When the twelve built-in step types run out, a plugin adds a new one. Plugins are kept apart from the app, so a faulty one can't take it down.",
    tier: "client",
  },
  {
    icon: "users",
    title: "Share it instead of explaining it",
    body: "Publish an item to a team catalogue and everyone runs the same, current version. No zip file in a chat thread, no afternoon spent watching over a shoulder.",
    tier: "api",
  },
  {
    icon: "git-merge",
    title: "Edit together without losing work",
    body: "Two people improve the same item at once and both changes survive. If you changed the same thing, you're shown exactly what clashed.",
    tier: "api",
  },
  {
    icon: "history",
    title: "Undo anything",
    body: "Every change is kept. Put any item back how it was in one click, and see who changed what — so trying the strange version costs nothing.",
    tier: "api",
  },
  {
    icon: "server",
    title: "Hosted by us, or on your own servers",
    body: "Let us run the server, in a database that belongs to your organisation alone. Or self-host it inside your own network, under your own backups.",
    tier: "api",
  },
];

/**
 * The action vocabulary, in English.
 *
 * Previously this listed the raw type identifiers from the action registry.
 * Those are an implementation contract — useful to somebody writing a client
 * against the API, which is exactly who we are not writing for here, and a
 * neat inventory for anyone thinking of building the same thing. What sells is
 * the verb.
 */
export const ACTION_TYPES = [
  { name: "Open a link", blurb: "A URL, in the browser you choose." },
  { name: "Run a command", blurb: "Shell command, with whatever arguments you need." },
  { name: "Launch an app", blurb: "An executable, with arguments." },
  { name: "Open a file", blurb: "Straight into whatever opens it." },
  { name: "Reveal a folder", blurb: "Jump to it in Finder or Explorer." },
  { name: "Copy to clipboard", blurb: "Text ready to paste, with an optional nudge." },
  { name: "Ask yes or no", blurb: "Confirm before something irreversible." },
  { name: "Ask for a value", blurb: "Prompt for input and use it further down." },
  { name: "Offer a list", blurb: "Pick one, carry on." },
  { name: "Require a re-auth", blurb: "Prove it's you before the risky step." },
  { name: "Open a panel", blurb: "Jump to a view inside Zipr." },
  { name: "Hand off to a plugin", blurb: "Anything the twelve don't cover." },
];

/**
 * How it works, in three steps — which is also the pricing model: the first
 * two are free, the third is what a team pays for.
 */
export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Build it",
    body: "Chain the steps you would normally explain — commands, links, apps, files, questions — into one named item.",
    cost: "Free",
  },
  {
    step: "02",
    title: "Run it",
    body: "One click runs it on your machine, instantly and offline. Build as many as you like; nothing expires and no account is needed.",
    cost: "Free",
  },
  {
    step: "03",
    title: "Share it",
    body: "When the team needs it, publish it to a shared catalogue on a Zipr server — hosted by us, or run by you. Same app, nothing to relearn.",
    cost: "Team",
  },
];

/**
 * What a team server adds, for the home page.
 *
 * Framed as gains rather than as the free tier's shortcomings — the pricing
 * comparison does the column-by-column version for anyone who wants it.
 */
export const TEAM_UNLOCKS = [
  "A workspace per team, with roles and visibility you control",
  "Publish a copy to another team — your own stays exactly as it was",
  "Everyone on the current version, updated as colleagues work",
  "Full history, one-click rollback and an audit trail",
  "Single sign-on with Google, Microsoft Entra or Okta",
  "Usage figures showing which items people actually run",
];

/**
 * The security facts worth putting in front of a first-time visitor. The
 * security page has the full set; these are the four a reader should not
 * have to go looking for.
 */
export const TRUST_POINTS = [
  {
    icon: "shield",
    title: "Nothing runs on a server",
    body: "Zipr stores items. It only ever runs them on the machine of the person who clicked.",
  },
  {
    icon: "server",
    title: "Your data, where you choose",
    body: "Hosted in a database of your own, or self-hosted with nothing leaving your network.",
  },
  {
    icon: "key-round",
    title: "Your sign-in, your rules",
    body: "Single sign-on, and roles and visibility set by your administrators.",
  },
  {
    icon: "download",
    title: "Never held hostage",
    body: "Export everything as one file at any time, even if an account lapses.",
  },
];
