// worker/content/pricing.ts
//
// The commercial shape.
//
// The line is unusual enough to be worth stating plainly: the app is free
// forever and complete on its own. What costs money is sharing. So this is not
// "free tier vs real version" — it is alone vs together, and the page should
// make that feel like a promise rather than a catch.
//
// Money is integer cents. Never do float arithmetic on it; `formatPrice` in
// views/lib/utils.ts converts at the edge.

export interface PricingTier {
  id: "free" | "team" | "enterprise";
  name: string;
  /** One line on who this is for. */
  summary: string;
  /** Null where the price is "talk to us". Cents, per person, per month. */
  monthlyCents: number | null;
  /** Cents per person per month when paid for a year up front. */
  annualMonthlyCents: number | null;
  /** Smallest billable team, or null where there is no minimum. */
  minimumSeats: number | null;
  /** Sits under the price, saying what the number is per. */
  priceNote: string;
  features: string[];
  cta: { label: string; href: string };
  /** Renders in the brand's primary weight. Exactly one tier. */
  featured?: boolean;
}

export const TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    summary: "The whole app, on your machine, for as long as you like.",
    monthlyCents: 0,
    annualMonthlyCents: 0,
    minimumSeats: null,
    priceNote: "No account. No card. No expiry.",
    features: [
      "Windows and macOS",
      "Unlimited items and catalogues",
      "All twelve action types, chained however you like",
      "Steps that differ per operating system",
      "Plugins",
      "History of what you've run",
      "Export everything as one file",
      "Works offline, permanently",
    ],
    cta: { label: "Download Zipr", href: "/downloads" },
  },
  {
    id: "team",
    name: "Team",
    summary: "Everything above, shared — on servers you control.",
    monthlyCents: 700,
    annualMonthlyCents: 600,
    minimumSeats: 5,
    priceNote: "per person, per month, billed yearly",
    features: [
      "Everything in Free, for everyone",
      "Shared catalogues the whole team stays in sync with",
      "Members, roles, and who-can-see-what",
      "Edit at the same time without losing work",
      "Full history and one-click rollback",
      "Live updates as colleagues make changes",
      "Tags across the workspace",
      "Share plugins internally",
      "Audit trail and usage figures",
      "An admin console for the whole instance",
    ],
    cta: { label: "Start a trial", href: "/contact?topic=licence" },
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    summary: "For a rollout that has to satisfy somebody else.",
    monthlyCents: null,
    annualMonthlyCents: null,
    minimumSeats: null,
    priceNote: "Priced per deployment",
    features: [
      "Everything in Team",
      "Single sign-on",
      "Settings you can lock down centrally",
      "Support with an agreed response time",
      "Help with the rollout, including air-gapped",
      "Invoicing, security review, DPA",
    ],
    cta: { label: "Talk to us", href: "/contact?topic=licence" },
  },
];

/**
 * The comparison table.
 *
 * Still honest — every "no" is real — but framed by what the reader gets
 * rather than by the mechanism that makes it so. The notes explain
 * consequences, not architecture.
 */
export interface ComparisonRow {
  feature: string;
  note?: string;
  free: boolean | string;
  team: boolean | string;
  enterprise: boolean | string;
}

export interface ComparisonGroup {
  title: string;
  rows: ComparisonRow[];
}

export const COMPARISON: ComparisonGroup[] = [
  {
    title: "Building and running things",
    rows: [
      {
        feature: "Items and catalogues",
        free: "Unlimited",
        team: "Unlimited",
        enterprise: "Unlimited",
      },
      { feature: "All twelve action types", free: true, team: true, enterprise: true },
      {
        feature: "Your own action types",
        note: "For anything the built-in twelve don't cover.",
        free: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Steps that differ per operating system",
        free: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Plugins",
        free: "Install your own",
        team: "Share with the team",
        enterprise: "Share with the team",
      },
      {
        feature: "Works with no network",
        free: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Export everything",
        note: "One file, yours, whenever you want it.",
        free: true,
        team: true,
        enterprise: true,
      },
    ],
  },
  {
    title: "Working with other people",
    rows: [
      {
        feature: "Workspaces",
        free: "One, private",
        team: "Unlimited",
        enterprise: "Unlimited",
      },
      { feature: "Members and roles", free: false, team: true, enterprise: true },
      { feature: "Shared catalogues", free: false, team: true, enterprise: true },
      {
        feature: "Publish your work to the team",
        note: "A copy, so your own version stays exactly where it was.",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Everyone's copy stays current",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Live updates",
        note: "Changes appear as colleagues make them.",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Editing the same item at once",
        note: "Both sets of changes survive, and you are told what actually clashed.",
        free: "Not applicable",
        team: true,
        enterprise: true,
      },
    ],
  },
  {
    title: "History and oversight",
    rows: [
      { feature: "Full history and rollback", free: false, team: true, enterprise: true },
      { feature: "Tags", free: false, team: true, enterprise: true },
      {
        feature: "What you've run",
        free: "This machine",
        team: "This machine + team",
        enterprise: "This machine + team",
      },
      {
        feature: "Team usage figures",
        note: "What people actually run, so you know what matters.",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Audit trail",
        free: false,
        team: "Per workspace",
        enterprise: "Instance-wide",
      },
      {
        feature: "Central values your catalogues reuse",
        note: "Paths and addresses set once, so nothing is hardcoded in an item.",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Lock settings centrally",
        free: false,
        team: false,
        enterprise: true,
      },
    ],
  },
  {
    title: "Running it",
    rows: [
      {
        feature: "Where your data lives",
        free: "Your machine",
        team: "Your servers",
        enterprise: "Your servers",
      },
      { feature: "Single sign-on", free: false, team: false, enterprise: true },
      { feature: "Admin console", free: false, team: true, enterprise: true },
      {
        feature: "Support",
        free: "Community",
        team: "Email",
        enterprise: "Agreed response time",
      },
    ],
  },
];

/**
 * What running it involves.
 *
 * The buyer question behind this — "what is the real cost?" — is legitimate
 * and worth answering, so it stays. What it no longer does is name the
 * components: which database, which cache, which identity provider is our
 * business, and printing the parts list on a public page is free research for
 * anyone considering building the same thing.
 */
export const RUNNING_NOTES = [
  {
    icon: "server",
    title: "One modest server",
    body: "A team of twenty fits comfortably on a small virtual machine. It is not a cluster, and it does not want to be.",
  },
  {
    icon: "zap",
    title: "Up in an afternoon",
    body: "One command brings the whole thing up. Most of the time is your own change control, not the install.",
  },
  {
    icon: "shield-check",
    title: "Nothing phones home",
    body: "Your deployment does not report to us, check in with us, or need us to be online for your team to work.",
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const PRICING_FAQ: Faq[] = [
  {
    q: "Why is the app free if the team version isn't?",
    a: "Because the app is genuinely complete on its own. It stores your work on your machine and runs everything there, so it would keep working whatever we did. Charging for that would be charging for something we cannot take away. Sharing is the part that needs a server, and that is the part you pay for.",
  },
  {
    q: "What am I paying for if I host it myself?",
    a: "A licence to run the team version, and support for it. You provide the server; we provide the software that makes a catalogue shareable, and the people who answer when it misbehaves.",
  },
  {
    q: "What counts as a person?",
    a: "Someone with an account on your deployment who signed in during the billing period. Deactivated members stop counting at the next renewal.",
  },
  {
    q: "What happens if we stop paying?",
    a: "Your server keeps running and nothing is deleted or locked — it is yours. What stops is support and access to new versions. Everything on individual machines is unaffected.",
  },
  {
    q: "Can we try it first?",
    a: "Yes. Ask and we will set you up with a trial long enough to put a real team on it. And you can use the free app today without talking to anyone at all.",
  },
  {
    q: "Do you host it for us?",
    a: "Not today. Every organisation runs its own, which is why your catalogue is not sitting on somebody else's server. If a hosted option would change your mind, tell us — it is the request we are counting.",
  },
  {
    q: "How do we pay?",
    a: "Invoice, annually, in USD. Get in touch and we will send one along with your licence key.",
  },
];
