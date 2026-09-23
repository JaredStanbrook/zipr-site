// worker/content/pricing.ts
//
// The commercial shape.
//
// The line is unusual enough to be worth stating plainly: the app is free
// forever and complete on its own. What costs money is sharing. So this is not
// "free tier vs real version" — it is alone vs together, and the page should
// make that feel like a promise rather than a catch.
//
// Three things about the paid half that the copy has to keep straight, because
// each of them was wrong here once and each is the kind of wrong a customer
// finds out about after paying:
//
//  1. **There are two ways to buy, and they are billed on different units.**
//     The hosted service is sold per person. A self-hosted deployment is not —
//     it counts nobody, by design, because the customer's own hardware is the
//     only limit that means anything there. Quoting a per-person price for
//     self-hosting would be selling a number no invoice reflects.
//  2. **There is no trial and no free tier on the server.** The free app is
//     the trial, and it is a real one — the same build a paying team runs.
//     Anything here promising a trial of the paid product is a promise nobody
//     can keep.
//  3. **Nobody signs themselves up.** Both paid routes start with a
//     conversation, so every paid CTA goes to /contact and none of them
//     pretends to be a checkout.
//
// Money is integer cents. Never do float arithmetic on it; `formatPrice` in
// views/lib/utils.ts converts at the edge.

export interface PricingTier {
  id: "free" | "cloud" | "selfHosted";
  name: string;
  /** One line on who this is for. */
  summary: string;
  /**
   * Null where the price is "talk to us". Cents, per person, per month.
   *
   * Only the hosted tier carries a number, and that is the decision above
   * rather than a gap waiting to be filled: a self-hosted deployment is
   * priced per deployment under a written agreement.
   */
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
    id: "cloud",
    name: "Hosted",
    summary: "Everything above, crossing between people — on our servers, not yours.",
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
      "Your own database, not a shared one",
      "Sign in with Google, Microsoft or Okta",
      "Export everything as one file, any time, whatever your account is doing",
    ],
    cta: { label: "Request access", href: "/contact?topic=cloud" },
    featured: true,
  },
  {
    id: "selfHosted",
    name: "Self-hosted",
    summary: "The same thing, on infrastructure you control, under a written agreement.",
    monthlyCents: null,
    annualMonthlyCents: null,
    minimumSeats: null,
    priceNote: "Priced per deployment, not per person",
    features: [
      "Everything in Hosted",
      "Runs on your servers, or in your own cloud account",
      "No user limit — the hardware you chose is the only one",
      "Nothing leaves your network, including the licence check",
      "Runs air-gapped",
      "Settings you can lock down centrally",
      "An admin console for the whole instance",
      "Support with an agreed response time",
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
 *
 * The two paid columns are mostly identical on purpose, and the page says so:
 * they are the same software, and what differs is who operates it and how it
 * is billed. Manufacturing a feature gap between them to justify the second
 * column would be inventing a product difference that does not exist.
 */
export interface ComparisonRow {
  feature: string;
  note?: string;
  free: boolean | string;
  cloud: boolean | string;
  selfHosted: boolean | string;
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
        cloud: "Unlimited",
        selfHosted: "Unlimited",
      },
      { feature: "All twelve action types", free: true, cloud: true, selfHosted: true },
      {
        feature: "Your own action types",
        note: "For anything the built-in twelve don't cover.",
        free: true,
        cloud: true,
        selfHosted: true,
      },
      {
        feature: "Steps that differ per operating system",
        free: true,
        cloud: true,
        selfHosted: true,
      },
      {
        feature: "Plugins",
        free: "Install your own",
        cloud: "Share with the team",
        selfHosted: "Share with the team",
      },
      {
        feature: "Works with no network",
        free: true,
        cloud: true,
        selfHosted: true,
      },
      {
        feature: "Export everything",
        note: "Nothing is ever held against a bill — on the hosted service the export keeps working even while an account is suspended.",
        free: "One file",
        cloud: "One file",
        selfHosted: "It's your database",
      },
    ],
  },
  {
    title: "Working with other people",
    rows: [
      {
        feature: "Workspaces",
        free: "One, private",
        cloud: "Unlimited",
        selfHosted: "Unlimited",
      },
      { feature: "Members and roles", free: false, cloud: true, selfHosted: true },
      { feature: "Shared catalogues", free: false, cloud: true, selfHosted: true },
      {
        feature: "Publish your work to the team",
        note: "A copy, so your own version stays exactly where it was.",
        free: false,
        cloud: true,
        selfHosted: true,
      },
      {
        feature: "Everyone's copy stays current",
        free: false,
        cloud: true,
        selfHosted: true,
      },
      {
        feature: "Live updates",
        note: "Changes appear as colleagues make them.",
        free: false,
        cloud: true,
        selfHosted: true,
      },
      {
        feature: "Editing the same item at once",
        note: "Both sets of changes survive, and you are told what actually clashed.",
        free: "Not applicable",
        cloud: true,
        selfHosted: true,
      },
    ],
  },
  {
    title: "History and oversight",
    rows: [
      { feature: "Full history and rollback", free: false, cloud: true, selfHosted: true },
      { feature: "Tags", free: false, cloud: true, selfHosted: true },
      {
        feature: "What you've run",
        free: "This machine",
        cloud: "This machine + team",
        selfHosted: "This machine + team",
      },
      {
        feature: "Team usage figures",
        note: "What people actually run, so you know what matters.",
        free: false,
        cloud: true,
        selfHosted: true,
      },
      {
        feature: "Audit trail",
        free: false,
        cloud: "Per workspace",
        selfHosted: "Instance-wide",
      },
      {
        feature: "Central values your catalogues reuse",
        note: "Paths and addresses set once, so nothing is hardcoded in an item.",
        free: false,
        cloud: true,
        selfHosted: true,
      },
      {
        feature: "Lock settings centrally",
        free: false,
        cloud: false,
        selfHosted: true,
      },
    ],
  },
  {
    title: "Running it",
    rows: [
      {
        feature: "Where your data lives",
        free: "Your machine",
        cloud: "Our servers, your own database",
        selfHosted: "Your servers",
      },
      {
        feature: "Who operates it",
        note: "Upgrades, backups and the pager.",
        free: "You, trivially",
        cloud: "Us",
        selfHosted: "You",
      },
      {
        feature: "Single sign-on",
        note: "Google, Microsoft Entra or Okta.",
        free: false,
        cloud: true,
        selfHosted: true,
      },
      { feature: "Admin console", free: false, cloud: true, selfHosted: "Instance-wide" },
      { feature: "Runs air-gapped", free: true, cloud: false, selfHosted: true },
      {
        feature: "What you're billed for",
        note: "Self-hosting counts nobody — your hardware is the limit.",
        free: "Nothing",
        cloud: "Per person",
        selfHosted: "Per deployment",
      },
      {
        feature: "Support",
        free: "Best effort, by email",
        cloud: "Email",
        selfHosted: "Agreed response time",
      },
    ],
  },
];

/**
 * What running it yourself involves.
 *
 * The buyer question behind this — "what is the real cost?" — is legitimate
 * and worth answering, so it stays. What it no longer does is name the
 * components: which database, which cache, which identity provider is our
 * business, and printing the parts list on a public page is free research for
 * anyone considering building the same thing.
 *
 * This section is about the self-hosted option specifically. It used to be the
 * only paid option, so it could be framed as "what running it involves" full
 * stop; now the honest framing is that this is the work the hosted service
 * exists to take off you.
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
    body: "Your deployment does not report to us or check in with us. The licence is verified on your own hardware, so it keeps working with the internet unplugged.",
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
    q: "Hosted or self-hosted — which should we pick?",
    a: "It is the same software either way, so pick on operations rather than features. Hosted means we run it, patch it, back it up and get paged when it breaks, and you pay per person. Self-hosted means your data never leaves infrastructure you control, you can run it with no internet at all, and you pay for the deployment rather than for people. Teams who have a platform group and a policy about where data sits usually want the second; everyone else is better served by the first.",
  },
  {
    q: "What counts as a person?",
    a: "On the hosted service, anyone an administrator has added to your organisation. It is a deliberate act by someone on your side, so there are no surprises on the invoice — but it also means somebody counts from the moment they are added, whether or not they ever sign in. Remove them and they stop counting at the next renewal. Self-hosting does not count people at all.",
  },
  {
    q: "Can we try it first?",
    a: "The free app is the trial, and it is a real one — the same build a paying team runs, with no clock on it. There is no separate trial of the shared version, because standing one up means provisioning a database and an organisation for you, which is the paid thing itself. Talk to us and we will work out something sensible for a pilot.",
  },
  {
    q: "Do you host it for us?",
    a: "Yes. Your organisation gets its own database rather than a row in a shared one, which is what makes a per-customer restore possible and keeps one company's load off another's. We run the upgrades and the backups. If you would rather it sat on your own infrastructure, that is the self-hosted option and it is the same product.",
  },
  {
    q: "What happens if we stop paying?",
    a: "Nothing is deleted and nothing is held hostage. On the hosted service a lapsed invoice first leaves everything readable while writes are refused, then suspends the account with your data retained — and you can export the lot at any point in that sequence without settling anything first. On a self-hosted deployment an expired licence does the same thing on your own server: reads keep working, writes are refused, and it warns you for a month beforehand rather than stopping on the morning of. Everything on individual machines is unaffected either way.",
  },
  {
    q: "Can we start hosted and move to our own servers later?",
    a: "Your content exports as one file whenever you want it, so nothing traps you. What we do not have yet is a one-click conversion that carries accounts and history across, so treat a move as a planned piece of work rather than a setting. Tell us early and we will plan it with you.",
  },
  {
    q: "How do we pay?",
    a: "By invoice. Hosted is billed yearly or monthly per person; self-hosted is an annual figure for the deployment, agreed up front. Either way you get a quote before anything starts, and for self-hosting a licence key with it.",
  },
];
