import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import { LEGAL } from "@server/content/legal";
import { LICENCE_INTRO, LICENCE_SECTIONS, LICENCE_VERSIONS } from "@server/content/licence";
import { formatDateShort } from "@views/lib/utils";
import { Page, Section, Container, SectionHeading } from "@views/components/Ui";

/**
 * The Zipr Licence — what anyone who installs the free app agrees to.
 *
 * The text lives in `content/licence.ts` and must match `LICENSE.md` in the
 * client repository, which the installer shows. This page only lays it out.
 */
export const LicencePage: FC<{ app: AppConfig }> = ({ app }) => {
  const [current] = LICENCE_VERSIONS;

  return (
    <Page>
      <Section class="pt-12 sm:pt-20">
        <Container size="prose">
          <SectionHeading
            as="h1"
            eyebrow="Licence"
            title="Zipr Licence"
            lede="The terms you agree to when you install the free Zipr app."
          />
          <p class="-mt-6 text-sm text-muted-foreground">
            Version <span class="tabular">{current.version}</span> ·{" "}
            <time datetime={current.date}>{formatDateShort(current.date, app.locale)}</time>
          </p>

          <p class="mt-10 leading-relaxed text-muted-foreground text-pretty">{LICENCE_INTRO}</p>

          <ol class="mt-4">
            {LICENCE_SECTIONS.map((section, i) => (
              <li class="mt-10">
                <h2 class="text-2xl leading-snug text-balance">
                  <span class="tabular text-muted-foreground">{i + 1}.</span> {section.title}
                </h2>
                <div class="mt-4 space-y-4 leading-relaxed text-muted-foreground text-pretty">
                  {section.body.map((paragraph) => (
                    <p>{paragraph}</p>
                  ))}
                  {section.list ? (
                    <ul class="list-disc space-y-2 pl-5">
                      {section.list.map((item) => (
                        <li>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.after?.map((paragraph) => (
                    <p>{paragraph}</p>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          <p class="mt-12 text-sm text-muted-foreground">
            Questions about this licence:{" "}
            <a
              href={`mailto:${LEGAL.contact}?subject=${encodeURIComponent("Zipr licence question")}`}
              class="font-medium text-primary underline underline-offset-4 wrap-anywhere"
            >
              {LEGAL.contact}
            </a>
            . Using a Zipr server for a team is covered separately — see{" "}
            <a href="/pricing" class="font-medium text-primary underline underline-offset-4">
              pricing
            </a>
            .
          </p>
        </Container>
      </Section>
    </Page>
  );
};
