import type { FC } from "hono/jsx";

import { Page, Section, Container, SectionHeading } from "@views/components/Ui";

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
