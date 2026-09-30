import type { FC } from "hono/jsx";
import type { Context } from "hono";

import type { AppEnv } from "@server/types";
import { resolveMeta } from "@server/lib/seo";
import { assetVersion } from "@server/lib/asset-version";
import { Layout } from "@views/Layout";
import { Page, Section, Container, SectionHeading, LinkButton } from "@views/components/Ui";

/**
 * The page a visitor sees for a URL that does not exist.
 *
 * It used to be an empty 404 body: correct for a crawler, but a dead end for a
 * person who followed an old or mistyped link, with nothing to click and no
 * way back into the site. It keeps the 404 status and `noindex`, so it never
 * competes with a real page, and offers the pages most people were after.
 */
const NotFoundPage: FC = () => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container size="prose">
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="404"
          title="That page isn't here"
          lede="The link may be old, or the address mistyped. These are the pages most people are looking for."
        />
        <div class="flex flex-wrap justify-center gap-3">
          <LinkButton href="/">Home</LinkButton>
          <LinkButton href="/features" variant="outline">
            Features
          </LinkButton>
          <LinkButton href="/downloads" variant="outline">
            Download Zipr
          </LinkButton>
          <LinkButton href="/pricing" variant="outline">
            Pricing
          </LinkButton>
        </div>
      </Container>
    </Section>
  </Page>
);

/**
 * Render the not-found page in the site layout with a 404 status.
 *
 * Called from the worker's `notFound`, which runs outside the app's renderer
 * middleware, so the layout is applied here directly rather than via
 * `c.render`.
 */
export const renderNotFound = (c: Context<AppEnv>) => {
  const meta = resolveMeta(
    { title: "Page not found", noindex: true },
    c.var.app,
    new URL(c.req.url),
  );

  return c.html(
    <Layout
      meta={meta}
      app={c.var.app}
      user={c.var.auth?.user ?? null}
      currentPath={c.req.path}
      assetVersion={assetVersion(c)}
    >
      <NotFoundPage />
    </Layout>,
    404,
  );
};
