// worker/content/gallery.ts
//
// The Gallery: ideas, organised by the work people do.
//
// The Gallery is the website's showcase, not a shortcut library. Nothing here
// is published, downloaded or installed from the site, and no entry pretends
// to be a ready-made file — the page says so. Each one is a picture of what a
// person could build, so a visitor can recognise a task they already do.
//
// The one hard rule: every example must be buildable from steps the toolbox has. Each lists the
// steps it is made of, named as in the toolbox (`ACTION_TYPES` in
// features.ts), and uses only those. If an idea needs something the app does
// not do yet, it does not go in.

export interface GalleryExample {
  name: string;
  /** What it does, in the words the person would use. */
  does: string;
  /** The steps, in order, in plain language. */
  steps: string[];
  /** The toolbox steps it is made of, by label. */
  builtFrom: string[];
}

export interface GalleryRole {
  id: string;
  /** Lucide icon name. Must also be registered in components/lib/icons.ts. */
  icon: string;
  role: string;
  /** The routine this role will recognise. */
  routine: string;
  examples: GalleryExample[];
}

export const GALLERY_ROLES: GalleryRole[] = [
  {
    id: "everyday-work",
    icon: "sun",
    role: "Everyday work",
    routine: "The same ten clicks to get started every morning.",
    examples: [
      {
        name: "Start my workday",
        does: "Opens everything you open first thing, in one go.",
        steps: ["Open your mail and calendar", "Open your chat app", "Show today's folder"],
        builtFrom: ["Open Link", "Open App", "Open Folder"],
      },
      {
        name: "Join my next meeting",
        does: "Takes you straight to the call, with no hunting for the link.",
        steps: ["Open the meeting link", "Open your notes file"],
        builtFrom: ["Open Link", "Open File"],
      },
    ],
  },
  {
    id: "it-support",
    icon: "life-buoy",
    role: "IT and support",
    routine: "The fix you give out ten times a week.",
    examples: [
      {
        name: "My internet's playing up",
        does: "Clears the usual suspect, with one version for Windows and one for Mac.",
        steps: ["Flush the DNS cache on Windows", "Flush the DNS cache on a Mac"],
        builtFrom: ["Run Shell Script"],
      },
      {
        name: "Restart the print spooler",
        does: "Asks first, then gets the printer moving again.",
        steps: ["Ask first", "Restart the spooler as administrator"],
        builtFrom: ["Ask for Confirmation", "Run Shell Script"],
      },
    ],
  },
  {
    id: "client-work",
    icon: "briefcase",
    role: "Sales and client work",
    routine: "Everything about one client, scattered across four places.",
    examples: [
      {
        name: "Open a client",
        does: "Ask which client, then open their page and their shared folder.",
        steps: ["Choose a client from a list", "Open their page in your CRM", "Show their folder"],
        builtFrom: ["Choose from List", "Open Link", "Open Folder"],
      },
      {
        name: "Out of office",
        does: "Puts your reply on the clipboard, ready to paste anywhere.",
        steps: ["Copy your out-of-office reply"],
        builtFrom: ["Copy to Clipboard"],
      },
    ],
  },
  {
    id: "developers",
    icon: "terminal",
    role: "Developers",
    routine: "The command everyone has to look up, every time.",
    examples: [
      {
        name: "Open a project",
        does: "Pick a project and it opens in your editor.",
        steps: ["Choose a project from a list", "Run the command that opens it"],
        builtFrom: ["Choose from List", "Run Shell Script"],
      },
      {
        name: "Deploy to production",
        does: "Checks you mean it, proves it's you, then runs the release.",
        steps: ["Ask first", "Confirm Identity", "Run the deploy command", "Open the release page"],
        builtFrom: ["Ask for Confirmation", "Confirm Identity", "Run Shell Script", "Open Link"],
      },
    ],
  },
  {
    id: "managers",
    icon: "users",
    role: "Managers and team leads",
    routine: "The weekly ritual that takes longer than it should.",
    examples: [
      {
        name: "Friday wrap-up",
        does: "Opens the board and the report, and starts your update.",
        steps: ["Open the project board", "Open the weekly report", "Open a new email to the team"],
        builtFrom: ["Open Link", "Open File"],
      },
      {
        name: "Welcome a new starter",
        does: "Opens everything someone needs on their first morning.",
        steps: [
          "Open the wiki and handbook",
          "Open the team chat",
          "Show the shared onboarding folder",
        ],
        builtFrom: ["Open Link", "Open Folder"],
      },
    ],
  },
  {
    id: "creators",
    icon: "palette",
    role: "Designers and creators",
    routine: "Setting the scene before the real work can begin.",
    examples: [
      {
        name: "Start a new project",
        does: "Asks for a name, then gets your tools and a folder ready.",
        steps: ["Ask for the project name", "Open your design app", "Show the projects folder"],
        builtFrom: ["Ask for Input", "Open App", "Open Folder"],
      },
      {
        name: "Focus for an hour",
        does: "Opens just what you need and leaves a note for others.",
        steps: ["Open your notes", "Copy a 'heads down until 3' message"],
        builtFrom: ["Open File", "Copy to Clipboard"],
      },
    ],
  },
];

/**
 * Small, self-contained tricks: the "Try a trick" end of the Gallery. Each is
 * one or two steps, and each is something Zap can build as the app stands.
 */
export const GALLERY_TRICKS = [
  {
    name: "Email my manager that I'm off sick",
    does: "Opens an email that is already written and addressed. You just press Send.",
  },
  {
    name: "Put my reply on the clipboard",
    does: "One click and your usual answer is ready to paste anywhere.",
  },
  {
    name: "Open every page for one client",
    does: "Ask which client, and their pages and folders all open at once.",
  },
  {
    name: "Fix the printer",
    does: "Restart the part that jams, asking first so it never surprises you.",
  },
];
