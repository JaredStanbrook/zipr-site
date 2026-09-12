// worker/content/features.ts
//
// The product, in the customer's words.
//
// Two rules for everything in this file:
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

export const PILLARS: Feature[] = [
  {
    icon: "zap",
    title: "One click, not eleven steps",
    body: "The runbook, the script, the link, the command nobody remembers — turn each into a single item anyone can run. Chain the steps once and forget them.",
    tier: "client",
  },
  {
    icon: "wifi-off",
    title: "Fast because it's local",
    body: "Everything lives on your machine, so it opens instantly and works on a plane. No spinner, no round trip, no wondering whether the network is having a moment.",
    tier: "client",
  },
  {
    icon: "shield",
    title: "Your commands never leave your laptop",
    body: "Zipr runs everything locally. Nothing you build is executed on a server — ours or yours — which is the short answer to the long question your security team is about to ask.",
    tier: "client",
  },
  {
    icon: "users",
    title: "Stop pasting scripts into chat",
    body: "Share a catalogue and the whole team has it. New starters get the good version on day one instead of the copy someone forwarded them in their second week.",
    tier: "api",
  },
  {
    icon: "git-merge",
    title: "Two people, one item, no lost work",
    body: "Edit the same thing at the same time and both changes survive. You are told what actually clashed, rather than discovering on Friday that Tuesday's fix is gone.",
    tier: "api",
  },
  {
    icon: "history",
    title: "Undo, even weeks later",
    body: 'Every change is kept. Roll any item back to how it was, and see who changed what — so the answer to "who broke this" is a click rather than an investigation.',
    tier: "api",
  },
  {
    icon: "puzzle",
    title: "Extend it without waiting for us",
    body: "Plugins add new kinds of action, sandboxed so a bad one cannot take the app down with it. Build what your team needs and share it with them.",
    tier: "client",
  },
  {
    icon: "server",
    title: "Runs on your infrastructure",
    body: "Your catalogue lives on your servers, in your network, under your backups. There is no shared cloud to be a tenant of and no account of ours holding your data.",
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

/** The three-step story. It really does end at "free" twice. */
export const JOURNEY = [
  {
    step: "01",
    title: "Install it",
    body: "No account, no email, no trial clock. It opens on an empty workspace that belongs to your machine and nothing else.",
    cost: "Free",
  },
  {
    step: "02",
    title: "Use it forever",
    body: "Build as much as you like. Nothing expires, nothing phones home, and you can take it all with you as a single file whenever you want.",
    cost: "Free",
  },
  {
    step: "03",
    title: "Bring the team in",
    body: "When someone else needs what you built, put Zipr on your own servers and share it. Same app, more people, nothing to relearn.",
    cost: "Licensed",
  },
];

/**
 * What a paid deployment adds, for the home page.
 *
 * Framed as gains rather than as the free tier's shortcomings — the pricing
 * comparison already does the honest column-by-column version for anyone who
 * wants it.
 */
export const TEAM_UNLOCKS = [
  "Shared catalogues everyone stays in sync with",
  "Members, roles and who-can-see-what",
  "Full history, and a one-click rollback",
  "Live updates as colleagues make changes",
  "An audit trail you did not have to build",
  "Usage figures showing what the team actually runs",
];
