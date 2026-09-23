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

export const PILLARS: Feature[] = [
  {
    icon: "zap",
    title: "An idea, in a form somebody can run",
    body: "The sequence you worked out becomes one thing with a name. Not a document describing it. Not a script they need talking through. A thing they click, that works the first time.",
    tier: "client",
  },
  {
    icon: "wifi-off",
    title: "No gap between thinking of it and doing it",
    body: "Everything is already on your machine, so Zipr opens instantly and works on a plane. That gap — the loading, the searching, the where-did-I-put-it — is where good intentions quietly go to die.",
    tier: "client",
  },
  {
    icon: "shield",
    title: "Zipr holds your ideas. It never runs them",
    body: "Every command executes on the machine of the person who clicked, and nowhere else. Not on our servers, not on yours. It is the short answer to the long question your security team is about to ask.",
    tier: "client",
  },
  {
    icon: "users",
    title: "Hand it over instead of explaining it",
    body: "Publish to a catalogue and it is theirs — current, complete, the same version everyone else has. No walkthrough, no zip file in a chat thread, no afternoon spent watching over somebody's shoulder.",
    tier: "api",
  },
  {
    icon: "git-merge",
    title: "Two people, one idea, nothing lost",
    body: "Improve the same thing at the same time and both improvements survive. You are told what genuinely clashed, rather than finding out on Friday that Tuesday's fix is gone.",
    tier: "api",
  },
  {
    icon: "history",
    title: "Room to try the strange version",
    body: 'Every change is kept, so nothing you attempt is expensive. Put any item back to how it was, and see who changed what — the answer to "who broke this" is a click rather than an investigation.',
    tier: "api",
  },
  {
    icon: "puzzle",
    title: "When the twelve verbs run out",
    body: "Plugins add new kinds of step, kept at arm's length so a bad one cannot take the app down with it. Build the one your team has been wishing for, and share it with them.",
    tier: "client",
  },
  {
    icon: "server",
    title: "On your servers, inside your walls",
    body: "Your catalogue lives on your infrastructure, in your network, under your backups. There is no shared cloud to be a tenant of and no account of ours holding your work.",
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
    title: "Have the idea",
    body: "Install it and build the first one. No account, no email, no clock counting down — just a workspace that belongs to your machine and to nothing else.",
    cost: "Free",
  },
  {
    step: "02",
    title: "Keep having them",
    body: "Build as many as you like, for as long as you like. Nothing expires, nothing phones home, and all of it leaves with you as a single file whenever you want.",
    cost: "Free",
  },
  {
    step: "03",
    title: "Let one out of the box",
    body: "The day an idea stops being only yours, give your team a Zipr server — ours or your own — and let it travel. Same app, more people, nothing to relearn.",
    cost: "Paid",
  },
];

/**
 * What a paid deployment adds, for the home page.
 *
 * Framed as gains rather than as the free tier's shortcomings — the pricing
 * comparison already does the honest column-by-column version for anyone who
 * wants it. Each line is something that has to be true for knowledge to cross
 * a boundary safely, which is the section it sits in.
 */
export const TEAM_UNLOCKS = [
  "A workspace per team, on one deployment",
  "Publish a copy across, keeping your own exactly as it was",
  "Roles and visibility matching the structure you already have",
  "Everyone's copy current, updating as colleagues work",
  "Full history, and a one-click way back",
  "An audit trail you did not have to build",
  "Figures showing which ideas people actually run",
];
