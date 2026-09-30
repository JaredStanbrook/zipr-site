// worker/content/licence.ts
//
// The licence the Zipr desktop app is distributed under, as published at
// /licence and linked beside every installer.
//
// KEEP IN STEP: this is the same text as `LICENSE.md` in the zipr-client
// repository, which is what the Windows installer shows before it installs.
// The one deliberate difference: section 10 says "the App's repository" here
// where the repository copy says "this repository". Change the two together, and add an entry to LICENCE_VERSIONS when the
// substance changes. The version an installer ships with applies to that
// release (section 8), so an old version stays in force for old installs —
// git holds the text of each.

import type { LegalVersion } from "./legal";

export const LICENCE_VERSIONS: LegalVersion[] = [
  {
    version: "1.0",
    date: "2026-09-30",
    summary: "First published.",
  },
];

export interface LicenceSection {
  title: string;
  /** Paragraphs, in order. */
  body: string[];
  /** A bulleted list, shown after the first paragraph. */
  list?: string[];
  /** Paragraphs shown after the list. */
  after?: string[];
}

export const LICENCE_INTRO =
  'This licence is between you and Jared Stanbrook ("we", "us"), who makes Zipr. It covers the Zipr desktop app as released at https://zipr.stanbrook.me/downloads (the "App"). By installing or using the App, you agree to it.';

export const LICENCE_SECTIONS: LicenceSection[] = [
  {
    title: "What you may do",
    body: [
      "You may download, install and use the App free of charge, on as many devices as you like, for personal use or for work, including inside your organisation. This licence has no fee and no expiry. It ends only as described in section 7.",
    ],
  },
  {
    title: "What you may not do",
    body: ["You may not:"],
    list: [
      "sell, rent, sublicense or redistribute the App, or offer it for download anywhere other than from us — point people to our downloads page instead;",
      "modify, reverse engineer, decompile or disassemble the App, except to the extent the law allows you to despite this restriction;",
      "remove or change any copyright, licence or trademark notice in the App;",
      "get around any technical limit or licence check in the App or in a Zipr server.",
    ],
  },
  {
    title: "What is yours",
    body: [
      "The items, catalogues and settings you create in the App, and any plugins you write, belong to you. This licence gives us no rights in them. What you build is stored on your own machine unless you connect the App to a Zipr server.",
    ],
  },
  {
    title: "Team servers are separate",
    body: ["The App can connect to a Zipr server. This licence covers the App only:"],
    list: [
      "the hosted service we run is governed by the agreement your organisation signs with us for it;",
      "a self-hosted Zipr server is governed by the licence agreement issued for that deployment.",
    ],
    after: [
      "Whoever runs the server you connect to decides who can use it and what is shared through it.",
    ],
  },
  {
    title: "Other people's software",
    body: [
      "The App includes open-source components. Each is licensed to you under its own licence, and nothing in this licence limits your rights under those licences.",
    ],
  },
  {
    title: "No warranty, and limits on liability",
    body: [
      'The App is provided "as is". Items you build can run commands, open files and change things on your computer; you are responsible for what you ask them to do. To the extent the law allows, we give no warranties about the App, express or implied, including that it is fit for a particular purpose or free of errors, and we are not liable for any loss or damage arising from using it, including lost data, lost profits or indirect loss.',
      "Nothing in this licence excludes, restricts or modifies any right or remedy you have under the Australian Consumer Law or any other law that cannot lawfully be excluded. Where our liability for a failure to comply with such a guarantee can be limited, it is limited to supplying the App again.",
    ],
  },
  {
    title: "Ending this licence",
    body: [
      "You can stop using the App at any time by uninstalling it. If you break this licence, it ends automatically and you must stop using the App. Sections 3, 6 and 7 continue after it ends.",
    ],
  },
  {
    title: "Changes",
    body: [
      "We may publish a new version of this licence with a future release of the App. The version that came with the release you installed applies to that release.",
    ],
  },
  {
    title: "Ownership",
    body: [
      "Apart from the rights granted in section 1, we keep all rights in the App, including all intellectual property rights. The Zipr name and logo are ours; this licence does not let you use them.",
    ],
  },
  {
    title: "This repository",
    body: [
      "The source code in the App's repository is confidential and is not licensed to anyone under this licence. It may be used only with our prior written permission.",
    ],
  },
];
