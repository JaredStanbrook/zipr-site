import type { FC } from "hono/jsx";

import { STEP_GROUPS, groupCounts } from "@server/content/steps";
import { IconTile } from "@views/components/Ui";

/**
 * The toolbox as one tile per group.
 *
 * The full library is far too long for a home or features section, so those
 * pages show the groups: a name, what it holds, and a few of its steps, each
 * linking to that group on /toolbox where every step is listed. The step names
 * stay in English on every language (`translate="no"`) because they are the
 * app's own labels, which the Action Model requires to match everywhere.
 */
export const ToolboxTiles: FC<{ columns?: "three" | "four" }> = ({ columns = "three" }) => (
  <ul
    class={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
      columns === "four" ? "lg:grid-cols-4" : "lg:grid-cols-3"
    }`}
  >
    {STEP_GROUPS.map((group) => {
      const { total } = groupCounts(group);
      return (
        <li>
          <a
            href={`/toolbox#${group.id}`}
            class="keycap flex h-full flex-col p-4 no-underline transition hover:-translate-y-0.5"
          >
            <span class="flex items-center gap-3">
              <IconTile icon={group.icon} tone="brand" />
              <span class="min-w-0">
                <span class="block text-sm font-bold leading-snug" translate="no">
                  {group.name}
                </span>
                <span class="block text-xs text-muted-foreground">
                  {total > 0 ? (
                    <>
                      <span translate="no">{total}</span> steps
                    </>
                  ) : (
                    "From your plugins"
                  )}
                </span>
              </span>
            </span>
            <span class="mt-3 block text-xs leading-relaxed text-muted-foreground text-pretty">
              {group.holds}
            </span>
            {total > 0 ? (
              <span
                class="mt-3 block text-xs font-medium leading-relaxed text-foreground/80"
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
  </ul>
);
