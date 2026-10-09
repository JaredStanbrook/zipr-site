import type { FC, Child } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import { LEGAL, PRIVACY_VERSIONS, operatorName } from "@server/content/legal";
import { formatDateShort } from "@views/lib/utils";
import { Page, Section, Container, SectionHeading, Card, CheckItem } from "@views/components/Ui";

/**
 * The privacy notice.
 *
 * Written from what the code does, not from a template: every sentence here
 * should be traceable to a route, a table or a binding. When one of those
 * changes — a new form field, an analytics script, a new processor — this
 * page changes in the same commit, and PRIVACY_VERSIONS gets a new entry.
 *
 * What it rests on, for whoever edits it next:
 *   - Bug reports: `issue` table, POST /report. Email optional.
 *   - Rate limiting: POST /report keys the RATE_LIMITER binding on the IP.
 *   - Downloads: a per-installer counter, no visitor data stored.
 *   - Cookies: `auth_token` and `flash-toast`, staff sign-in only.
 *   - Local storage: theme preference only.
 *   - No analytics, no third-party scripts, fonts self-hosted.
 *   - Processor: Cloudflare (Workers, D1, R2, request logs via observability).
 *   - Hosted service (zipr-api): identity traits email + name, catalogues,
 *     audit_events, analytics_events per person (ANALYTICS_RETENTION_DAYS,
 *     default 180), Stripe for billing. Self-hosted never contacts us.
 */

const Block: FC<{ title: string; children?: Child }> = ({ title, children }) => (
  <section class="mt-12">
    <h2 class="text-2xl leading-snug text-balance">{title}</h2>
    <div class="mt-4 space-y-4 leading-relaxed text-muted-foreground text-pretty">{children}</div>
  </section>
);

const Mail: FC = () => (
  <a
    href={`mailto:${LEGAL.contact}?subject=${encodeURIComponent("Privacy request")}`}
    class="font-medium text-primary underline underline-offset-4 wrap-anywhere"
  >
    {LEGAL.contact}
  </a>
);

export const PrivacyPage: FC<{ app: AppConfig }> = ({ app }) => {
  const [current] = PRIVACY_VERSIONS;

  return (
    <Page>
      <Section class="pt-12 sm:pt-20">
        <Container size="prose">
          <SectionHeading
            as="h1"
            eyebrow="Privacy"
            title="Privacy notice"
            lede="What this website and the Zipr app collect, why, and what you can ask us to do about it."
          />
          <p class="-mt-6 text-sm text-muted-foreground">
            Version <span class="tabular">{current.version}</span> · Last updated{" "}
            <time datetime={current.date}>{formatDateShort(current.date, app.locale)}</time>
          </p>

          <Card class="mt-10 p-7">
            <h2 class="text-lg font-bold">The short version</h2>
            <ul class="mt-4 space-y-3">
              <CheckItem>No analytics, advertising or tracking cookies on this site.</CheckItem>
              <CheckItem>
                No third-party scripts or fonts — everything is served from our own domain.
              </CheckItem>
              <CheckItem>
                We only hold what you choose to send us: a bug report, or an email.
              </CheckItem>
              <CheckItem>We don't sell or share your information for marketing.</CheckItem>
            </ul>
          </Card>

          <Block title="Who we are">
            <p>
              This website and the Zipr app are run by {operatorName()}. We are responsible for the
              information described here. For anything on this page, email <Mail />.
            </p>
          </Block>

          <Block title="What we collect on this website">
            <p>
              <strong class="text-foreground">Bug reports.</strong> When you use the{" "}
              <a href="/report" class="font-medium text-primary underline underline-offset-4">
                report form
              </a>
              , we store what you type: where the problem happened, your summary and description,
              and — only if you fill them in — the version, your platform and your email address. We
              use it to investigate and fix the problem, and to reply if you left an address.
              Reports are not published.
            </p>
            <p>
              <strong class="text-foreground">Emails.</strong> If you email us, we receive your
              address and whatever you write, and use them to reply.
            </p>
            <p>
              <strong class="text-foreground">Downloads.</strong> We count how many times each
              installer is downloaded. The count is a number per file and is not linked to you.
            </p>
            <p>
              <strong class="text-foreground">Technical data.</strong> Like any website, the servers
              that deliver this one receive your IP address and browser details with each request.
              Cloudflare, which hosts the site, uses them to deliver pages and protect the site, and
              keeps request logs for a short period. We also use your IP address briefly to limit
              how many bug reports can be sent at once.
            </p>
          </Block>

          <Block title="Cookies and browser storage">
            <p>
              Visitors get no cookies. The site remembers whether you chose light or dark mode, and
              which language you chose if you used the translate button, in your browser's local
              storage; neither leaves your device. Translation happens in your browser from files
              served by this site, so the text of the page is not sent to any translation service.
              The only cookies are a sign-in cookie and a one-off notification cookie used by our
              own staff when they sign in to publish releases. Because nothing here tracks you,
              there is no cookie banner to accept.
            </p>
          </Block>

          <Block title="The Zipr app and team servers">
            <p>
              The desktop app makes no network requests until you connect it to a team server. What
              you build stays on your machine.
            </p>
            <p>
              On a <strong class="text-foreground">self-hosted</strong> server, your organisation's
              data stays on infrastructure your organisation controls and we receive none of it.
            </p>
            <p>
              On our <strong class="text-foreground">hosted</strong> service, we store your
              organisation's data on its behalf, under the agreement we sign with your organisation.
              That includes:
            </p>
            <ul class="list-disc space-y-2 pl-5">
              <li>each member's account: email address, name and sign-in details;</li>
              <li>the catalogues, items and plugins your organisation builds;</li>
              <li>an audit trail of who changed what, and when;</li>
              <li>
                usage records of who ran which item, when, and from which device and app version —
                the basis of the team usage figures. These are kept for 180 days by default.
              </li>
            </ul>
            <p>
              Your organisation decides who is a member and who can see what, so questions about
              that data are best sent to your administrator first — we will help them answer.
              Billing is handled through our payment provider, Stripe, which holds your
              organisation's billing details.
            </p>
          </Block>

          <Block title="Who else sees it">
            <p>
              Cloudflare hosts this website, its database and the installer files, and processes
              information on our behalf to do so. Cloudflare operates worldwide, so your information
              may be processed outside your country. The providers that run the hosted service,
              including Stripe for billing, are listed in your organisation's agreement. Beyond
              those, we don't share your information with anyone unless the law requires it.
            </p>
          </Block>

          <Block title="How long we keep it">
            <p>
              We keep bug reports for as long as they help us fix the product, and emails as
              ordinary correspondence. Ask us and we will delete yours sooner.
            </p>
          </Block>

          <Block title="Why we're allowed to use it">
            <p>
              Where data-protection law such as the GDPR applies, we rely on our legitimate interest
              in running this site and fixing the product, and on your request when you ask us to
              reply to you.
            </p>
          </Block>

          <Block title="Your rights">
            <p>
              You can ask us for a copy of the information we hold about you, and ask us to correct
              or delete it or to stop using it. Depending on where you live — for example the EU,
              UK, Australia or California — you may have further rights, including the right to
              complain to your data-protection regulator. Email <Mail /> and we will answer within a
              month. We will never treat you differently for asking.
            </p>
          </Block>

          <Block title="Children">
            <p>
              Zipr is a tool for work and is not aimed at children. We don't knowingly collect
              information from anyone under 16; if you think a child has sent us some, tell us and
              we will delete it.
            </p>
          </Block>

          <Block title="Keeping it safe">
            <p>
              Everything is sent over encrypted connections, and only the people who run Zipr can
              see bug reports. If a breach puts your information at risk, we will tell you and the
              relevant regulator as the law requires.
            </p>
          </Block>

          <Block title="Changes to this notice">
            <p>
              When this notice changes, the version and date at the top change with it and the
              change is listed below. Ask us for any earlier version.
            </p>
            <ul class="space-y-2 text-sm">
              {PRIVACY_VERSIONS.map((v) => (
                <li>
                  <span class="font-semibold text-foreground tabular">{v.version}</span> ·{" "}
                  <time datetime={v.date}>{formatDateShort(v.date, app.locale)}</time> — {v.summary}
                </li>
              ))}
            </ul>
          </Block>
        </Container>
      </Section>
    </Page>
  );
};
