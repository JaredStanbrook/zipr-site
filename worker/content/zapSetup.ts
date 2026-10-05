// worker/content/zapSetup.ts
//
// How to connect Zap to a model with your own key, one provider at a time.
//
// **This page goes stale by design.** Providers move menus, rename models and
// change how billing works without telling anyone, so every provider carries
// the date its steps were last walked through against the provider's own
// pages, and the page shows it. When you re-check a provider, change its
// `checked` date even if nothing else changed — the date is the promise.
// When a step changes, edit it here and add a line to `ZAP_SETUP_HISTORY`.
//
// **What is ours and what is theirs.** The "In Zipr" steps describe the app's
// own connection form (Zap → Your model connection) and are true until the
// app changes. Everything before them is the provider's, and the `sources`
// are where it was read from; they are the authority when the two disagree.
//
// **Models are checked against how Zipr calls them, not just against the
// provider's list.** Zipr speaks OpenAI's Chat Completions API and asks the
// model to call a tool when the connection is saved. A model that only calls
// tools through another API is refused at "Check and save", so it is listed
// under `avoid` with the reason, rather than left for someone to discover.

export interface SetupStep {
  title: string;
  body: string;
}

export interface SetupModel {
  id: string;
  note: string;
}

export interface SetupProvider {
  /** Anchor on the page. */
  id: "claude" | "openai";
  name: string;
  /** What the person probably calls it. */
  product: string;
  /** What to choose in Zipr's Provider menu. */
  appProvider: string;
  /** ISO date the steps were last checked against the provider's own pages. */
  checked: string;
  console: { label: string; url: string };
  /** Plans that look like they should work and do not include API use. */
  notIncluded: string;
  steps: SetupStep[];
  models: SetupModel[];
  avoid: SetupModel[];
  sources: { label: string; url: string }[];
}

/** When this page was first published. */
export const ZAP_SETUP_WRITTEN = "2026-10-05";

export const ZAP_SETUP_PROVIDERS: SetupProvider[] = [
  {
    id: "claude",
    name: "Anthropic",
    product: "Claude",
    appProvider: "Anthropic",
    checked: "2026-10-05",
    console: { label: "Claude Console", url: "https://platform.claude.com" },
    notIncluded:
      "A Claude Pro or Max plan covers Claude on claude.ai and its apps, not the API. API use is paid for separately, in the Claude Console, with credits.",
    steps: [
      {
        title: "Sign in to the Claude Console",
        body: "Go to platform.claude.com and sign in, or create an account. It is a different place from claude.ai, though you can use the same email address.",
      },
      {
        title: "Buy some credits",
        body: "Open Settings → Billing and choose Buy credits. Credits are available as soon as the purchase goes through. You need the Admin or Billing role in the organisation to do this; if the option isn't there, ask whoever set the organisation up.",
      },
      {
        title: "Create a key",
        body: 'Open Settings → API keys and choose Create key. Name it something you\'ll recognise later, such as "Zipr on my laptop", pick when it should expire, and leave Linked account set to yourself.',
      },
      {
        title: "Copy the key straight away",
        body: "The key starts with sk-ant- and is shown only once. Copy it now. If you lose it, delete it and create another — it can't be shown again.",
      },
    ],
    models: [
      {
        id: "claude-opus-5-5",
        note: "Anthropic's current Opus, and the one to start with.",
      },
      {
        id: "claude-sonnet-5-5",
        note: "Half the price per token, and quick. A good choice if you use Zap a lot.",
      },
    ],
    avoid: [],
    sources: [
      { label: "Get your Claude API key", url: "https://platform.claude.com/docs/en/get-api-key" },
      {
        label: "How do I pay for my Claude API usage?",
        url: "https://support.claude.com/en/articles/8977456-how-do-i-pay-for-my-claude-api-usage",
      },
      {
        label: "What is the Pro plan?",
        url: "https://support.claude.com/en/articles/8325606-what-is-the-pro-plan",
      },
      {
        label: "Models overview",
        url: "https://platform.claude.com/docs/en/about-claude/models/overview",
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    product: "ChatGPT",
    appProvider: "OpenAI",
    checked: "2026-10-05",
    console: { label: "OpenAI Platform", url: "https://platform.openai.com" },
    notIncluded:
      "A ChatGPT Plus, Pro or Business plan covers ChatGPT, not the API. API use is billed separately, on the OpenAI Platform, from a prepaid balance.",
    steps: [
      {
        title: "Sign in to the OpenAI Platform",
        body: "Go to platform.openai.com and sign in, or create an account. You can use the same login as ChatGPT, but billing is kept apart. OpenAI may ask to verify a phone number.",
      },
      {
        title: "Add a payment method and credit",
        body: "Open Settings → Billing, add a card and buy prepaid credit. A small amount is enough to try Zap. Consider setting a monthly usage limit while you're there.",
      },
      {
        title: "Create a key",
        body: 'Open the API keys page (platform.openai.com/api-keys) and choose Create new secret key. Name it something you\'ll recognise later, such as "Zipr on my laptop".',
      },
      {
        title: "Copy the key straight away",
        body: "The full key is shown only once, when you create it. Copy it now. If you lose it, revoke it and create another.",
      },
    ],
    models: [
      {
        id: "gpt-6-astra",
        note: "OpenAI's flagship, and the one that works with Zipr today.",
      },
    ],
    avoid: [
      {
        id: "gpt-6.1-sol",
        note: "OpenAI only supports tool calling for this model through its Responses API. Zipr uses Chat Completions, so Check and save refuses it.",
      },
      {
        id: "gpt-6-luna",
        note: "Calls tools through Chat Completions only with a setting Zipr doesn't send, so Check and save refuses it.",
      },
    ],
    sources: [
      { label: "OpenAI API quickstart", url: "https://developers.openai.com/api/docs/quickstart" },
      { label: "OpenAI models", url: "https://developers.openai.com/api/docs/models" },
      {
        label: "GPT-6 Astra model page",
        url: "https://developers.openai.com/api/docs/models/gpt-6-astra",
      },
      {
        label: "Managing billing for ChatGPT and the API platform",
        url: "https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform",
      },
    ],
  },
];

/** What changed on this page, newest first. */
export const ZAP_SETUP_HISTORY: { date: string; summary: string }[] = [
  { date: "2026-10-05", summary: "First published, covering Claude and OpenAI." },
];

/** The most recent date anything on the page was checked. */
export const zapSetupUpdated = () =>
  [ZAP_SETUP_WRITTEN, ...ZAP_SETUP_PROVIDERS.map((p) => p.checked)].sort().at(-1)!;
