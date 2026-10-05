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

/**
 * Zap: the translator between an idea and the computer.
 *
 * The pitch is the gap Zap closes. A person knows what they want — "email my
 * manager that I'm off sick" — and the computer needs something they have
 * never heard of — a `mailto:` link with the subject and body filled in. Zap
 * knows the second half. So the page leads with translations: the words a
 * person says beside the steps Zap builds, with the computer's language shown
 * in code so the reader sees exactly what they were spared.
 *
 * Two audiences on purpose. The everyday examples are for someone who has
 * never opened a terminal; the second set are for someone who lives in one,
 * and are there to impress them. Then, because an assistant that writes
 * commands is only welcome if it can be trusted, the restraint: it builds,
 * you run.
 *
 * The examples are all things Zap can build as the app stands. Each command
 * is one program with its arguments, and none depends on another finishing,
 * because Zipr starts a command without waiting for it.
 *
 * Every line is true of the app as built. The source for each is the client's
 * `docs/architecture/zap.md`: what the model may change, what a test proves,
 * what leaves the machine, and who decides whether Zap is on.
 */

interface Translation {
  say: string;
  steps: { name: string; code: string }[];
  note: string;
}

/** For someone who has never needed to know how any of it works. */
const EVERYDAY: Translation[] = [
  {
    say: "Email my manager that I'm off sick today.",
    steps: [
      {
        name: "Write the email, addressed and ready to send",
        code: "mailto:sam@example.com?subject=Off%20sick%20today&body=Hi%20Sam%2C%20I%27m%20unwell%20today…",
      },
    ],
    note: "You never had to know a mailto link exists. You click, and the email is already written, waiting for Send.",
  },
  {
    say: "Ask which client, then open their page in our CRM and their shared folder.",
    steps: [
      { name: "Ask which client", code: "Choose one: Acme · Globex · Initech" },
      { name: "Open their CRM page", code: "https://crm.example.com/clients/{{ prompt.client }}" },
      { name: "Open their shared folder", code: "\\\\files\\clients\\{{ prompt.client }}" },
    ],
    note: "One question, and the answer goes everywhere it's needed.",
  },
  {
    say: "Put my out-of-office reply on the clipboard so I can paste it anywhere.",
    steps: [
      {
        name: "Copy the reply",
        code: "Thanks for your email — I'm away until Monday and will reply then.",
      },
    ],
    note: "Small, and you'll use it every week.",
  },
];

/** For someone who lives in a terminal, and needs a reason to be impressed. */
const POWER: Translation[] = [
  {
    say: "My internet's playing up. Do whatever usually fixes it.",
    steps: [
      { name: "Flush the DNS cache — on Windows", code: "ipconfig /flushdns" },
      { name: "Flush the DNS cache — on a Mac", code: "dscacheutil -flushcache" },
    ],
    note: "One item for both platforms: each step runs only on the system it's written for.",
  },
  {
    say: "Ask which project, then open it in my editor.",
    steps: [
      { name: "Ask which project", code: "Choose one: atlas · beacon · comet" },
      { name: "Open it in VS Code", code: "code C:\\Projects\\{{ prompt.project }}" },
    ],
    note: "The answer to a question becomes part of a command.",
  },
  {
    say: "The printer's jammed again. Restart the print spooler.",
    steps: [
      {
        name: "Restart the service, as administrator",
        code: "powershell -Command Restart-Service Spooler",
      },
    ],
    note: "Zipr flags this one before you save it: it runs with administrator rights, and you'll be advised to have it ask first.",
  },
];

const TranslationCard: FC<{ example: Translation }> = ({ example }) => (
  <Card lift class="flex h-full flex-col p-6">
    <p class="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">You say</p>
    <p class="mt-2 font-display text-xl leading-snug text-balance">“{example.say}”</p>
    <p class="mt-5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-primary">Zap builds</p>
    <ol class="clay-well mt-2 space-y-3 rounded-[1.1rem] p-4">
      {example.steps.map((step, i) => (
        <li class="min-w-0">
          <p class="text-sm font-medium">
            <span class="mr-2 font-mono text-xs text-muted-foreground tabular">{i + 1}</span>
            {step.name}
          </p>
          <code class="mt-1 block font-mono text-xs leading-relaxed text-muted-foreground wrap-anywhere">
            {step.code}
          </code>
        </li>
      ))}
    </ol>
    <p class="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty">{example.note}</p>
  </Card>
);

const STEPS = [
  {
    icon: "send",
    title: "Describe it",
    body: "Write it the way you'd explain it to a colleague: what you open, in what order, what you'd be asked. Ask for changes the same way.",
  },
  {
    icon: "zap",
    title: "Zap builds it",
    body: "It assembles an item from Zipr's own step types, and tells you anything it had to assume — an address it guessed, a choice it made for you.",
  },
  {
    icon: "play",
    title: "You test it, then save",
    body: "Test runs it on your computer exactly as launching it would. Happy? Save it to a catalogue. Not yet? Keep talking, or go back to any earlier version.",
  },
];

const PROMISES = [
  {
    icon: "shield",
    title: "It never runs anything",
    body: "Zap can build and change an item. Only you can run it: Test is your button, and Zap has no way to press it.",
  },
  {
    icon: "circle-check",
    title: "Tested means tested",
    body: "A draft shows as tested only while your latest test ran the version on screen. Change one step and it's untested again.",
  },
  {
    icon: "terminal",
    title: "Honest about what it knows",
    body: "Zipr starts a command without waiting for it, so a test says the command started — never that it worked. Zap is told exactly that, and says so.",
  },
  {
    icon: "triangle-alert",
    title: "Risk is worked out, not guessed",
    body: "Whether a step opens something, asks a question, runs a program or acts as another account is decided by the app from the step itself — never by the AI. When it matters, you're advised to have the item ask before it runs.",
  },
  {
    icon: "history",
    title: "Nothing disappears quietly",
    body: "Every change Zap makes is a numbered revision. A step it removes is shown to you, and putting it back is one click.",
  },
  {
    icon: "layers",
    title: "Only steps that really run",
    body: "Zap can only use the step types Zipr runs, with the settings each one accepts. It can't write a step that would be saved and then silently ignored.",
  },
];

const SENT = [
  "Your conversation with Zap",
  "The item being built",
  "The list of step types Zipr can run",
  "Your operating system, its version, your processor type and the app's language",
  "The plugins Zap is allowed to use",
  "The results of your tests",
  "Whether one program, app or link type Zap asked about is installed — yes or no, shown to you in the chat — unless your organisation turns this off",
];

const NEVER_SENT = [
  "Any password, key or other credential",
  "Your other items, catalogues and workspaces",
  "Files, your clipboard, environment or launch history",
  "What you typed into a question an item asked",
  "Which account a sign-in step used",
];

export const ZAP_FAQ = [
  {
    q: "Do I need to understand the technical side?",
    a: "No. Say what you want and Zap works out how. Every step it builds is shown in plain words, with its settings underneath for anyone who wants to look, and you can change any of them yourself.",
  },
  {
    q: "Will it really use the command line?",
    a: "When that's the best way to do what you asked, yes — including steps that only run on Windows or only on a Mac, and programs that need administrator rights. Anything that runs a program is marked as such before you save it, and you're advised to have the item ask before it runs.",
  },
  {
    q: "Can Zap run things on my computer?",
    a: "No. Zap only changes the draft it's building. A test is something you press, and it runs exactly what launching the item would — including asking you first, if the item is set to ask.",
  },
  {
    q: "What happens to the item once I save it?",
    a: "It becomes an ordinary item in your own workspace, with no link back to the conversation. Edit it, launch it, or share it with your team like anything else you've built.",
  },
  {
    q: "Which AI models does it work with?",
    a: "Anthropic, OpenAI and Google Gemini, or any OpenAI-compatible endpoint — including a model running on your own machine. The model has to support tool calling; Zipr checks that when you connect it, so a key that won't work is refused then rather than halfway through a draft.",
  },
  {
    q: "Where is my API key kept?",
    a: "In your operating system's keychain, and nowhere else. The app's own screens never see it. Linux has no keychain, so on Linux Zap works through a team server instead of a personal key.",
  },
  {
    q: "Can my organisation control it?",
    a: "Yes. On computers your organisation manages, an administrator can leave the choice to you, allow only the team server, or turn Zap off. Turning it off keeps any drafts in progress; it just stops new conversations.",
  },
  {
    q: "Does Zap keep a record of what I asked?",
    a: "Your drafts are stored on your computer until you save or discard them. The app logs no prompt and no reply.",
  },
];

export const ZapPage: FC = () => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container>
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Zap"
          title={
            <>
              You have the idea. Zap speaks <em>computer</em>.
            </>
          }
          lede="Say what you want in your own words. Zap works out how your computer actually does it — the right link, the right command, the right order — and turns it into one click you test before you keep."
        />
        <Screenshot id="zap" eager class="mx-auto mt-4 max-w-5xl" />
      </Container>
    </Section>

    {/* ================= TRANSLATIONS ================= */}
    <Section tone="muted">
      <Container size="wide">
        <SectionHeading
          eyebrow="From idea to action"
          title="Everyday words in. Working steps out."
          lede="Most good ideas stall on a detail nobody told you: that an email can be written by a link, which command clears a cache, how to carry an answer from one step to the next. That part is what Zap knows."
        />

        <div class="mb-6 max-w-2xl">
          <h3 class="text-2xl">For everyone</h3>
          <p class="mt-1 leading-relaxed text-muted-foreground text-pretty">
            You don't need to know how it works. You only need to know what you want.
          </p>
        </div>
        <div class="grid gap-5 md:grid-cols-3">
          {EVERYDAY.map((example) => (
            <TranslationCard example={example} />
          ))}
        </div>

        <div class="mb-6 mt-16 max-w-2xl">
          <h3 class="text-2xl">For the ones who live in a terminal</h3>
          <p class="mt-1 leading-relaxed text-muted-foreground text-pretty">
            And if you do know how it works, Zap reaches for the command line, per-platform steps
            and administrator rights when that's the way to get it done.
          </p>
        </div>
        <div class="grid gap-5 md:grid-cols-3">
          {POWER.map((example) => (
            <TranslationCard example={example} />
          ))}
        </div>
      </Container>
    </Section>

    {/* ================= HOW IT WORKS ================= */}
    <Section>
      <Container size="wide">
        <SectionHeading
          eyebrow="How it works"
          title="A conversation, then a working item"
          lede="The same item you'd have built by hand — in the time it takes to describe it."
        />
        <ol class="grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
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

    {/* ================= THE PROMISES ================= */}
    <Section tone="muted">
      <Container size="wide">
        <SectionHeading
          eyebrow="Why it's different"
          title={
            <>
              It builds. <em>You</em> run.
            </>
          }
          lede="Something that can write commands for your computer is only welcome if you can trust it. Zap's limits are drawn in the app, not in a prompt."
        />
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROMISES.map((promise) => (
            <Card lift class="flex h-full flex-col p-7">
              <IconTile icon={promise.icon} tone="brand" />
              <h3 class="mt-5 text-xl leading-snug text-balance">{promise.title}</h3>
              <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                {promise.body}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* ================= WHAT LEAVES THE MACHINE ================= */}
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Your data"
          title="Exactly what the AI sees"
          lede="Zap needs to know what it's building. It doesn't need to know anything else, so it isn't told."
        />
        <div class="grid gap-5 md:grid-cols-2">
          <Card class="p-7">
            <h3 class="text-xl">Sent to the model</h3>
            <ul class="mt-5 space-y-3">
              {SENT.map((line) => (
                <CheckItem>{line}</CheckItem>
              ))}
            </ul>
          </Card>
          <Card class="p-7">
            <h3 class="text-xl">Never sent</h3>
            <ul class="mt-5 space-y-3">
              {NEVER_SENT.map((line) => (
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
      </Container>
    </Section>

    {/* ================= WHOSE AI ================= */}
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Your AI, or your team's"
          title="Bring your own model"
          lede="Zap works with the AI provider you already use, or with the one your organisation has set up."
        />
        <div class="grid gap-5 md:grid-cols-2">
          <Card lift class="flex h-full flex-col p-7">
            <IconTile icon="key-round" tone="brand" />
            <h3 class="mt-5 text-xl">Your own key</h3>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              Connect Anthropic, OpenAI, Google Gemini or any OpenAI-compatible endpoint — including
              a model on your own machine. The key stays in your operating system's keychain, and
              the app's screens never see it.
            </p>
            <p class="mt-4 text-sm">
              <a
                href="/zap/setup"
                class="font-semibold text-primary underline-offset-4 hover:underline"
              >
                How to get a key from Claude or ChatGPT
              </a>
            </p>
          </Card>
          <Card lift class="flex h-full flex-col p-7">
            <IconTile icon="server" tone="primary" />
            <h3 class="mt-5 text-xl">Your team's server</h3>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              A Zipr team server can offer Zap with the organisation's own key and an access list,
              so nobody needs a key of their own. Administrators decide who can use it.
            </p>
          </Card>
        </div>
      </Container>
    </Section>

    {/* ================= FAQ ================= */}
    <Section>
      <Container size="prose">
        <SectionHeading align="center" eyebrow="Questions" title="Asked and answered" />
        <div>
          {ZAP_FAQ.map((item) => (
            <Disclosure question={item.q}>{item.a}</Disclosure>
          ))}
        </div>
      </Container>
    </Section>

    <CtaBand
      title="Bring an idea. Leave with a button."
      body="Zap is in the app. Download Zipr, connect a model, and tell it the idea."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/features", label: "See everything Zipr does" }}
    />
  </Page>
);
