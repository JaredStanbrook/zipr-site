import type { FC } from "hono/jsx";

import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  IconTile,
  CheckItem,
  CtaBand,
  Disclosure,
  Eyebrow,
  Screenshot,
} from "@views/components/Ui";

/**
 * Zap turns a plain-language request into an editable Zipr shortcut draft.
 *
 * Page principles:
 * - Show Zap at work rather than describe it: two real conversations, one
 *   everyday and one that uses the whole set of steps, each as a picture.
 * - Name what Zap builds with — the step categories — not example commands.
 * - Make user control and data boundaries easy to find.
 * - Keep technical depth available without making it the entry point.
 *
 * Every claim is one the app makes good: Zap only adds steps the registry
 * has, checks whether an app or command is installed, lists its assumptions,
 * and cannot test or run anything; steps that run a program, send something
 * off the computer or use a plugin need allowing first; and only opening an
 * app is reported as started rather than finished.
 */

/** The step categories Zap builds with, as the editor's action search names them. */
const STEP_KINDS = [
  { icon: "folder", label: "Files & folders" },
  { icon: "type", label: "Text & clipboard" },
  { icon: "list", label: "Lists & data" },
  { icon: "calendar", label: "Dates & numbers" },
  { icon: "globe", label: "Web requests" },
  { icon: "sparkles", label: "AI" },
  { icon: "message-square", label: "Questions & menus" },
  { icon: "git-branch", label: "If, Repeat & loops" },
  { icon: "terminal", label: "Scripts & apps" },
  { icon: "bell", label: "Notifications" },
];

const WORDS_POINTS = [
  "Every step is one Zipr really has, with settings it accepts",
  "Ask for a change in a sentence, and every revision is kept",
  "What Zap assumed is listed beside the draft, to correct",
];

const MORE_POINTS = [
  "Run a script, call a web service, and branch on what comes back",
  "Paths nest as deep as the task needs: If, menus and loops",
  "Checks the apps and commands it relies on are installed",
];

const HOW_IT_WORKS = [
  {
    icon: "message-square",
    title: "Describe the task",
    body: "Say what should happen in your own words, and ask for changes in the same conversation.",
  },
  {
    icon: "workflow",
    title: "Review the draft",
    body: "Read each step in plain language, with its settings and Zap's assumptions beside it.",
  },
  {
    icon: "play",
    title: "Test it yourself",
    body: "Run the draft for real with Test, then save it as an ordinary shortcut.",
  },
];

const TRUST_POINTS = [
  {
    icon: "hand",
    title: "You stay in control",
    body: "Zap builds and changes a draft. It cannot press Test or run the shortcut for you.",
  },
  {
    icon: "shield-alert",
    title: "Risky steps wait for your OK",
    body: "Steps that run a program, send something off your computer or use a plugin are listed before a test. Allow them once; if Zap changes one, you're asked again.",
  },
  {
    icon: "circle-check",
    title: "Testing is tied to the draft",
    body: "A draft counts as tested only while its latest test ran on the version you're viewing.",
  },
  {
    icon: "terminal",
    title: "Started isn't finished",
    body: "Scripts, web requests and file steps report what happened. Opening an app only reports that it started, and the test says so.",
  },
  {
    icon: "history",
    title: "Changes are reviewable",
    body: "Every revision is numbered, removed steps are shown, and an earlier version can be restored.",
  },
  {
    icon: "layers",
    title: "Real steps only",
    body: "Zap can only add steps this computer and your organisation allow, and every change is checked the way a save is.",
  },
];

const SENT_TO_MODEL = [
  "Your conversation with Zap",
  "The shortcut draft being built",
  "The list of steps Zipr can run",
  "Your operating system, version, processor type and app language",
  "The plugins Zap is allowed to use",
  "The results of your tests",
  "Whether an app or program is installed — yes or no, unless your organisation disables this check",
];

const NOT_SENT_TO_MODEL = [
  "Passwords, API keys and other credentials",
  "Your other shortcuts, groups and teams",
  "Files, clipboard contents, environment variables and launch history",
  "The answers you enter into questions asked by a shortcut",
  "Which account a sign-in step used",
];

const MODEL_OPTIONS = [
  {
    icon: "key-round",
    title: "Use your own provider",
    body: "Connect Anthropic, OpenAI, Google Gemini or an OpenAI-compatible endpoint, including a compatible model running on your own machine. The model must support tool calling.",
    detail:
      "Your API key is stored in your operating system's keychain. The app's own screens do not see the key.",
    link: {
      href: "/zap/setup",
      label: "Read the setup guide",
    },
  },
  {
    icon: "server",
    title: "Use your team's server",
    body: "A Zipr team server can provide Zap using the organisation's configured key and access list. Team members can use the service without each supplying a personal key.",
    detail: "Administrators control who can use the team service and which options are available.",
  },
];

export const ZAP_FAQ = [
  {
    q: "Do I need to understand commands or code?",
    a: "No. Start by describing the task in your own words. Zap proposes the steps and shows their settings so you can review them. Some shortcuts involve commands or configuration, so inspect those carefully before running them.",
  },
  {
    q: "Does Zap create a finished shortcut automatically?",
    a: "Zap creates and edits a draft. You review it, test it yourself and save it when you're satisfied. A draft is not the same thing as a verified result.",
  },
  {
    q: "Can Zap run commands on my computer without asking?",
    a: "No. Zap cannot press Test or run the shortcut. A step that runs a program, sends something off your computer or uses a plugin must be allowed by you before the draft can be tested or saved.",
  },
  {
    q: "Does a successful test prove the task worked?",
    a: "Mostly. Scripts, web requests and file steps report what actually happened. Opening an app only reports that it started, so check the outcome yourself when a task matters.",
  },
  {
    q: "What happens when I save a shortcut?",
    a: "It becomes an ordinary personal shortcut, without a link back to the Zap conversation. You can edit, run or share it like other shortcuts you've created.",
  },
  {
    q: "Which AI providers are supported?",
    a: "Zap supports Anthropic, OpenAI, Google Gemini and OpenAI-compatible endpoints, including compatible models hosted locally. The model must support tool calling, and Zipr checks compatibility when you connect it.",
  },
  {
    q: "Where is my API key stored?",
    a: "Your key is stored in your operating system's keychain. On Linux, where Zipr does not use a system keychain for this purpose, Zap works through a team server rather than a personal API key.",
  },
  {
    q: "Can my organisation restrict Zap?",
    a: "Yes. On organisation-managed computers, an administrator can leave the choice to the user, require the team server, or turn Zap off. Turning it off preserves drafts already in progress but prevents new conversations.",
  },
  {
    q: "Does Zap keep a record of my conversation?",
    a: "Drafts are stored on your computer until you save or discard them. The app does not log prompts or replies. The information sent to your chosen model is described in the data section above.",
  },
];

export const ZapPage: FC = () => (
  <Page>
    {/* HERO */}
    <Section class="pt-12 sm:pt-20">
      <Container>
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Meet Zap"
          title={
            <>
              Describe it. <em>Zap builds it.</em>
            </>
          }
          lede="Say what you want done in your own words. Zap builds it from every kind of step Zipr has — files, text, web requests, AI, menus, loops and branches — and you test it before anything is saved."
        />

        <div class="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
          {[
            { icon: "message-square", text: "Describe what you want" },
            { icon: "workflow", text: "Review the steps" },
            { icon: "play", text: "Test before saving" },
          ].map((item) => (
            <div class="flex items-center justify-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 text-sm font-medium">
              <IconTile icon={item.icon} tone="brand" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </Container>
    </Section>

    {/* FROM WORDS TO SHORTCUT */}
    <Section tone="muted">
      <Container size="wide">
        <div class="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div class="lg:col-span-5">
            <Eyebrow>From words to shortcut</Eyebrow>
            <h2 class="text-3xl leading-[1.08] text-balance sm:text-[2.75rem]">
              Start with the task, not the syntax.
            </h2>
            <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
              One message about a messy Downloads folder becomes a shortcut that reads dates, finds,
              moves and zips files, and only archives when there is something to archive.
            </p>
            <ul class="mt-6 space-y-3.5">
              {WORDS_POINTS.map((point) => (
                <CheckItem>{point}</CheckItem>
              ))}
            </ul>
          </div>
          <div class="lg:col-span-7">
            <Screenshot id="zap" eager />
          </div>
        </div>
      </Container>
    </Section>

    {/* MORE THAN SIMPLE AUTOMATION */}
    <Section>
      <Container size="wide">
        <div class="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div class="lg:order-2 lg:col-span-5">
            <Eyebrow>More than simple automation</Eyebrow>
            <h2 class="text-3xl leading-[1.08] text-balance sm:text-[2.75rem]">
              Scripts, AI, web requests and branches, in one shortcut.
            </h2>
            <p class="mt-5 leading-relaxed text-muted-foreground text-pretty">
              Zap reaches for whatever the idea needs. Here it reads the commits since a release,
              has an AI model write notes customers would read, then offers to copy, email or post
              them.
            </p>
            <ul class="mt-6 flex flex-wrap gap-2" aria-label="What Zap builds with">
              {STEP_KINDS.map((kind) => (
                <li class="flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 py-1 pl-2 pr-3 text-xs font-medium">
                  <i
                    data-lucide={kind.icon}
                    class="h-3.5 w-3.5 text-primary"
                    aria-hidden="true"
                  ></i>
                  {kind.label}
                </li>
              ))}
            </ul>
            <ul class="mt-6 space-y-3.5">
              {MORE_POINTS.map((point) => (
                <CheckItem>{point}</CheckItem>
              ))}
            </ul>
          </div>
          <div class="lg:order-1 lg:col-span-7">
            <Screenshot id="zap-release" />
          </div>
        </div>
      </Container>
    </Section>

    {/* PROCESS */}
    <Section tone="muted">
      <Container size="wide">
        <SectionHeading
          eyebrow="How it works"
          title="From first request to saved shortcut."
          lede="The model works out a possible solution using Zipr's available steps. You stay responsible for reviewing and running it."
        />

        <ol class="grid gap-5 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <li>
              <Card lift class="flex h-full flex-col p-7">
                <div class="flex items-center gap-4">
                  <IconTile icon={step.icon} tone="brand" />
                  <span class="font-mono text-xs font-semibold text-muted-foreground tabular">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 class="mt-5 text-2xl leading-snug text-balance">{step.title}</h3>
                <p class="mt-3 leading-relaxed text-muted-foreground text-pretty">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </Section>

    {/* TRUST */}
    <Section>
      <Container size="wide">
        <SectionHeading
          eyebrow="Built with boundaries"
          title={
            <>
              It builds. <em>You</em> run.
            </>
          }
          lede="AI-generated automation deserves clear limits. Zap's permissions and shortcut behaviour are enforced by the app, not left to a promise in the conversation."
        />

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <Card lift class="flex h-full flex-col p-7">
              <IconTile icon={point.icon} tone="brand" />
              <h3 class="mt-5 text-xl leading-snug text-balance">{point.title}</h3>
              <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {point.body}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* PRIVACY */}
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Your data"
          title="Know what the model receives."
          lede="Zap sends information needed to build and troubleshoot the shortcut. It excludes several categories of local information."
        />

        <div class="grid gap-5 md:grid-cols-2">
          <Card class="p-7">
            <div class="flex items-center gap-3">
              <IconTile icon="arrow-up-right" tone="brand" />
              <h3 class="text-xl">Sent to the model</h3>
            </div>
            <ul class="mt-5 space-y-3">
              {SENT_TO_MODEL.map((line) => (
                <CheckItem>{line}</CheckItem>
              ))}
            </ul>
          </Card>

          <Card class="p-7">
            <div class="flex items-center gap-3">
              <IconTile icon="shield-check" tone="primary" />
              <h3 class="text-xl">Not sent to the model</h3>
            </div>
            <ul class="mt-5 space-y-3">
              {NOT_SENT_TO_MODEL.map((line) => (
                <li class="flex gap-3">
                  <i
                    data-lucide="circle-x"
                    class="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  ></i>
                  <span class="text-sm leading-relaxed text-muted-foreground">{line}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <p class="mt-5 text-sm leading-relaxed text-muted-foreground">
          The model provider processes the information sent to it. Check the provider's privacy
          terms and your organisation's policies before sending sensitive work details.
        </p>
      </Container>
    </Section>

    {/* PROVIDERS */}
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Choose your model"
          title="Your AI, your choice."
          lede="Use a supported provider you already have access to, or connect through your organisation's configured service."
        />

        <div class="grid gap-5 md:grid-cols-2">
          {MODEL_OPTIONS.map((option) => (
            <Card lift class="flex h-full flex-col p-7">
              <IconTile icon={option.icon} tone="brand" />
              <h3 class="mt-5 text-xl">{option.title}</h3>
              <p class="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                {option.body}
              </p>
              <p class="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty">
                {option.detail}
              </p>
              {option.link ? (
                <p class="mt-5 text-sm">
                  <a
                    href={option.link.href}
                    class="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {option.link.label}
                  </a>
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* FAQ */}
    <Section tone="muted">
      <Container size="prose">
        <SectionHeading align="center" eyebrow="Questions" title="Before you get started." />
        <div>
          {ZAP_FAQ.map((item) => (
            <Disclosure question={item.q}>{item.a}</Disclosure>
          ))}
        </div>
      </Container>
    </Section>

    {/* CTA */}
    <CtaBand
      title="Bring your idea to Zap."
      body="Download Zipr, connect a model and describe the shortcut you want. You test it, and you decide when it's saved."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/features", label: "Explore Zipr" }}
    />
  </Page>
);
