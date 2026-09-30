// worker/content/legal.ts
//
// Who is responsible for this site, and which version of each legal page is
// live. One place, so the footer, the privacy notice and anything added later
// never disagree about the name on the door.
//
// BEFORE LAUNCH: `operator` must be the legal name of whoever actually runs
// Zipr — a registered company name (with its company or ABN number in
// `registration`), or the trading name of the person responsible. It is shown
// as the owner in the footer and as the data controller in the privacy
// notice, so a brand name that is not a legal entity is not good enough.

import { CONTACT } from "./site";

export const LEGAL = {
  /** Legal name of the business that runs this site and publishes the app. */
  operator: "Zipr",
  /** Company / ABN / registration number, shown after the name. Null hides it. */
  registration: null as string | null,
  /** Where privacy requests and legal notices go. */
  contact: CONTACT.address,
  /**
   * URL of the licence (EULA) the desktop app is distributed under. Null
   * until one exists; once set, the downloads page links it beside every
   * installer so nobody downloads without being able to read it.
   */
  licenceUrl: null as string | null,
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
];

/** "Zipr" or "Zipr (ABN 12 345 678 901)". */
export const operatorName = () =>
  LEGAL.registration ? `${LEGAL.operator} (${LEGAL.registration})` : LEGAL.operator;
