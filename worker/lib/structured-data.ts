/**
 * Schema.org JSON-LD for the public pages.
 *
 * Only what the pages visibly say. In particular there is no
 * `aggregateRating` or `review` on the SoftwareApplication: Zipr has neither,
 * and Google requires one of them before it shows a software rich result — so
 * this markup describes the app to search engines without earning stars, and
 * that is the honest outcome until real reviews exist.
 *
 * The owner is a Person, not an Organization, because that is who Zipr
 * belongs to (see LEGAL.operator). Switch the type if a company takes over.
 */

import type { AppConfig } from "../config/app.config";
import type { Faq } from "../content/pricing";
import { LEGAL } from "../content/legal";

const abs = (app: AppConfig, path: string) => new URL(path, app.origin).toString();

const publisher = (app: AppConfig) => ({
  "@type": "Person",
  "@id": abs(app, "/#owner"),
  name: LEGAL.operator,
});

/** The site itself. Home page only — it describes the whole domain once. */
export const websiteSchema = (app: AppConfig) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": abs(app, "/#website"),
  name: app.name,
  url: abs(app, "/"),
  inLanguage: app.locale,
  publisher: publisher(app),
});

/**
 * The desktop app. Every field is on the page: free to download (price 0),
 * Windows 10+ and macOS 12+, and where to get it.
 */
export const softwareSchema = (app: AppConfig, description: string) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": abs(app, "/#app"),
  name: app.name,
  description,
  url: abs(app, "/"),
  downloadUrl: abs(app, "/downloads"),
  applicationCategory: "BusinessApplication",
  operatingSystem: "Windows 10 or later, macOS 12 or later",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: app.currency,
  },
  license: abs(app, LEGAL.licenceUrl ?? "/licence"),
  publisher: publisher(app),
});

/**
 * A page's visible question-and-answer list. Google now shows FAQ rich
 * results only for a few authoritative health and government sites, so this
 * is for search engines' understanding of the page (and for other engines),
 * not for a SERP feature. The questions must be the ones on the page.
 */
export const faqSchema = (faqs: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
});
