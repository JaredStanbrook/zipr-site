import type { FC } from "hono/jsx";

import { GALLERY_ROLES, GALLERY_TRICKS } from "@server/content/gallery";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  IconTile,
  Badge,
  LinkButton,
  CtaBand,
} from "@views/components/Ui";

/**
 * The Gallery answers one question: "What could Zipr help me do in my job?"
 *
 * It is a showcase, not a library. Nothing here is downloaded or installed
 * from this page, and the page says so near the top rather than letting a
 * visitor discover it after clicking. Examples are grouped by the work people
 * do, because a visitor recognises their own Tuesday faster than they read a
 * feature list. Every example is made from steps in the toolbox.
 */

export const GalleryPage: FC = () => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container>
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Gallery"
          title={
            <>
              What could Zipr help you do <em>at work?</em>
            </>
          }
          lede="Explore practical examples across roles and tasks to spark your own ideas, all built directly inside Zipr."
        />
        <div class="mx-auto -mt-4 max-w-2xl text-center">
          <nav aria-label="Jump to a role" class="mt-6 flex flex-wrap justify-center gap-2">
            {GALLERY_ROLES.map((role) => (
              <a
                href={`#${role.id}`}
                class="clay-raised inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium no-underline transition hover:text-primary"
              >
                {role.role}
              </a>
            ))}
            <a
              href="#tricks"
              class="clay-raised inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium no-underline transition hover:text-primary"
            >
              Quick tricks
            </a>
          </nav>
        </div>
      </Container>
    </Section>

    {GALLERY_ROLES.map((role, i) => (
      <Section id={role.id} tone={i % 2 === 0 ? "muted" : "default"} class="scroll-mt-24">
        <Container size="wide">
          <div class="grid gap-10 lg:grid-cols-[0.7fr_1.4fr] lg:gap-14">
            <div class="lg:sticky lg:top-28 lg:self-start">
              <IconTile icon={role.icon} tone="brand" size="lg" />
              <h2 class="mt-5 text-3xl leading-[1.08] text-balance sm:text-4xl">{role.role}</h2>
              <p class="mt-3 leading-relaxed text-muted-foreground text-pretty">{role.routine}</p>
            </div>

            <ul class="grid gap-5 sm:grid-cols-2">
              {role.examples.map((example) => (
                <li>
                  <Card lift class="flex h-full flex-col p-6">
                    <h3 class="text-xl leading-snug text-balance">{example.name}</h3>
                    <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                      {example.does}
                    </p>
                    <p class="mt-5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-primary">
                      Its steps
                    </p>
                    <ol class="clay-well mt-2 space-y-2 rounded-[1.1rem] p-4">
                      {example.recipe.map((step, n) => (
                        <li class="flex gap-2.5 text-sm">
                          <span class="font-mono text-xs leading-5 text-muted-foreground tabular">
                            {n + 1}
                          </span>
                          <span>{step.sentence}</span>
                        </li>
                      ))}
                    </ol>
                    <p class="mt-4 flex flex-wrap gap-1.5">
                      {example.builtFrom.map((name) => (
                        <span translate="no">
                          <Badge tone="neutral">{name}</Badge>
                        </span>
                      ))}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>
    ))}

    <Section id="tricks" class="scroll-mt-24">
      <Container size="wide">
        <SectionHeading
          eyebrow="Quick tricks"
          title="Small ideas that pay off every week"
          lede="Describe one in your own words and ask Zap, the helper that builds shortcuts from your words, to build it. You test it before you keep it."
        />
        <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {GALLERY_TRICKS.map((trick) => (
            <li>
              <Card lift class="flex h-full flex-col p-6">
                <h3 class="text-lg leading-snug text-balance">{trick.name}</h3>
                <p class="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {trick.does}
                </p>
              </Card>
            </li>
          ))}
        </ul>
        <div class="mt-10 text-center">
          <LinkButton href="/zap" size="lg">
            Ask Zap to build it
            <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
          </LinkButton>
        </div>
      </Container>
    </Section>

    <CtaBand
      title="Build your first shortcut."
      body="Start with the task you do most. Free, and no account needed."
      primary={{ href: "/downloads", label: "Download Zipr" }}
      secondary={{ href: "/features", label: "Explore what Zipr can do" }}
    />
  </Page>
);
