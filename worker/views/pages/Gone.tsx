import type { FC } from "hono/jsx";

import { Page, Section, Container, SectionHeading, SubmitButton } from "@views/components/Ui";

/**
 * Where the access gate sends anyone without a live invitation link. Says
 * nothing about the product on purpose.
 */
export const GonePage: FC = () => (
  <Page>
    <Section class="pt-24 sm:pt-32">
      <Container size="prose">
        <SectionHeading
          as="h1"
          align="center"
          title="Nothing to see here"
          lede="This site isn't open to the public yet. If someone sent you a link, it may have expired — ask them for a new one."
        />
      </Container>
    </Section>
  </Page>
);

/**
 * Shown for a GET on an invitation link. Opening the link takes a POST from
 * this button, so a chat app's link preview, which only GETs, cannot use it up.
 */
export const EnterPage: FC<{ token: string }> = ({ token }) => (
  <Page>
    <Section class="pt-24 sm:pt-32">
      <Container size="prose">
        <SectionHeading
          as="h1"
          align="center"
          title="You're invited"
          lede="This link works once and then belongs to this browser. Continue to open the site."
        />
        <form method="post" action={`/a/${encodeURIComponent(token)}`} class="mt-8 text-center">
          <SubmitButton variant="primary" size="lg">
            Continue
          </SubmitButton>
        </form>
      </Container>
    </Section>
  </Page>
);
