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
 * Zap: describing an item instead of building it.
 *
 * The reader has seen a hundred "AI that does it for you" pages and trusts
 * none of them, so this one leads with what Zap will not do. The pitch is the
 * speed; the argument is the restraint — it builds, you run — and the page
 * spends most of its length on the second, because that is the part a
 * sceptical reader is checking for.
 *
 * Every line is true of the app as built. The source for each is the client's
 * `docs/architecture/zap.md`: what the model may change, what a test proves,
 * what leaves the machine, and who decides whether Zap is on.
 */

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
  "The list of step types Zipr can run, and your operating system",
  "The plugins Zap is allowed to use",
  "The results of your tests",
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
              Say what you want done. <em>Zap</em> builds it.
            </>
          }
          lede="Describe a routine in plain words and Zap turns it into a Zipr item you can read, test and change. Nothing runs, and nothing is saved, until you say so."
        />
        <Screenshot id="zap" eager class="mx-auto mt-4 max-w-5xl" />
      </Container>
    </Section>

    {/* ================= HOW IT WORKS ================= */}
    <Section tone="muted">
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
    <Section>
      <Container size="wide">
        <SectionHeading
          eyebrow="Why it's different"
          title={
            <>
              It builds. <em>You</em> run.
            </>
          }
          lede="An assistant that can act on your computer is only as good as the line it won't cross. Zap's is drawn in the app, not in a prompt."
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
    <Section tone="muted">
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
    <Section>
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
    <Section tone="muted">
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
      title="Describe your first item today."
      body="Zap is in the app. Download Zipr, connect a model, and say what you want done."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/features", label: "See everything Zipr does" }}
    />
  </Page>
);
