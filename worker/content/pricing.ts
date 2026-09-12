// worker/content/pricing.ts
//
// The commercial shape, in one file.
//
// Zipr's split is unusual enough to be worth stating plainly: the desktop
// client is free forever and complete on its own, because every install has a
// local workspace no deployment owns and the client is what executes actions.
// What costs money is the API — and the API's whole job is letting other
// people see your work. So the line is not "free tier vs real version", it is
// **alone vs together**.
//
// Money is integer cents, per the house convention. Never do float arithmetic
// on it; `formatPrice` in views/lib/utils.ts converts at the edge.

export interface PricingTier {
  id: "free" | "team" | "enterprise";
  name: string;
  /** The one line that says who this is for. */
  summary: string;
  /** Null where the price is "talk to us". Cents, per person, per month. */
  monthlyCents: number | null;
  /** Cents per person per month when paid for a year up front. */
  annualMonthlyCents: number | null;
  /** Smallest billable team, or null where there is no minimum. */
  minimumSeats: number | null;
  /** Sits under the price, explaining what the number is per. */
  priceNote: string;
  features: string[];
  cta: { label: string; href: string };
  /** Renders the card in the brand's primary weight. Exactly one tier. */
  featured?: boolean;
}

export const TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Client",
    summary: "Everything one person needs, on one machine, forever.",
    monthlyCents: 0,
    annualMonthlyCents: 0,
    minimumSeats: null,
    priceNote: "No account. No card. No expiry.",
    features: [
      "The desktop client for Windows and macOS",
      "One local workspace, unlimited catalogues and items",
      "All twelve built-in action types, plus custom ones",
      "Chained actions, per-OS variants, conditional steps",
      "Plugins, installed and run locally",
      "Launch history for this machine",
      "Export and import as JSON",
      "Works offline permanently — it never calls a server",
    ],
    cta: { label: "Download Zipr", href: "/downloads" },
  },
  {
    id: "team",
    name: "Team",
    summary: "A licence for the API you host, so the work can be shared.",
    monthlyCents: 700,
    annualMonthlyCents: 600,
    minimumSeats: 5,
    priceNote: "per person, per month, billed yearly",
    features: [
      "Everything in Client, for everyone on the team",
      "Workspaces, members and per-workspace roles",
      "Shared catalogues — publish a local one to the team",
      "Delta sync, so every client mirrors the catalogue offline",
      "Live updates over the event stream",
      "Concurrent edits resolved by a server-side three-way merge",
      "Per-item revision history and point-in-time restore",
      "Workspace tags",
      "Plugin repositories, releases and asset distribution",
      "Instance variables, so catalogues hold no hardcoded paths",
      "Audit log and usage analytics",
      "The instance-admin console",
    ],
    cta: { label: "Ask about a licence", href: "/contact?topic=licence" },
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    summary: "For a deployment that has to answer to somebody.",
    monthlyCents: null,
    annualMonthlyCents: null,
    minimumSeats: null,
    priceNote: "Priced per deployment",
    features: [
      "Everything in Team",
      "Ory Network as the identity provider, or your own Kratos",
      "Managed policy — locked client settings, governed local workspaces",
      "Support with an agreed response target",
      "Help standing the deployment up, including air-gapped",
      "Invoicing, security review, data processing agreement",
    ],
    cta: { label: "Talk to us", href: "/contact?topic=licence" },
  },
];

/**
 * The comparison table.
 *
 * Deliberately drawn from what the API's `GET /capabilities` actually reports
 * and what the client's local workspace actually refuses, rather than from a
 * marketing wish list — every "no" below is a real, documented limitation of
 * running with no deployment, not a feature held back to sell a tier.
 */
export interface ComparisonRow {
  feature: string;
  /** Why the answer is what it is. Shown as help text under the feature. */
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
    title: "Building and launching",
    rows: [
      {
        feature: "Items, catalogues, actions",
        note: "The client stores and runs them. Nothing here needs a server.",
        free: "Unlimited",
        team: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        feature: "All twelve built-in action types",
        free: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Custom action types",
        note: "Parameters are stored verbatim and interpreted by your client.",
        free: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Per-OS action variants",
        free: true,
        team: true,
        enterprise: true,
      },
      {
        feature: "Plugins",
        note: "The plugin host has never needed the API. Installing one by hand works with no deployment.",
        free: "Local install",
        team: "Local + repositories",
        enterprise: "Local + repositories",
      },
      {
        feature: "Works with no network",
        note: "A local item's actions are already on the machine, so launching one touches nothing.",
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
        note: "A workspace scopes membership. With nobody to be a member, one local workspace is the whole of it.",
        free: "One, local",
        team: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        feature: "Members and roles",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Shared catalogues",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Publish a local catalogue to the team",
        note: "A one-way copy that leaves your local one exactly where it was.",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Delta sync",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Live updates",
        note: "An event stream telling clients what changed, so they sync less.",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Concurrent editing without lost work",
        note: "Optimistic concurrency and a server-side three-way merge. There is no second writer on one machine, so nothing to merge.",
        free: "Not applicable",
        team: true,
        enterprise: true,
      },
    ],
  },
  {
    title: "History and governance",
    rows: [
      {
        feature: "Revision history and restore",
        note: "The revisions a deployment keeps are what a restore reads.",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Tags",
        note: "A tag is a workspace-scoped resource on the API.",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Launch history",
        note: "What you ran on this computer. Kept locally, capped, and erasable.",
        free: "This machine",
        team: "This machine + team",
        enterprise: "This machine + team",
      },
      {
        feature: "Usage analytics",
        note: "What everybody in a workspace ran, aggregated on your own server.",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Audit log",
        free: false,
        team: "Per workspace",
        enterprise: "Instance-wide",
      },
      {
        feature: "Instance variables",
        note: "Values a catalogue should not hardcode, supplied by the deployment.",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Managed policy",
        note: "Locked settings pushed to managed machines, including whether local workspaces are allowed at all.",
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
        feature: "Where the data lives",
        free: "Your machine",
        team: "Your server",
        enterprise: "Your server",
      },
      {
        feature: "Identity provider",
        note: "Self-hosted Kratos is the architecture; Ory Network is a supported second option.",
        free: "None needed",
        team: "Kratos, self-hosted",
        enterprise: "Kratos or Ory Network",
      },
      {
        feature: "Instance-admin console",
        free: false,
        team: true,
        enterprise: true,
      },
      {
        feature: "Support",
        free: "Community",
        team: "Email",
        enterprise: "Agreed response target",
      },
    ],
  },
];

/**
 * What the licence does *not* cover — the infrastructure the customer pays
 * their own cloud for. Saying this on the pricing page rather than in a sales
 * call is the point: a self-hosted product whose real cost only emerges at
 * deployment time is one nobody trusts twice.
 */
export const RUNNING_COSTS = [
  {
    component: "Postgres",
    requirement: "Required",
    detail:
      "The one hard dependency. Everything the API stores lives here, and readiness fails without it.",
  },
  {
    component: "Redis",
    requirement: "Optional",
    detail:
      "Backs the live event stream and the analytics queue. Without it clients poll for changes instead, and every other route is unaffected.",
  },
  {
    component: "Object storage",
    requirement: "Optional",
    detail:
      "S3-compatible, for plugin release archives. Without it plugin repositories still work; only distribution is absent.",
  },
  {
    component: "Kratos",
    requirement: "Required",
    detail:
      "The identity provider. Run it yourself in the same compose file, or use Ory Network and run one fewer database.",
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const PRICING_FAQ: Faq[] = [
  {
    q: "If I host it myself, what am I paying for?",
    a: "A licence to run the API, and support for it. The server software is what took the work — the concurrency model, the merge, the sync contract, the audit trail — and it is the part that makes a catalogue shareable. You supply and pay for the infrastructure it runs on, which is yours and stays yours.",
  },
  {
    q: "Why is the client free if the API is not?",
    a: "Because the client is genuinely complete alone. It stores items in a workspace no server owns, and it is the thing that executes actions — the API never runs anything. Charging for a client that works offline by itself would be charging for something you could not stop working. The API earns its money the moment a second person needs to see your catalogue.",
  },
  {
    q: "What counts as a person?",
    a: "Someone with an account on your deployment who has signed in during the billing period. Service accounts that only read do not count. Deactivated members stop counting at the next renewal.",
  },
  {
    q: "What happens if the licence lapses?",
    a: "The API keeps running and nothing is deleted or locked — it is your server. What stops is support and the right to upgrade to new versions. Clients keep their local workspaces regardless, because those were never the deployment's.",
  },
  {
    q: "Is there a trial?",
    a: "Yes. Ask for one and you get a licence long enough to stand a deployment up and put a real team on it. The API ships a compose file that brings the whole stack up in one command, so the trial is the product rather than a sandbox.",
  },
  {
    q: "Can I evaluate it without a licence at all?",
    a: "Download the client and use it. Every local feature is there permanently, and it is the same binary a licensed team runs — there is no evaluation build and no countdown.",
  },
  {
    q: "Do you host it for us?",
    a: "Not today. There is no shared control plane and no multi-tenant instance: each organisation runs its own, with its own database, users and admins. That is the architecture rather than a stage, and it is why your catalogue is not on anybody else's server.",
  },
  {
    q: "How do I pay?",
    a: "Invoice, annually, in USD. Get in touch and we will send one along with the licence key.",
  },
];
