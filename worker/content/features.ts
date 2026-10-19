// worker/content/features.ts
//
// The product, in the customer's words.
//
// The brief this file is written against:
//
//   Zipr turns the useful things people do on their computers into shortcuts
//   they can run again and share. The feeling is magic; the language is plain.
//
// The vocabulary comes from the brand guide and is the same on every page:
// a Shortcut is built from Steps (the Action is the code underneath, and
// stays out of customer-facing copy), a team's shared collection is a
// Catalogue, and the Gallery is the website's showcase of ideas. Do not
// say item, node, workflow or macro.
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
    body: "The steps you worked out become one named shortcut. A colleague clicks it and it runs — no document to follow, no one talking them through it.",
    tier: "client",
  },
  {
    icon: "wifi-off",
    title: "Instant, and it works offline",
    body: "Everything is already on your computer, so Zipr opens straight away and keeps working on a plane.",
    tier: "client",
  },
  {
    icon: "shield",
    title: "Runs only where you click",
    body: "Every step runs on the computer of the person who clicked — never on our servers or yours. That is the short answer to your security team's first question.",
    tier: "client",
  },
  {
    icon: "puzzle",
    title: "Plugins for everything else",
    body: "When the built-in steps run out, a plugin adds a new one. Plugins are kept apart from the app, so a faulty one can't take it down.",
    tier: "client",
  },
  {
    icon: "users",
    title: "Share it instead of explaining it",
    body: "Publish a shortcut to your team's Catalogue and everyone runs the same, current version. No zip file in a chat thread, no afternoon spent watching over a shoulder.",
    tier: "api",
  },
  {
    icon: "git-merge",
    title: "Edit together without losing work",
    body: "Two people improve the same shortcut at once and both changes survive. If you changed the same thing, you're shown exactly what clashed.",
    tier: "api",
  },
  {
    icon: "history",
    title: "Undo anything",
    body: "Every change is kept. Put any shortcut back how it was in one click, and see who changed what — so trying the strange version costs nothing.",
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
 * The toolbox: the steps a shortcut is built from, in plain English.
 *
 * Labels and categories are the brand guide's canonical step library, applied
 * to the twelve step types the app actually ships. The guide lists more steps
 * than that (Join a meeting, Take a screenshot…) and the site does not claim
 * them: a step appears here only when the app can run it today. Several
 * canonical steps are, in the app, a link or a command — those stay out until
 * they are shipped as steps of their own.
 *
 * What sells is the verb, so there are no identifiers and no
 * implementation names here.
 */
export interface ToolboxStep {
  name: string;
  blurb: string;
  /** The guide's category label. */
  category: string;
  /** Guide: "may require more technical knowledge and should be presented accordingly". */
  advanced?: boolean;
}

export const ACTION_TYPES: ToolboxStep[] = [
  {
    name: "Open any link",
    blurb: "A web address, in the browser you choose.",
    category: "Web & email",
  },
  { name: "Open a file", blurb: "Straight into whatever opens it.", category: "Files & folders" },
  {
    name: "Show a folder",
    blurb: "Jump to it in Finder or Explorer.",
    category: "Files & folders",
  },
  {
    name: "Open an app",
    blurb: "An app, with any settings it needs.",
    category: "Apps & computer",
  },
  {
    name: "Copy text",
    blurb: "Text ready to paste, with an optional nudge.",
    category: "Text & clipboard",
  },
  { name: "Ask yes or no", blurb: "Confirm before something big.", category: "Ask & decide" },
  {
    name: "Ask for an answer",
    blurb: "Prompt for it and use it further down.",
    category: "Ask & decide",
  },
  { name: "Choose from a list", blurb: "Pick one, carry on.", category: "Ask & decide" },
  {
    name: "Confirm it's you",
    blurb: "Prove it's you before the risky step.",
    category: "Ask & decide",
  },
  {
    name: "Open a Zipr screen",
    blurb: "Jump to a view inside Zipr.",
    category: "Show & tell",
  },
  {
    name: "Run a command",
    blurb: "A command, with whatever arguments you need.",
    category: "Advanced",
    advanced: true,
  },
  {
    name: "Use a plugin",
    blurb: "Anything the built-in steps don't cover.",
    category: "Advanced",
    advanced: true,
  },
];

/**
 * How it works: build, run, share.
 *
 * Building and running need nothing but the free app. Sharing across a team
 * needs a Zipr server, and the badge says so rather than calling the whole
 * product free or the whole product paid.
 */
export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Build it",
    body: "Put together the steps you'd normally explain — links, apps, files, questions — into one named shortcut. Or describe it and ask Zap to build it.",
    cost: "Free",
  },
  {
    step: "02",
    title: "Run it",
    body: "One click runs it on your computer, instantly and offline. Build as many as you like; nothing expires and no account is needed.",
    cost: "Free",
  },
  {
    step: "03",
    title: "Share it",
    body: "When the team needs it, publish it to your team's Catalogue on a Zipr server — hosted by us, or run by you. Same app, nothing to relearn.",
    cost: "Team server",
  },
];

/**
 * What a team server adds. Framed as gains rather than as the free app's
 * shortcomings — the pricing comparison does the column-by-column version.
 *
 * Each line is something the product ships today; the brand guide's list of
 * "potential" team capabilities is wider, and this is only the part that is
 * true.
 */
export const TEAM_UNLOCKS = [
  "A shared Catalogue, with a workspace per team and roles and visibility you control",
  "Publish a copy to another team — your own stays exactly as it was",
  "Everyone on the current version, updated as colleagues work",
  "Full history, one-click rollback and an audit trail",
  "Single sign-on with Google, Microsoft Entra or Okta",
  "Usage figures showing which shortcuts people actually run",
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
    body: "Zipr stores shortcuts. It only ever runs them on the computer of the person who clicked.",
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
