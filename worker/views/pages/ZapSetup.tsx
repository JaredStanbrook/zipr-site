import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import {
  ZAP_SETUP_HISTORY,
  ZAP_SETUP_PROVIDERS,
  ZAP_SETUP_WRITTEN,
  zapSetupUpdated,
  type SetupProvider,
} from "@server/content/zapSetup";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  CheckItem,
  Disclosure,
  LinkButton,
} from "@views/components/Ui";
import { formatDateShort } from "@views/lib/utils";

/**
 * How to connect Zap to Claude or ChatGPT with your own key.
 *
 * The facts live in `content/zapSetup.ts`, each provider with the date its
 * steps were last checked; this file only lays them out. The dates are shown
 * prominently on purpose: the steps describe other companies' websites, which
 * change without notice, and a reader deserves to know how fresh they are.
 */

/**
 * Each question paraphrases a message the app shows at Check and save: its own
 * (no tool call, no keychain) or the provider's, which the app passes on.
 */
export const ZAP_SETUP_FAQ = [
  {
    q: "Check and save says the provider refused the request (401)",
    a: "The key wasn't accepted. Check it was copied whole, with nothing before or after it, and that it hasn't been deleted or expired at the provider. If in doubt, create a new key and paste that.",
  },
  {
    q: "It says the provider refused the request because of credit, quota or billing",
    a: "The account has no credit left, or no payment method. Add credit in the provider's billing settings, wait a minute, and press Check and save again.",
  },
  {
    q: "It says the model answered without calling a tool",
    a: "Zap needs a model that can call tools, and checks for it before saving. Use one of the models listed for your provider on this page, typed exactly as shown.",
  },
  {
    q: "It says the model doesn't exist, or wasn't found",
    a: "Model names must be typed exactly, in lower case, with the hyphens. Copy one from this page. Providers also retire models over time; if a listed one has gone, the provider's models page names its replacement.",
  },
  {
    q: "It says this computer has no keychain",
    a: "Linux has no system keychain, and Zipr won't write a key to disk. On Linux, use Zap through your organisation's Zipr server instead of a personal key.",
  },
];

const Checked: FC<{ date: string; app: AppConfig; label: string }> = ({ date, app, label }) => (
  <>
    {label} <time datetime={date}>{formatDateShort(date, app.locale)}</time>
  </>
);

const Code: FC<{ children?: string }> = ({ children }) => (
  <code class="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
    {children}
  </code>
);

const NumberedSteps: FC<{ steps: { title: string; body: unknown }[] }> = ({ steps }) => (
  <ol class="space-y-5">
    {steps.map((step, i) => (
      <li class="flex gap-4">
        <span
          class="clay-raised flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-sm font-bold text-primary-subtle-foreground tabular"
          aria-hidden="true"
        >
          {i + 1}
        </span>
        <div class="min-w-0">
          <h4 class="font-semibold">{step.title}</h4>
          <p class="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{step.body}</p>
        </div>
      </li>
    ))}
  </ol>
);

/** The app's side, which is the same for every provider bar two fields. */
const inZipr = (provider: SetupProvider) => [
  {
    title: "Open Zap in Zipr",
    body: "Choose Zap in the sidebar and find the card called Your model connection.",
  },
  {
    title: `Set Provider to ${provider.appProvider}`,
    body: "Leave Base URL empty. It's only for a model running on your own computer or another OpenAI-compatible service.",
  },
  {
    title: "Type the model name",
    body: (
      <>
        In Model, type <Code>{provider.models[0].id}</Code>, or another model from the list below,
        exactly as written.
      </>
    ),
  },
  {
    title: "Paste the key and press Check and save",
    body: "Zipr sends one small request asking the model to call a tool. If it does, the key is saved to your operating system's keychain and is never shown again. If not, the message says why — see Troubleshooting below.",
  },
];

const ProviderSection: FC<{ provider: SetupProvider; app: AppConfig; muted: boolean }> = ({
  provider,
  app,
  muted,
}) => (
  <Section id={provider.id} tone={muted ? "muted" : "default"}>
    <Container size="prose">
      <SectionHeading
        eyebrow={provider.name}
        title={`${provider.product}: connect with an API key`}
      />
      <p class="-mt-6 text-sm text-muted-foreground">
        <Checked date={provider.checked} app={app} label="Steps last checked" /> against{" "}
        {provider.name}'s own pages
      </p>

      <Card tone="well" class="mt-8 flex gap-3 p-5">
        <i data-lucide="info" class="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true"></i>
        <p class="text-sm leading-relaxed text-pretty">{provider.notIncluded}</p>
      </Card>

      <h3 class="mt-10 text-xl">In the {provider.console.label}</h3>
      <div class="mt-5">
        <NumberedSteps steps={provider.steps} />
      </div>
      <p class="mt-6">
        <LinkButton href={provider.console.url} variant="outline">
          Open the {provider.console.label}
        </LinkButton>
      </p>

      <h3 class="mt-12 text-xl">In Zipr</h3>
      <div class="mt-5">
        <NumberedSteps steps={inZipr(provider)} />
      </div>

      <h3 class="mt-12 text-xl">Which model</h3>
      <ul class="mt-5 space-y-3">
        {provider.models.map((model) => (
          <li class="flex gap-3">
            <i
              data-lucide="circle-check"
              class="mt-0.5 h-5 w-5 shrink-0 text-success"
              aria-hidden="true"
            ></i>
            <span class="text-sm leading-relaxed">
              <Code>{model.id}</Code> — <span class="text-muted-foreground">{model.note}</span>
            </span>
          </li>
        ))}
        {provider.avoid.map((model) => (
          <li class="flex gap-3">
            <i
              data-lucide="circle-x"
              class="mt-0.5 h-5 w-5 shrink-0 text-destructive"
              aria-hidden="true"
            ></i>
            <span class="text-sm leading-relaxed">
              <span class="sr-only">Doesn't work: </span>
              <Code>{model.id}</Code> — <span class="text-muted-foreground">{model.note}</span>
            </span>
          </li>
        ))}
      </ul>

      <h3 class="mt-12 text-base font-semibold">Where these steps come from</h3>
      <ul class="mt-3 space-y-1.5 text-sm">
        {provider.sources.map((source) => (
          <li>
            <a
              href={source.url}
              rel="noopener"
              class="text-primary underline-offset-4 hover:underline"
            >
              {source.label}
            </a>
          </li>
        ))}
      </ul>
    </Container>
  </Section>
);

export const ZapSetupPage: FC<{ app: AppConfig }> = ({ app }) => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container size="prose">
        <SectionHeading
          as="h1"
          eyebrow="Zap setup"
          title="Connect Zap to Claude or ChatGPT"
          lede="Zap uses an AI model you choose, with your own key. Getting one takes about five minutes at the provider, then a minute in Zipr."
        />
        <p class="-mt-6 text-sm text-muted-foreground">
          <Checked date={ZAP_SETUP_WRITTEN} app={app} label="Written" /> ·{" "}
          <Checked date={zapSetupUpdated()} app={app} label="Last updated" />
        </p>

        <Card tone="well" class="mt-8 flex gap-3 p-5">
          <i
            data-lucide="triangle-alert"
            class="mt-0.5 h-5 w-5 shrink-0 text-warning"
            aria-hidden="true"
          ></i>
          <p class="text-sm leading-relaxed text-pretty">
            These steps describe Anthropic's and OpenAI's websites, which change often. Each section
            says when it was last checked. If what you see doesn't match, the provider's own page,
            linked at the end of each section, is right and this one is out of date.
          </p>
        </Card>

        <Card class="mt-10 p-7">
          <h2 class="text-lg font-bold">Before you start</h2>
          <ul class="mt-4 space-y-3">
            <CheckItem>
              <strong>Your organisation may have done this already.</strong> If Zap offers "New
              draft through your deployment", you can use it without a key of your own.
            </CheckItem>
            <CheckItem>
              <strong>A chat subscription isn't an API key.</strong> ChatGPT Plus and Claude Pro or
              Max don't include API use. You pay the provider separately, per use, from credit you
              add.
            </CheckItem>
            <CheckItem>
              <strong>Zipr doesn't charge for Zap or see your bill.</strong> The provider bills you
              directly. Your key goes from Zipr to them and nowhere else.
            </CheckItem>
            <CheckItem>
              <strong>On Linux, use your organisation's server.</strong> Linux has no keychain to
              keep a personal key in, so Zipr won't store one there.
            </CheckItem>
          </ul>
        </Card>

        <nav aria-label="Providers" class="mt-10 flex flex-wrap gap-3">
          {ZAP_SETUP_PROVIDERS.map((provider) => (
            <LinkButton href={`#${provider.id}`} variant="primary">
              {provider.product} ({provider.name})
            </LinkButton>
          ))}
        </nav>
      </Container>
    </Section>

    {ZAP_SETUP_PROVIDERS.map((provider, i) => (
      <ProviderSection provider={provider} app={app} muted={i % 2 === 0} />
    ))}

    <Section id="troubleshooting">
      <Container size="prose">
        <SectionHeading eyebrow="If it doesn't work" title="Troubleshooting" />
        <div>
          {ZAP_SETUP_FAQ.map((item) => (
            <Disclosure question={item.q}>{item.a}</Disclosure>
          ))}
        </div>
      </Container>
    </Section>

    <Section tone="muted">
      <Container size="prose">
        <SectionHeading eyebrow="Afterwards" title="Looking after your key" />
        <ul class="space-y-3">
          <CheckItem>
            Set a monthly spending limit at the provider, so a busy month can't surprise you.
          </CheckItem>
          <CheckItem>
            Use a separate key for each computer. If one is lost, delete that key at the provider
            and the others keep working.
          </CheckItem>
          <CheckItem>
            To stop using a key, press Remove in Zipr's model connection card, then delete the key
            at the provider.
          </CheckItem>
          <CheckItem>
            What Zap sends to the model, and what it never sends, is listed on the{" "}
            <a href="/zap" class="text-primary underline-offset-4 hover:underline">
              Zap page
            </a>
            .
          </CheckItem>
        </ul>

        <h2 class="mt-14 text-lg font-bold">Changes to this page</h2>
        <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
          {ZAP_SETUP_HISTORY.map((entry) => (
            <li>
              <time datetime={entry.date}>{formatDateShort(entry.date, app.locale)}</time> —{" "}
              {entry.summary}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  </Page>
);
