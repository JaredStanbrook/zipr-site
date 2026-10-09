// worker/content/legal.ts
//
// Who is responsible for this site, and which version of each legal page is
// live. One place, so the footer, the privacy notice and anything added later
// never disagree about the name on the door.
//
// `operator` is the legal person who owns Zipr and runs this site. It is shown
// as the copyright owner in the footer and as the data controller in the
// privacy notice, so it must be a legal person rather than a brand. Today that
// is Jared Stanbrook, personally; it matches the copyright line in the client
// and API repositories. If a company takes Zipr over, change it here (with the
// company or ABN number in `registration`) and in both repositories' licences.

import { CONTACT } from "./site";

export const LEGAL = {
  /** Legal name of the business that runs this site and publishes the app. */
  operator: "Jared Stanbrook",
  /** Company / ABN / registration number, shown after the name. Null hides it. */
  registration: null as string | null,
  /** Where privacy requests and legal notices go. */
  contact: CONTACT.address,
  /**
   * Where the licence the desktop app is distributed under is published. The
   * downloads page links it beside every installer, so nobody downloads
   * without being able to read it. The text is in `content/licence.ts`.
   */
  licenceUrl: "/licence" as string | null,
};

/**
 * A legal page's version history, newest first. Add an entry whenever the
 * substance of the page changes, so anyone can see what was in force when.
 * Git holds the full text of every earlier version.
 */
export interface LegalVersion {
  version: string;
  /** ISO date. */
  date: string;
  summary: string;
}

export const PRIVACY_VERSIONS: LegalVersion[] = [
  {
    version: "1.0",
    date: "2026-09-30",
    summary: "First published.",
  },
  {
    version: "1.1",
    date: "2026-10-09",
    summary:
      "Added the language button: your choice is remembered in your browser's local storage, and translation happens in your browser.",
  },
];

/** "Zipr" or "Zipr (ABN 12 345 678 901)". */
export const operatorName = () =>
  LEGAL.registration ? `${LEGAL.operator} (${LEGAL.registration})` : LEGAL.operator;
