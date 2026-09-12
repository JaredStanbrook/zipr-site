// worker/content/features.ts
//
// The product, described once. Every claim here is traceable to something the
// client or the API actually does — if a line stops being true, it is a bug in
// this file, not a bit of licence.

export interface Feature {
  /** Lucide icon name. Must also be registered in components/lib/icons.ts. */
  icon: string;
  title: string;
  body: string;
  /** Which side of the commercial line this sits on. */
  tier: "client" | "api";
}

export const PILLARS: Feature[] = [
  {
    icon: "box",
    title: "One catalogue, many launchers",
    body: "An item is a name, an appearance, some tags and an ordered list of actions. Open a URL, copy a string, ask a question, run a command, open a panel, call a plugin — chained, conditional, and different per operating system where they need to be. Twelve built-in action types are validated on save; custom ones are stored verbatim for your own client to interpret.",
    tier: "client",
  },
  {
    icon: "shield",
    title: "The server never runs anything",
    body: "Zipr's API stores, versions and shares actions. It never executes one, never makes an outbound call on your behalf, and never resolves a variable reference. Everything that happens, happens on the machine of the person who clicked. That is a security property you can hand to a reviewer, not a roadmap item.",
    tier: "client",
  },
  {
    icon: "wifi-off",
    title: "Offline is the normal case",
    body: "Every client keeps a local mirror and a write outbox. Lose the network and you carry on: edits queue, and the interface says plainly which ones the server has and which ones it does not. A queued edit is never drawn as though it landed.",
    tier: "client",
  },
  {
    icon: "git-merge",
    title: "Two people, one item, no lost work",
    body: "Writes carry the revision they were made against. When two land on the same item the server runs a three-way merge and tells you exactly which fields actually collided, rather than picking a winner or refusing the write. Conflicts are shown as conflicts and resolved by a person.",
    tier: "api",
  },
  {
    icon: "history",
    title: "Every change is recoverable",
    body: "The API keeps a revision per item write and can hand back any point in time. Alongside it is a server-written audit log — who did what, in which workspace — that no client wrote and no client can edit.",
    tier: "api",
  },
  {
    icon: "radio",
    title: "Changes arrive, they are not polled for",
    body: "One event stream per client tells it what changed in the workspaces and catalogues it can see, so it syncs when there is something to sync. Lose the stream and delta sync is still the authority — the stream is the optimisation, never the contract.",
    tier: "api",
  },
  {
    icon: "puzzle",
    title: "Plugins in their own process",
    body: "A plugin is an operating-system process the host supervises over a pipe, holding named capabilities rather than the run of the host's memory. With a deployment you also get repositories to publish them through, with releases, assets and update checks.",
    tier: "client",
  },
  {
    icon: "server",
    title: "Your deployment, start to finish",
    body: "One organisation, one instance, one database, your own instance admins. There is no shared control plane and no multi-tenant instance to be a tenant of. Bring it up with Docker Compose, or on Ory Network if you would rather not operate an identity provider.",
    tier: "api",
  },
];

/** The twelve built-in action types, as the API's registry validates them. */
export const ACTION_TYPES = [
  { name: "open_url", blurb: "Open an address, optionally in a named browser." },
  {
    name: "copy_to_clipboard",
    blurb: "Put text on the clipboard, with or without a notification.",
  },
  { name: "confirm_prompt", blurb: "Ask a yes-or-no question and branch on the answer." },
  { name: "text_prompt", blurb: "Ask for a value and carry it into later steps." },
  { name: "selector_prompt", blurb: "Offer a list and use what was chosen." },
  { name: "request_auth", blurb: "Require the person to re-authenticate before continuing." },
  { name: "run_exe", blurb: "Launch an executable with arguments." },
  { name: "run_command", blurb: "Run a shell command." },
  { name: "open_file", blurb: "Open a file with its default application." },
  { name: "open_folder", blurb: "Reveal a folder in the file manager." },
  { name: "open_panel", blurb: "Open one of the client's own panels." },
  { name: "plugin_action", blurb: "Hand off to an installed plugin." },
];

/**
 * The three-step story the home page tells. Deliberately ends on the paid
 * step, because that is the actual shape of the product rather than a funnel
 * trick: you really can stop after step two and never pay anything.
 */
export const JOURNEY = [
  {
    step: "01",
    title: "Install it and build something",
    body: "No account, no address, no network. The client opens on a local workspace that belongs to your machine and to nothing else. Make catalogues, make items, launch them.",
    cost: "Free",
  },
  {
    step: "02",
    title: "Keep working, offline, forever",
    body: "Nothing expires and nothing phones home. Export the lot as one JSON document whenever you like — it is the only copy, so it exports.",
    cost: "Free",
  },
  {
    step: "03",
    title: "Someone else needs it",
    body: "Stand up the API on your own infrastructure and publish a local catalogue to a workspace. From that point everyone has it, edits are merged rather than overwritten, and every change is recoverable.",
    cost: "Licensed",
  },
];

/**
 * What the local workspace deliberately cannot do, named so that none of them
 * reads as an oversight. Lifted from the client's own architecture notes,
 * because a prospect who finds this out after downloading is a prospect who
 * stops trusting the rest of the page.
 */
export const LOCAL_LIMITS = [
  {
    limit: "No tags",
    why: "A tag is a workspace-scoped resource on the API, so a local workspace shows the same empty state a synced one with no tags shows.",
  },
  {
    limit: "No revision history or restore",
    why: "Restoring reads the revisions a deployment keeps. A local delete is a delete, not an archive.",
  },
  {
    limit: "No move or copy between catalogues",
    why: "Both are API operations. Moving local work to a team is publishing, which works on whole catalogues.",
  },
  {
    limit: "No shared analytics",
    why: "Ingest is an API route, so a local launch is recorded in launch history on this machine instead and sent nowhere.",
  },
  {
    limit: "One workspace, not many",
    why: "A workspace scopes membership, and there is no membership on a single machine. Catalogues are the grain instead.",
  },
];
