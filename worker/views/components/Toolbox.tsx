import type { FC } from "hono/jsx";

import { STEP_GROUPS } from "@server/content/steps";
import { IconTile, Marquee } from "@views/components/Ui";

/**
 * The toolbox, one tile per group, sliding past in a marquee.
 *
 * The full library is far too long for a home or features section, so those
 * pages show the groups: a name, what it holds, and a few of its steps, each
 * linking to that group on /toolbox where every step is listed. They used to
 * be a grid that a reader had to scan all of; now they travel across the page
 * on their own, and can be grabbed and pulled either way — let go and they
 * carry on (`lib/marquee.ts`). Without JavaScript it is a row to scroll.
 *
 * The step names stay in English on every language (`translate="no"`) and in
 * monospace, because they are the app's own labels — technical content, which
 * the Action Model requires to match everywhere.
 */
export const ToolboxTiles: FC<{ columns?: "three" | "four" }> = () => (
  <Marquee label="The toolbox's groups of steps" direction="left" speed={34}>
    {STEP_GROUPS.map((group) => {
      const total = group.steps.length;
      return (
        <li class="w-[17.5rem] sm:w-[19rem]">
          <a
            href={`/toolbox#${group.id}`}
            class="keycap glow flex h-full flex-col p-5 no-underline"
            draggable="false"
          >
            <span class="flex items-center gap-3">
              <IconTile icon={group.icon} tone="brand" />
              <span class="min-w-0">
                <span
                  class="block font-display text-base font-semibold leading-snug"
                  translate="no"
                >
                  {group.name}
                </span>
                <span class="block text-xs text-muted-foreground">
                  {total > 0 ? (
                    <>
                      <span translate="no" class="tabular">
                        {total}
                      </span>{" "}
                      steps
                    </>
                  ) : (
                    "From your plugins"
                  )}
                </span>
              </span>
            </span>
            <span class="mt-4 block text-sm leading-relaxed text-muted-foreground text-pretty">
              {group.holds}
            </span>
            {total > 0 ? (
              <span
                class="mt-auto block border-t border-border pt-3 font-mono text-[0.75rem] leading-relaxed text-foreground/80"
                translate="no"
              >
                {group.steps
                  .slice(0, 3)
                  .map((step) => step.label)
                  .join(" · ")}
                {total > 3 ? " …" : ""}
              </span>
            ) : null}
          </a>
        </li>
      );
    })}
  </Marquee>
);
