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
  Screenshot,
} from "@views/components/Ui";

interface Translation {
  say: string;
  steps: { name: string; code: string }[];
  note: string;
  audience: "everyday" | "power";
}

/**
 * Zap turns a plain-language request into an editable Zipr shortcut draft.
 *
 * Page principles:
 * - Show the product experience before explaining the implementation.
 * - Use concrete examples without pretending previews are installed shortcuts.
 * - Distinguish starting a command from verifying its outcome.
 * - Make user control and data boundaries easy to find.
 * - Keep technical depth available without making it the entry point.
 */

const EXAMPLES: Translation[] = [
  {
    audience: "everyday",
    say: "Email my manager that I'm off sick today.",
    steps: [
      {
        name: "Prepare an email",
        code: "mailto:sam@example.com?subject=Off%20sick%20today&body=Hi%20Sam%2C%20I'm%20unwell%20today…",
      },
    ],
    note: "Zap can prepare the mail link for you. Your email app opens with the details filled in; you review it and decide whether to send.",
  },
  {
    audience: "everyday",
    say: "Ask which client I'm working with, then open their workspace.",
    steps: [
      {
        name: "Ask you to choose",
        code: "Acme · Globex · Initech",
      },
      {
        name: "Open the matching client page",
        code: "https://crm.example.com/clients/{{ selected client }}",
      },
      {
        name: "Open the matching folder",
        code: "\\\\files\\clients\\{{ selected client }}",
      },
    ],
    note: "This illustrates the intended shortcut. The prompt value and the later steps must be configured to use the same selection in the actual shortcut.",
  },
  {
    audience: "everyday",
    say: "Give me a standard out-of-office reply I can paste anywhere.",
    steps: [
      {
        name: "Copy a prepared reply",
        code: "Thanks for your email — I'm away until Monday and will reply then.",
      },
    ],
    note: "A small shortcut can be useful when you repeat the same task every week.",
  },
  {
    audience: "power",
    say: "Help me troubleshoot a DNS issue on this computer.",
    steps: [
      {
        name: "Windows command",
        code: "ipconfig /flushdns",
      },
      {
        name: "macOS command",
        code: "dscacheutil -flushcache",
      },
    ],
    note: "These are platform-specific examples, not commands to run together. A real shortcut needs to select the appropriate command for the operating system.",
  },
  {
    audience: "power",
    say: "Ask which project I'm working on, then open it in VS Code.",
    steps: [
      {
        name: "Choose a project",
        code: "atlas · beacon · comet",
      },
      {
        name: "Open the project folder",
        code: "code C:\\Projects\\{{ selected project }}",
      },
    ],
    note: "The selected value can be used by a later step when the shortcut is configured to pass it through. The command and path must match your environment.",
  },
  {
    audience: "power",
    say: "Restart the Windows print spooler.",
    steps: [
      {
        name: "Restart the service",
        code: "powershell -Command Restart-Service Spooler",
      },
    ],
    note: "This operation may require administrator rights. Review the command and use an appropriate confirmation step before running it.",
  },
];

const TranslationCard: FC<{ example: Translation }> = ({ example }) => (
  <Card lift class="flex h-full flex-col p-6">
    <p class="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
      The request
    </p>

    <p class="mt-2 font-display text-xl leading-snug text-balance">“{example.say}”</p>

    <div class="my-5 flex items-center gap-3 text-muted-foreground">
      <span class="h-px flex-1 bg-border"></span>
      <span class="text-xs font-medium">A possible shortcut draft</span>
      <span class="h-px flex-1 bg-border"></span>
    </div>

    <ol class="clay-well space-y-4 rounded-[1.1rem] p-4">
      {example.steps.map((step, i) => (
        <li class="min-w-0">
          <div class="flex items-start gap-3">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background font-mono text-xs text-muted-foreground">
              {i + 1}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium">{step.name}</p>
              <code class="mt-1 block font-mono text-xs leading-relaxed text-muted-foreground wrap-anywhere">
                {step.code}
              </code>
            </div>
          </div>
        </li>
      ))}
    </ol>

    <p class="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
      {example.note}
    </p>
  </Card>
);

const HOW_IT_WORKS = [
  {
    icon: "message-square",
    title: "Describe the task",
    body: "Explain what you want to happen, what information to ask for and what should open or run. You can request changes in the same conversation.",
  },
  {
    icon: "workflow",
    title: "Review the draft",
    body: "Zap proposes a sequence of steps Zipr supports. Inspect the order, settings and commands, and review any assumptions before keeping the shortcut.",
  },
  {
    icon: "play",
    title: "Test it yourself",
    body: "Run the draft using Test. Check what happened on your computer, make changes if needed, then save the shortcut when you're satisfied.",
  },
];

const TRUST_POINTS = [
  {
    icon: "hand",
    title: "You stay in control",
    body: "Zap builds and changes a draft. It cannot press Test or run the shortcut for you. You decide when to execute the steps.",
  },
  {
    icon: "circle-check",
    title: "Testing is tied to the draft",
    body: "A draft is marked tested only while the latest test corresponds to the version you're viewing. Change the draft and it needs another test.",
  },
  {
    icon: "terminal",
    title: "A started command isn't a success report",
    body: "Zipr starts commands without waiting for them to finish. A test can establish that a command started, not that the intended task succeeded.",
  },
  {
    icon: "shield-alert",
    title: "Understand risky steps",
    body: "The app evaluates the step itself to identify actions such as running a program or using administrator rights. Review the warning and consider adding confirmation where appropriate.",
  },
  {
    icon: "history",
    title: "Changes are reviewable",
    body: "Zap tracks numbered revisions. You can inspect changes, including removed steps, and restore an earlier version when needed.",
  },
  {
    icon: "layers",
    title: "Built around supported steps",
    body: "Zap works with the steps Zipr exposes and their accepted settings. The resulting draft should use real supported actions, not invented capabilities.",
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
  "Your other shortcuts, catalogues and workspaces",
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
    a: "Zap itself cannot press Test or run the shortcut. When you choose to test or run a shortcut, its configured steps execute. Review commands and permissions, and add confirmation steps when appropriate.",
  },
  {
    q: "Does a successful test prove the task worked?",
    a: "Not necessarily. Zipr starts a command without waiting for it to finish, so a test may show that the command started without proving its final result. Check the output and the actual outcome when a task matters.",
  },
  {
    q: "What happens when I save a shortcut?",
    a: "It becomes an ordinary shortcut in your own workspace, without a link back to the Zap conversation. You can edit, run or share it like other shortcuts you've created.",
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

export const ZapPage: FC = () => {
  const everyday = EXAMPLES.filter((example) => example.audience === "everyday");
  const power = EXAMPLES.filter((example) => example.audience === "power");

  return (
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
                Your idea, translated into <em>action.</em>
              </>
            }
            lede="Describe the task in plain language. Zap helps turn it into a Zipr shortcut draft you can inspect, test and save — with you in control at every step."
          />

          <div class="mx-auto mt-8 max-w-5xl">
            <Screenshot id="zap" eager class="mx-auto" />
          </div>

          <div class="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
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

      {/* SHOW THE EXPERIENCE */}
      <Section tone="muted">
        <Container size="wide">
          <SectionHeading
            eyebrow="From words to shortcut"
            title="Start with the task, not the syntax."
            lede="You shouldn't need to know which command, link or sequence of steps a task requires before you can start building a shortcut."
          />

          <div class="grid gap-5 md:grid-cols-3">
            {everyday.map((example) => (
              <TranslationCard example={example} />
            ))}
          </div>

          <p class="mx-auto mt-5 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
            These are illustrative previews of possible shortcut drafts, not prebuilt shortcuts. The
            steps, values and integrations must be configured for your environment.
          </p>
        </Container>
      </Section>

      {/* FOR POWER USERS */}
      <Section>
        <Container size="wide">
          <SectionHeading
            eyebrow="More than simple automation"
            title="For the shortcuts that need a little more."
            lede="When a task calls for commands, platform-specific behaviour or system-level actions, Zap can help assemble the steps — and show you what it proposes."
          />

          <div class="grid gap-5 md:grid-cols-3">
            {power.map((example) => (
              <TranslationCard example={example} />
            ))}
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
        body="Download Zipr, connect a supported model and describe the shortcut you want to build. Review it, test it and decide when it's ready to save."
        primary={{ href: "/downloads", label: "Download Zipr" }}
        secondary={{ href: "/features", label: "Explore Zipr" }}
      />
    </Page>
  );
};
