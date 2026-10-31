import type { FC, Child } from "hono/jsx";

import { ToolboxTiles } from "@views/components/Toolbox";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Eyebrow,
  Card,
  Well,
  IconTile,
  Badge,
  CheckItem,
  LinkButton,
  ActionButton,
  EdgeShot,
  ScreenshotMarquee,
  LoopVideo,
  Disclosure,
  CtaBand,
} from "@views/components/Ui";

/**
 * The design system, as a page.
 *
 * A working mock of every rule in `index.css`, built from the same components
 * the real pages use, so it cannot drift from them: if a primitive changes,
 * this page shows the change. It is a reference for whoever builds the next
 * page, not a page for visitors, and is kept out of the sitemap and indexes.
 *
 * In order: the asymmetric hero; the three layers; type; the wells that
 * replaced the orange cards; buttons by destination, with the glow; media —
 * the marquee, edge-clipped screenshots, the looping video and the viewer;
 * the toolbox marquee; and the footer, in its well, below.
 */

const PALETTE = [
  { name: "Warm paper", hex: "#F8F6F2", role: "Layer 1 — the body", swatch: "bg-[#F8F6F2]" },
  {
    name: "Near-black",
    hex: "#242321",
    role: "Layer 3 — text, black buttons",
    swatch: "bg-[#242321]",
  },
  {
    name: "Vivid orange",
    hex: "#F36B3B",
    role: "The brand — marks and fills",
    swatch: "bg-[#F36B3B]",
  },
  {
    name: "Supporting clay",
    hex: "#B85F46",
    role: "Emphasis in headlines",
    swatch: "bg-[#B85F46]",
  },
];

/** A labelled specimen row: what the rule is, and the thing itself. */
const Rule: FC<{ name: string; note: string; children?: Child }> = ({ name, note, children }) => (
  <div class="grid gap-6 border-t border-border py-10 lg:grid-cols-12">
    <div class="lg:col-span-4">
      <h3 class="text-xl">{name}</h3>
      <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{note}</p>
    </div>
    <div class="min-w-0 lg:col-span-8">{children}</div>
  </div>
);

/** A demo surface for the buttons, labelled with the layer it represents. */
const ButtonStage: FC<{ label: string; class: string; children?: Child }> = ({
  label,
  class: className,
  children,
}) => (
  <div class={`p-6 sm:p-8 ${className}`}>
    <p class="mb-5 font-mono text-xs uppercase tracking-[0.14em] opacity-70">{label}</p>
    <div class="flex flex-wrap items-center gap-3">{children}</div>
  </div>
);

export const DesignSystemPage: FC = () => (
  <Page>
    {/* ================= 1. HERO =================
        Asymmetric: words on five columns, the app on seven and beyond the
        right-hand edge. */}
    <Section class="overflow-x-clip pt-6 sm:pt-12">
      <Container size="wide">
        <div class="grid items-center gap-12 [&>*]:min-w-0 lg:grid-cols-12 lg:gap-10">
          <div class="lg:col-span-5">
            <Eyebrow class="rise">Design system · Mock page</Eyebrow>
            <h1
              class="rise text-[2.75rem] leading-[0.98] text-balance sm:text-7xl lg:text-[4.75rem]"
              style="--i: 1;"
            >
              Flat paper. <em>Three layers.</em> One glow.
            </h1>
            <p
              class="rise mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty"
              style="--i: 2;"
            >
              Every rule the site is built on, on one page, made from the same components the real
              pages use. Headings in Space Grotesk, body in Inter, and anything technical in{" "}
              <code>monospace</code>.
            </p>
            <div class="rise mt-9 flex flex-wrap gap-3" style="--i: 3;">
              <LinkButton href="/downloads" size="lg">
                <i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i>
                Download Zipr
              </LinkButton>
              <LinkButton href="#buttons" size="lg">
                See the buttons
                <i data-lucide="chevron-down" class="h-4 w-4" aria-hidden="true"></i>
              </LinkButton>
            </div>
            <p class="rise mt-4 text-xs text-muted-foreground" style="--i: 4;">
              Black leaves the page. Grey stays on it.
            </p>
          </div>

          <figure class="rise lg:col-span-7" style="--i: 2;">
            <EdgeShot id="editor-steps" edge="right" spill="170%" eager />
            <figcaption class="mt-3 text-xs text-muted-foreground">
              Clipped by the edge of the page. Click it to see the whole screen.
            </figcaption>
          </figure>
        </div>
      </Container>
    </Section>

    {/* ================= 2. LAYERS ================= */}
    <Section id="layers">
      <Container size="wide">
        <SectionHeading
          eyebrow="Depth"
          title={
            <>
              Three layers, <em>flat,</em> in order.
            </>
          }
          lede="White, then grey, then black — and never a fourth. Content in the body sits on the paper, never above it. The one way in is a well."
        />

        {/* The hierarchy, drawn as itself: paper holding a grey well holding
            an ink tile. */}
        <div class="grid gap-6 lg:grid-cols-12">
          <div class="flat p-6 sm:p-8 lg:col-span-7">
            <p class="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              1 · White — the body
            </p>
            <Well class="mt-6 p-6 sm:p-8">
              <p class="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                2 · Grey — a well, cut in
              </p>
              <div class="surface-ink mt-6 rounded-[var(--radius-lg)] p-6">
                <p class="font-mono text-xs uppercase tracking-[0.14em] opacity-70">
                  3 · Black — the top. Nothing above it.
                </p>
              </div>
            </Well>
          </div>

          <ul class="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            {PALETTE.map((colour) => (
              <li class="flex items-center gap-4 border-b border-border pb-4">
                <span
                  class={`h-14 w-14 shrink-0 rounded-[var(--radius-md)] border border-border ${colour.swatch}`}
                  aria-hidden="true"
                ></span>
                <span class="min-w-0">
                  <span class="block font-display font-semibold">{colour.name}</span>
                  <code class="block text-sm text-muted-foreground">{colour.hex}</code>
                  <span class="block text-xs text-muted-foreground">{colour.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>

    {/* ================= 3. TYPE ================= */}
    <Section tone="muted" id="type">
      <Container size="wide">
        <SectionHeading eyebrow="Type" title="Three faces, three jobs." />
        <Rule
          name="Headings"
          note="Space Grotesk, 600, tight tracking. One word may take the emphasis colour."
        >
          <p class="font-display text-5xl font-semibold leading-[1.0] tracking-[-0.035em] sm:text-6xl">
            Build it. Run it. <em class="not-italic text-emphasis">Share it.</em>
          </p>
        </Rule>
        <Rule name="Body" note="Inter, 1.55 leading, a measure kept under about 70 characters.">
          <p class="max-w-2xl text-lg leading-relaxed text-pretty">
            Zipr turns the clever things you do on your computer into shortcuts you can run again
            and share with anyone who's ever asked, “How did you do that?” No code needed.
          </p>
        </Rule>
        <Rule
          name="Technical"
          note="JetBrains Mono — and only for what is technical: step names, versions, paths, keys."
        >
          <p class="flex flex-wrap gap-2 text-sm">
            <code class="rounded-[var(--radius-sm)] bg-background px-2 py-1">Open Link</code>
            <code class="rounded-[var(--radius-sm)] bg-background px-2 py-1">v1.4.2</code>
            <code class="rounded-[var(--radius-sm)] bg-background px-2 py-1">
              ~/Pictures/Screenshots
            </code>
            <kbd class="rounded-[var(--radius-sm)] bg-background px-2 py-1">Ctrl + Space</kbd>
          </p>
        </Rule>
      </Container>
    </Section>

    {/* ================= 4. WELLS =================
        Every card that used to be orange is one of these now. */}
    <Section id="wells">
      <Container size="wide">
        <SectionHeading
          eyebrow="Emphasis"
          title="The orange cards are wells now."
          lede="A well is how one thing is set apart: grey, cut a hair into the page. Use them sparingly — everything else stays flat, with a hairline."
        />
        <div class="grid gap-6 lg:grid-cols-3">
          <Card lift class="flex flex-col p-7">
            <div class="flex items-center justify-between">
              <h3 class="text-2xl">Flat card</h3>
              <Badge>Layer 1</Badge>
            </div>
            <p class="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
              The default. Paper on paper, told apart by its edge, which sharpens under the pointer.
              It never lifts.
            </p>
            <LinkButton href="/features" variant="outline" class="mt-6 self-start">
              See the features
            </LinkButton>
          </Card>

          <Well class="flex flex-col p-7">
            <div class="flex items-center justify-between">
              <h3 class="text-2xl">Team plan</h3>
              <Badge tone="primary">Was orange</Badge>
            </div>
            <p class="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
              The featured card. Its emphasis is now depth, not paint — and a grey button inside a
              well turns white.
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/pricing">See pricing</LinkButton>
              <LinkButton href="#wells">Stay here</LinkButton>
            </div>
          </Well>

          <Well class="flex flex-col p-7">
            <IconTile icon="zap" />
            <h3 class="mt-5 text-2xl">Set apart</h3>
            <ul class="mt-4 space-y-3">
              <CheckItem>Grey, never orange, behind content</CheckItem>
              <CheckItem>Orange only for marks: the logo, ticks, tiles</CheckItem>
              <CheckItem>One well per idea, not one per paragraph</CheckItem>
            </ul>
          </Well>
        </div>
      </Container>
    </Section>

    {/* ================= 5. BUTTONS ================= */}
    <Section tone="muted" id="buttons">
      <Container size="wide">
        <div class="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div class="lg:col-span-7">
            <Eyebrow>Buttons</Eyebrow>
            <h2 class="text-3xl leading-[1.05] text-balance sm:text-[2.75rem]">
              Coloured by <em>where they go.</em>
            </h2>
          </div>
          <p class="leading-relaxed text-muted-foreground text-pretty lg:col-span-5">
            Black leaves the page. Grey stays on it — and on a grey surface, grey turns white. Hover
            or tab to any of them for the rotating glow, or switch it on for all of them.
          </p>
        </div>

        <div
          data-glow-demo
          class="grid gap-px overflow-hidden rounded-[var(--radius-xl)] border border-border"
        >
          <ButtonStage label="Important — once per screen" class="surface-paper">
            <LinkButton href="/downloads" variant="important" size="lg">
              <i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i>
              Download Zipr
            </LinkButton>
          </ButtonStage>
          <ButtonStage label="On paper" class="surface-paper">
            <LinkButton href="/downloads">
              <i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i>
              Download
            </LinkButton>
            <LinkButton href="/gallery" variant="outline">
              Browse the Gallery
            </LinkButton>
            <LinkButton href="#layers">Back to layers</LinkButton>
            <ActionButton>
              <i data-lucide="rotate-ccw" class="h-4 w-4" aria-hidden="true"></i>
              Replay
            </ActionButton>
          </ButtonStage>
          <ButtonStage label="On grey — grey buttons turn white" class="surface-grey">
            <LinkButton href="/pricing">See pricing</LinkButton>
            <LinkButton href="#type">Back to type</LinkButton>
            <ActionButton>
              <i data-lucide="copy" class="h-4 w-4" aria-hidden="true"></i>
              Copy
            </ActionButton>
          </ButtonStage>
          <ButtonStage label="In a well" class="well rounded-none">
            <LinkButton href="/contact">Talk to us</LinkButton>
            <ActionButton>Show details</ActionButton>
          </ButtonStage>
        </div>

        <div class="mt-6 flex justify-center">
          <button
            type="button"
            aria-pressed="false"
            class="btn btn-grey inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] px-5 text-sm font-semibold"
            onclick="var on=this.getAttribute('aria-pressed')!=='true';this.setAttribute('aria-pressed',String(on));document.querySelector('[data-glow-demo]').classList.toggle('glow-all',on);"
          >
            <i data-lucide="sparkles" class="h-4 w-4" aria-hidden="true"></i>
            Show every glow
          </button>
        </div>
      </Container>
    </Section>

    {/* ================= 6. MEDIA =================
        Screenshots sliding on and off the page, screenshots clipped
        half-and-half by its edges, and a video that loops like a GIF. Any
        picture opens whole in the viewer. */}
    <Section id="media" class="overflow-x-clip">
      <Container size="wide">
        <SectionHeading
          eyebrow="Media"
          title="Real screens, sliding past."
          lede="Authentic screenshots only. They slide left to right, on and off the page; grab the row to pull it, let go and it carries on. Click any picture — wherever it is clipped — to open the whole of it."
        />
      </Container>

      <ScreenshotMarquee
        label="Screenshots of the Zipr app"
        direction="right"
        ids={[
          "overlay-list",
          "editor-branches",
          "run-history",
          "zap-release",
          "app-shortcuts",
          "overlay-grid",
        ]}
      />

      <Container size="wide" class="mt-24">
        <div class="grid items-center gap-10 [&>*]:min-w-0 lg:grid-cols-12">
          <div class="lg:col-span-6">
            <EdgeShot id="run-history" edge="left" spill="170%" />
          </div>
          <div class="lg:col-span-5 lg:col-start-8">
            <Eyebrow>Edge-clipped</Eyebrow>
            <h3 class="text-3xl leading-[1.05] text-balance">Half on the page, half beyond it.</h3>
            <p class="mt-4 leading-relaxed text-muted-foreground text-pretty">
              A picture drawn wider than its column runs off the edge, and the section clips it. It
              says “there is more of this” better than a framed thumbnail — and the viewer always
              shows all of it.
            </p>
          </div>
        </div>

        <div class="mt-20 grid items-center gap-10 [&>*]:min-w-0 lg:grid-cols-12">
          <div class="lg:col-span-5">
            <Eyebrow>Either edge</Eyebrow>
            <h3 class="text-3xl leading-[1.05] text-balance">Left or right, by the layout.</h3>
            <p class="mt-4 leading-relaxed text-muted-foreground text-pretty">
              Clip towards the outside of the page, away from the words, so the eye runs from the
              text into the picture.
            </p>
          </div>
          <div class="lg:col-span-6 lg:col-start-7">
            <EdgeShot id="zap" edge="right" spill="130%" />
          </div>
        </div>
      </Container>

      <Container size="wide" class="mt-24">
        <div class="mx-auto mb-8 max-w-2xl text-center">
          <Eyebrow class="justify-center">Video</Eyebrow>
          <h3 class="text-3xl leading-[1.05] text-balance">In the middle, on a loop.</h3>
          <p class="mt-4 leading-relaxed text-muted-foreground text-pretty">
            Video sits centred and plays by itself, muted, like a GIF — no controls, because there
            is nothing to control. It starts and ends on the same frame, so the loop has no seam.
          </p>
        </div>
        <LoopVideo
          src="/media/editor-pan"
          width={1280}
          height={800}
          label="The Zipr editor, panning slowly across a shortcut that checks the VPN and takes one of two paths."
        />
      </Container>
    </Section>

    {/* ================= 7. TOOLBOX MARQUEE ================= */}
    <Section tone="muted" id="toolbox" class="overflow-x-clip">
      <Container size="wide">
        <SectionHeading
          eyebrow="The toolbox"
          title="Categories on the move."
          lede="The groups of steps slide past on their own. Grab the row to pull it either way; let go and it carries on."
        />
      </Container>
      <ToolboxTiles />
    </Section>

    {/* ================= 8. DISCLOSURE ================= */}
    <Section id="questions">
      <Container size="wide">
        <div class="grid gap-10 lg:grid-cols-12">
          <div class="lg:col-span-4">
            <SectionHeading eyebrow="Disclosure" title="Flat rows, ruled." />
          </div>
          <div class="lg:col-span-8">
            <Disclosure question="Why is nothing raised?">
              Because a flat page reads faster. Depth is kept for one thing: a well, which sets
              content apart by cutting it in — and the footer logo, which is the one object allowed
              to stand up.
            </Disclosure>
            <Disclosure question="Why does the glow rotate?">
              It is the one colour on the page that moves, so it is unmistakable as “this responds”,
              on paper, grey and black alike. With reduced motion it still shows; it simply holds
              still.
            </Disclosure>
            <Disclosure question="When is a button black?">
              When it takes you off the page: another page, a download, another site. Anything that
              stays on the page — a toggle, a replay, a jump to a section — is grey.
            </Disclosure>
          </div>
        </div>
      </Container>
    </Section>

    <CtaBand
      title="The footer is a well, too."
      body="Scroll on: the footer sits in a well, and the logo in it is the one thing on the site that stands raised."
      primary={{ href: "/", label: "Back to the home page" }}
      secondary={{ href: "/downloads", label: "Download Zipr" }}
    />
  </Page>
);
