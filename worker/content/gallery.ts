// worker/content/gallery.ts
//
// The Gallery: real shortcut ideas, organised around the work people do.
//
// The Gallery is the website's showcase, not a shortcut library. Entries
// demonstrate what someone could build from Zipr's existing toolbox.
// Nothing is published, downloaded or installed from the site.
//
// Each example includes:
//   - name: a recognisable task.
//   - does: the outcome, in plain language.
//   - builtFrom: canonical toolbox step labels, in execution order.
//   - recipe: the actual toolbox steps with realistic example sentences.
//
// The recipe is the source of truth for the visual shortcut preview.
// Do not maintain a separate `steps` array: the recipe already contains
// the ordered steps and their sentences.
//
// Gallery examples must use steps verified as available in the toolbox.
// Do not imply that Zipr has an integration, external service, or capability
// that has not been implemented.
//
// When the toolbox changes, update this Gallery to match it.

export interface GalleryRecipeStep {
  /** Exact canonical label from the toolbox. */
  action: string;
  /** The step's sentence, shown with example values substituted. */
  sentence: string;
}

export interface GalleryExample {
  name: string;
  /** What the shortcut achieves, in the user's language. */
  does: string;
  /** Canonical toolbox labels, in execution order. */
  builtFrom: string[];
  /** A readable preview of the actual shortcut recipe. */
  recipe: GalleryRecipeStep[];
}

export interface GalleryRole {
  id: string;
  /** Lucide icon name. Must also be registered in components/lib/icons.ts. */
  icon: string;
  role: string;
  /** A routine or frustration this audience will recognise. */
  routine: string;
  examples: GalleryExample[];
}

export interface GalleryTrick {
  name: string;
  does: string;
  builtFrom: string[];
  recipe: GalleryRecipeStep[];
}

export const GALLERY_ROLES: GalleryRole[] = [
  {
    id: "everyday-work",
    icon: "sun",
    role: "Everyday productivity",
    routine: "Get from switching on your computer to actually getting work done.",
    examples: [
      {
        name: "Start my workday",
        does: "Set up your workspace in one run. Open your essential apps, notes and working folder without hunting through your computer.",
        builtFrom: ["Open App", "Open File", "Open Folder"],
        recipe: [
          {
            action: "Open App",
            sentence: "Open Slack",
          },
          {
            action: "Open File",
            sentence: "Open daily-notes.md",
          },
          {
            action: "Open Folder",
            sentence: "Open the Today's Work folder",
          },
        ],
      },
      {
        name: "Focus mode, ready",
        does: "Open the tools you need, turn on Do Not Disturb, and copy a focus message ready to share.",
        builtFrom: ["Open App", "Set Do Not Disturb", "Copy to Clipboard"],
        recipe: [
          {
            action: "Open App",
            sentence: "Open Visual Studio Code",
          },
          {
            action: "Set Do Not Disturb",
            sentence: "Turn Do Not Disturb on",
          },
          {
            action: "Copy to Clipboard",
            sentence:
              "Copy I'm focusing until 3 PM. I'll get back to you afterwards. to your clipboard",
          },
        ],
      },
      {
        name: "Pick up where I left off",
        does: "Choose a project and reopen its notes, folder and workspace. Useful when you regularly switch between projects.",
        builtFrom: ["Choose from List", "Open Folder", "Open File", "Open App"],
        recipe: [
          {
            action: "Choose from List",
            sentence: "Choose an item from Client A, Website Redesign, Internal Tools",
          },
          {
            action: "Open Folder",
            sentence: "Open the Website Redesign folder",
          },
          {
            action: "Open File",
            sentence: "Open website-redesign-notes.md",
          },
          {
            action: "Open App",
            sentence: "Open Figma",
          },
        ],
      },
    ],
  },
  {
    id: "it-support",
    icon: "life-buoy",
    role: "IT and service desk",
    routine: "Turn repeatable troubleshooting into a consistent, deliberate shortcut.",
    examples: [
      {
        name: "Run a network diagnostic",
        does: "Choose a diagnostic and run the corresponding approved script. Keep your common checks in one place.",
        builtFrom: ["Choose from Menu", "Run Shell Script", "Show Result"],
        recipe: [
          {
            action: "Choose from Menu",
            sentence:
              "Ask the user to choose what to do: Check DNS, Check connectivity, Show IP configuration",
          },
          {
            action: "Run Shell Script",
            sentence: 'Run the script "approved-network-diagnostic.sh"',
          },
          {
            action: "Show Result",
            sentence: "Display Network diagnostic finished. Review the output before proceeding.",
          },
        ],
      },
      {
        name: "Confirm before a system change",
        does: "Build a checkpoint before running a maintenance script. Configure and verify the script for the target system.",
        builtFrom: ["Ask for Confirmation", "Run Shell Script", "Show Result"],
        recipe: [
          {
            action: "Ask for Confirmation",
            sentence:
              'Ask the user to confirm: "Run the approved maintenance script on this computer?"',
          },
          {
            action: "Run Shell Script",
            sentence: 'Run the script "maintenance-check.sh"',
          },
          {
            action: "Show Result",
            sentence:
              "Display Maintenance script finished. Check its output to confirm the result.",
          },
        ],
      },
      {
        name: "Open a support case workspace",
        does: "Choose a support category and open the relevant troubleshooting guide, ticketing page and notes.",
        builtFrom: ["Choose from List", "Open File", "Open Link", "Open File"],
        recipe: [
          {
            action: "Choose from List",
            sentence: "Choose an item from Network, Printing, Account access, Hardware",
          },
          {
            action: "Open File",
            sentence: "Open network-troubleshooting.md",
          },
          {
            action: "Open Link",
            sentence: "Open the link https://support.example.com",
          },
          {
            action: "Open File",
            sentence: "Open support-case-notes.md",
          },
        ],
      },
    ],
  },
  {
    id: "files-and-organisation",
    icon: "folder",
    role: "Files and organisation",
    routine:
      "Stop repeating the same file-management chores and searching for things you just had open.",
    examples: [
      {
        name: "Create a project workspace",
        does: "Ask for a project name, run a configured script to create its folder structure, and open the workspace.",
        builtFrom: ["Ask for Input", "Run Shell Script", "Open Folder"],
        recipe: [
          {
            action: "Ask for Input",
            sentence: "Ask the user for the project name",
          },
          {
            action: "Run Shell Script",
            sentence: 'Run the script "create-project-workspace.sh"',
          },
          {
            action: "Open Folder",
            sentence: "Open the New Project folder",
          },
        ],
      },
      {
        name: "Open my daily handover",
        does: "Open your handover notes and supporting files folder, ready for the next person to pick up.",
        builtFrom: ["Open File", "Open Folder"],
        recipe: [
          {
            action: "Open File",
            sentence: "Open daily-handover.md",
          },
          {
            action: "Open Folder",
            sentence: "Open the Handover Attachments folder",
          },
        ],
      },
      {
        name: "Tidy a batch of downloads",
        does: "Choose a cleanup routine and run a configured script to sort or archive downloads. Review the script before use.",
        builtFrom: ["Choose from Menu", "Ask for Confirmation", "Run Shell Script"],
        recipe: [
          {
            action: "Choose from Menu",
            sentence:
              "Ask the user to choose what to do: Sort downloads, Archive old files, Preview cleanup",
          },
          {
            action: "Ask for Confirmation",
            sentence: 'Ask the user to confirm: "Proceed with the selected downloads cleanup?"',
          },
          {
            action: "Run Shell Script",
            sentence: 'Run the script "organise-downloads.sh"',
          },
        ],
      },
    ],
  },
  {
    id: "developers",
    icon: "terminal",
    role: "Developers and technical teams",
    routine:
      "Replace repeated setup commands and scattered project links with a repeatable launch sequence.",
    examples: [
      {
        name: "Open a project",
        does: "Choose a project and open its workspace, notes and development tools.",
        builtFrom: ["Choose from List", "Open Folder", "Open App", "Open File"],
        recipe: [
          {
            action: "Choose from List",
            sentence: "Choose an item from API Service, Website, Mobile App",
          },
          {
            action: "Open Folder",
            sentence: "Open the API Service folder",
          },
          {
            action: "Open App",
            sentence: "Open Visual Studio Code",
          },
          {
            action: "Open File",
            sentence: "Open README.md",
          },
        ],
      },
      {
        name: "Run a local development task",
        does: "Choose a predefined task and run its configured script. Use it for repeatable local tasks, not an unreviewed production deployment.",
        builtFrom: ["Choose from Menu", "Ask for Confirmation", "Run Shell Script", "Show Result"],
        recipe: [
          {
            action: "Choose from Menu",
            sentence:
              "Ask the user to choose what to do: Run tests, Start development server, Check formatting",
          },
          {
            action: "Ask for Confirmation",
            sentence: 'Ask the user to confirm: "Run the selected development task?"',
          },
          {
            action: "Run Shell Script",
            sentence: 'Run the script "run-development-task.sh"',
          },
          {
            action: "Show Result",
            sentence: "Display Task finished. Review the terminal output for errors.",
          },
        ],
      },
      {
        name: "Open the right documentation",
        does: "Choose a topic and open the matching documentation page and local reference file.",
        builtFrom: ["Choose from List", "Open Link", "Open File"],
        recipe: [
          {
            action: "Choose from List",
            sentence: "Choose an item from API authentication, Deployment, Troubleshooting",
          },
          {
            action: "Open Link",
            sentence: "Open the link https://docs.example.com",
          },
          {
            action: "Open File",
            sentence: "Open developer-reference.md",
          },
        ],
      },
    ],
  },
  {
    id: "writing-and-ai",
    icon: "file-text",
    role: "Writing and AI",
    routine: "Get from a blank page to a useful first draft without starting from scratch.",
    examples: [
      {
        name: "Prepare a reusable response",
        does: "Choose a response type and copy a prepared template to your clipboard, ready to personalise and send.",
        builtFrom: ["Choose from List", "Copy to Clipboard"],
        recipe: [
          {
            action: "Choose from List",
            sentence: "Choose an item from Request received, Need more information, Issue resolved",
          },
          {
            action: "Copy to Clipboard",
            sentence:
              "Copy Thanks for getting in touch. I'll review this and follow up with you shortly. to your clipboard",
          },
        ],
      },
      {
        name: "Start a writing session",
        does: "Open your writing app, notes and reference material so everything is ready before you begin.",
        builtFrom: ["Open App", "Open File", "Open Folder"],
        recipe: [
          {
            action: "Open App",
            sentence: "Open Microsoft Word",
          },
          {
            action: "Open File",
            sentence: "Open article-draft.docx",
          },
          {
            action: "Open Folder",
            sentence: "Open the Research folder",
          },
        ],
      },
      {
        name: "Prepare a meeting summary",
        does: "Open your meeting notes and summary document, then copy a reusable outline. This prepares the workspace without claiming to transcribe or summarise the meeting automatically.",
        builtFrom: ["Open File", "Open File", "Copy to Clipboard"],
        recipe: [
          {
            action: "Open File",
            sentence: "Open meeting-notes.md",
          },
          {
            action: "Open File",
            sentence: "Open meeting-summary.docx",
          },
          {
            action: "Copy to Clipboard",
            sentence: "Copy Decisions, Action items, Owners, Deadlines to your clipboard",
          },
        ],
      },
    ],
  },
  {
    id: "managers-and-teams",
    icon: "users",
    role: "Managers and team leads",
    routine:
      "Prepare for recurring meetings and handovers without rebuilding your workspace every week.",
    examples: [
      {
        name: "Friday wrap-up",
        does: "Open your project board, weekly report and team update draft so you can close out the week.",
        builtFrom: ["Open Link", "Open File", "Open File"],
        recipe: [
          {
            action: "Open Link",
            sentence: "Open the link https://projects.example.com",
          },
          {
            action: "Open File",
            sentence: "Open weekly-report.docx",
          },
          {
            action: "Open File",
            sentence: "Open team-update-draft.docx",
          },
        ],
      },
      {
        name: "Prepare a new starter's workspace",
        does: "Open the onboarding handbook, team resources and chat app for a consistent first-day setup.",
        builtFrom: ["Open File", "Open Folder", "Open App"],
        recipe: [
          {
            action: "Open File",
            sentence: "Open onboarding-handbook.pdf",
          },
          {
            action: "Open Folder",
            sentence: "Open the Team Resources folder",
          },
          {
            action: "Open App",
            sentence: "Open Slack",
          },
        ],
      },
      {
        name: "Start a one-to-one meeting",
        does: "Choose a team member and open your meeting notes and discussion guide before the meeting starts.",
        builtFrom: ["Choose from List", "Open File", "Open File"],
        recipe: [
          {
            action: "Choose from List",
            sentence: "Choose an item from Alex, Jordan, Taylor",
          },
          {
            action: "Open File",
            sentence: "Open one-to-one-notes.md",
          },
          {
            action: "Open File",
            sentence: "Open one-to-one-agenda.md",
          },
        ],
      },
    ],
  },
  {
    id: "design-and-creative",
    icon: "palette",
    role: "Designers and creators",
    routine: "Spend less time preparing your workspace and more time making things.",
    examples: [
      {
        name: "Start a design project",
        does: "Ask for a project name, open your design tool and bring up the folder where project files live.",
        builtFrom: ["Ask for Input", "Open App", "Open Folder"],
        recipe: [
          {
            action: "Ask for Input",
            sentence: "Ask the user for the project name",
          },
          {
            action: "Open App",
            sentence: "Open Figma",
          },
          {
            action: "Open Folder",
            sentence: "Open the Design Projects folder",
          },
        ],
      },
      {
        name: "Review design references",
        does: "Open your reference board, design files and inspiration folder in a single sequence.",
        builtFrom: ["Open Link", "Open File", "Open Folder"],
        recipe: [
          {
            action: "Open Link",
            sentence: "Open the link https://design.example.com/references",
          },
          {
            action: "Open File",
            sentence: "Open current-design.fig",
          },
          {
            action: "Open Folder",
            sentence: "Open the Inspiration folder",
          },
        ],
      },
      {
        name: "Copy a project status update",
        does: "Put a reusable project update template on your clipboard before you send it to your team.",
        builtFrom: ["Copy to Clipboard", "Open App"],
        recipe: [
          {
            action: "Copy to Clipboard",
            sentence:
              "Copy Progress: [update]. Next: [next step]. Blockers: [none or details]. to your clipboard",
          },
          {
            action: "Open App",
            sentence: "Open Slack",
          },
        ],
      },
    ],
  },
  {
    id: "personal-workflows",
    icon: "coffee",
    role: "Personal routines",
    routine: "Automate the little computer tasks that interrupt your day.",
    examples: [
      {
        name: "Plan an evening",
        does: "Choose an activity and open your planning notes and a relevant website.",
        builtFrom: ["Choose from List", "Open File", "Open Link"],
        recipe: [
          {
            action: "Choose from List",
            sentence: "Choose an item from Dinner, Movie night, Weekend trip",
          },
          {
            action: "Open File",
            sentence: "Open personal-plans.md",
          },
          {
            action: "Open Link",
            sentence: "Open the link https://example.com",
          },
        ],
      },
      {
        name: "Take a proper break",
        does: "Confirm you're ready for a break, open your preferred break activity and copy a reminder for later.",
        builtFrom: ["Ask for Confirmation", "Open Link", "Copy to Clipboard"],
        recipe: [
          {
            action: "Ask for Confirmation",
            sentence: 'Ask the user to confirm: "Ready to take a short break?"',
          },
          {
            action: "Open Link",
            sentence: "Open the link https://example.com",
          },
          {
            action: "Copy to Clipboard",
            sentence: "Copy Break finished — time to return to my next task. to your clipboard",
          },
        ],
      },
    ],
  },
];

/**
 * Small, self-contained ideas: the "Try a trick" end of the Gallery.
 *
 * Tricks demonstrate useful combinations of toolbox steps. They are
 * examples of workflows, not prebuilt shortcuts or integrations.
 */
export const GALLERY_TRICKS: GalleryTrick[] = [
  {
    name: "Copy a polished reply",
    does: "Choose a common response and copy its template to your clipboard, ready to personalise.",
    builtFrom: ["Choose from List", "Copy to Clipboard"],
    recipe: [
      {
        action: "Choose from List",
        sentence:
          "Choose an item from Thanks, I'll look into this, Could you provide more details?, This is now resolved",
      },
      {
        action: "Copy to Clipboard",
        sentence:
          "Copy Thanks for the update. I'll review this and get back to you shortly. to your clipboard",
      },
    ],
  },
  {
    name: "Open a complete client workspace",
    does: "Choose a client, then open the relevant project page, working folder and notes.",
    builtFrom: ["Choose from List", "Open Link", "Open Folder", "Open File"],
    recipe: [
      {
        action: "Choose from List",
        sentence: "Choose an item from Client A, Client B, Client C",
      },
      {
        action: "Open Link",
        sentence: "Open the link https://clients.example.com",
      },
      {
        action: "Open Folder",
        sentence: "Open the Client A folder",
      },
      {
        action: "Open File",
        sentence: "Open client-notes.md",
      },
    ],
  },
  {
    name: "Run a task with a safety check",
    does: "Ask for confirmation before running a configured script. Confirmation is a checkpoint, not a substitute for validating the script itself.",
    builtFrom: ["Ask for Confirmation", "Run Shell Script"],
    recipe: [
      {
        action: "Ask for Confirmation",
        sentence: 'Ask the user to confirm: "Are you sure you want to run this task?"',
      },
      {
        action: "Run Shell Script",
        sentence: 'Run the script "approved-task.sh"',
      },
    ],
  },
  {
    name: "Open your daily essentials",
    does: "Launch your main app, daily notes and current working folder with one shortcut.",
    builtFrom: ["Open App", "Open File", "Open Folder"],
    recipe: [
      {
        action: "Open App",
        sentence: "Open Slack",
      },
      {
        action: "Open File",
        sentence: "Open daily-notes.md",
      },
      {
        action: "Open Folder",
        sentence: "Open the Today's Work folder",
      },
    ],
  },
  {
    name: "Choose what happens next",
    does: "Present a menu of predefined tasks, then use the selection to decide what runs next.",
    builtFrom: ["Choose from Menu", "If"],
    recipe: [
      {
        action: "Choose from Menu",
        sentence:
          "Ask the user to choose what to do: Open project, Run diagnostics, Prepare a reply",
      },
      {
        action: "If",
        sentence: "If a task is selected, do this; otherwise, do that",
      },
    ],
  },
  {
    name: "Repeat a routine",
    does: "Use a repeat block for a routine that needs to run several times. Configure the work to be repeated inside the loop.",
    builtFrom: ["Repeat"],
    recipe: [
      {
        action: "Repeat",
        sentence: "Repeat these steps 3 times",
      },
    ],
  },
];
