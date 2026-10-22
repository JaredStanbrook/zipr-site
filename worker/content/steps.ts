export type StepStatus = "available" | "coming";

export interface Step {
  label: string;
  /** The snake_case id, as stored and shared. */
  id: string;
  /** Natural-language description of the step, with substitution slots. */
  sentence: string;
  status: StepStatus;
  /**
   * What the step does, in plain language, with no `{slots}`. This is what the
   * glossary shows. The `sentence` above is left alone because the app, parsing
   * and AI generation read it.
   */
  description?: string;
  /** One realistic use, written as a person would say it. Also free of `{slots}`. */
  example?: string;
}

export interface StepGroup {
  id: string;
  /** Canonical category name from the Action Model. */
  name: string;
  /** Lucide icon name, registered in components/lib/icons.ts. */
  icon: string;
  /** A short, outcome-focused description of the group. */
  holds: string;
  /** Shown collapsed on the page and marked as needing more know-how. */
  advanced?: boolean;
  steps: Step[];
}

const s = (label: string, id: string, sentence: string, status: StepStatus = "coming"): Step => ({
  label,
  id,
  sentence,
  status,
});

const now = "available" as const;

/**
 * Plain-language descriptions and examples, keyed by step id.
 *
 * Kept apart from the steps themselves so the Action Model's labels, ids and
 * sentence templates stay exactly as the app has them. The glossary shows these
 * instead of the templates; a step with no entry falls back to its sentence.
 * Examples are everyday, concrete and carry no `{placeholders}`.
 */
const DETAILS: Record<string, { description: string; example: string }> = {
  // Web
  open_webpage: {
    description: "Open a website in your browser.",
    example: "Open the team project board in Chrome.",
  },
  search_web: {
    description: "Search a site such as Google or Wikipedia for the words you choose.",
    example: "Search Wikipedia for Sydney Opera House.",
  },
  show_directions: {
    description: "Open a map with directions to a place.",
    example: "Get directions to the Melbourne office.",
  },

  // Email, Calls & Meetings
  create_email: {
    description:
      "Draft an email to your recipient about your chosen subject. It opens ready to review and never sends itself.",
    example: "Create an email to Alex about Friday's meeting.",
  },
  start_call: {
    description: "Start a call to a phone number.",
    example: "Call the front desk on 02 5550 0123.",
  },
  join_meeting: {
    description: "Open a meeting link in the right app.",
    example: "Join the weekly team meeting from its video link.",
  },
  open_chat: {
    description: "Open a chat with someone in your messaging app.",
    example: "Open a chat with Sam in Teams.",
  },
  connect_to_computer: {
    description: "Connect to another computer from yours.",
    example: "Connect to your office desktop from home.",
  },

  // Files & Folders
  open_file: {
    description: "Open a file in the app that normally opens it.",
    example: "Open this week's report.",
  },
  open_folder: {
    description: "Open a folder so you can see what's inside.",
    example: "Open your Downloads folder.",
  },
  show_in_folder: {
    description: "Open the folder that contains a file.",
    example: "Show invoice-march.pdf in its folder.",
  },
  select_file: {
    description: "Ask the person to pick a file to use in the next steps.",
    example: "Ask which spreadsheet to use.",
  },
  select_folder: {
    description: "Ask the person to pick a folder to use in the next steps.",
    example: "Ask which project folder to open.",
  },
  find_files: {
    description: "Search a folder for files by name and pass the matches to later steps.",
    example: "Find files named statement in Downloads.",
  },
  get_contents_of_folder: {
    description: "List everything inside a folder.",
    example: "Get everything in the Receipts folder.",
  },
  get_file_details: {
    description: "Look up a detail about a file, such as its size or when it changed.",
    example: "Get the date modified for budget.xlsx.",
  },
  create_folder: {
    description: "Make a new folder.",
    example: "Create a folder called March in Documents.",
  },
  move_files: {
    description: "Move files from one place to another.",
    example: "Move the statements you found to the March folder.",
  },
  copy_files: {
    description: "Copy files to another place, leaving the originals where they are.",
    example: "Copy the signed contract to the Archive folder.",
  },
  rename_files: {
    description: "Give files a new name.",
    example: "Rename the photos to include today's date.",
  },
  delete_files: {
    description: "Send files to the bin or trash. Nothing is deleted permanently.",
    example: "Move the old drafts to the bin.",
  },
  save_file: {
    description: "Save text or data as a file.",
    example: "Save the meeting notes as notes.txt in Documents.",
  },
  zip_files: {
    description: "Compress files into a single ZIP file.",
    example: "Zip the project files into project-backup.zip.",
  },
  unzip_file: {
    description: "Extract the contents of a ZIP file into a folder.",
    example: "Unzip photos.zip into your Pictures folder.",
  },

  // Apps & System
  open_app: {
    description: "Launch an app on your computer.",
    example: "Open Slack.",
  },
  quit_app: {
    description: "Close an app that's running.",
    example: "Close the video call app when the meeting ends.",
  },
  take_screenshot: {
    description: "Capture the whole screen, a window or a selected area.",
    example: "Take a screenshot of the window you're working in.",
  },
  set_volume: {
    description: "Set how loud your computer plays sound.",
    example: "Set your volume to 20% for a quiet office.",
  },
  set_appearance: {
    description: "Switch your computer between light and dark mode.",
    example: "Switch your computer to dark mode in the evening.",
  },
  set_do_not_disturb: {
    description: "Turn Do Not Disturb on or off.",
    example: "Turn on Do Not Disturb while you focus.",
  },
  lock_screen: {
    description: "Lock your computer so nobody else can use it.",
    example: "Lock your screen when you step away.",
  },
  get_device_details: {
    description: "Look up details about this computer, such as its operating system.",
    example: "Check whether this computer runs Windows or macOS.",
  },

  // Ask & Choose
  ask_for_input: {
    description: "Ask the person to type something, then use their answer in later steps.",
    example: "Ask for the name of the new project.",
  },
  ask_for_confirmation: {
    description: "Ask a yes-or-no question before carrying on.",
    example: "Ask “Are you ready to send this?”",
  },
  choose_from_list: {
    description: "Let the person pick an option from a list.",
    example: "Choose a client from Client A, Client B and Client C.",
  },
  choose_from_menu: {
    description: "Show a short menu and run different steps depending on what's chosen.",
    example: "Ask whether to open the weekly or the monthly report.",
  },
  confirm_identity: {
    description:
      "Ask the person to prove it's really them using their computer's sign-in, such as Windows Hello or Touch ID.",
    example: "Check it's really you before a risky step.",
  },

  // Text & Clipboard
  text: {
    description: "Write a piece of text to use in later steps.",
    example: "Write “Thanks for getting in touch” to use in a reply.",
  },
  combine_text: {
    description: "Join a list of items into one piece of text.",
    example: "Join a list of names into one line, separated by commas.",
  },
  split_text: {
    description: "Break a piece of text into a list wherever a separator appears.",
    example: "Split a list of email addresses at each comma.",
  },
  replace_text: {
    description: "Swap one piece of text for another.",
    example: "Replace Draft with Final in a file name.",
  },
  change_case: {
    description: "Change text to upper case, lower case or title case.",
    example: "Convert a heading to upper case.",
  },
  get_clipboard: {
    description: "Use whatever you last copied.",
    example: "Get the link you just copied.",
  },
  copy_to_clipboard: {
    description: "Copy text so you can paste it anywhere.",
    example: "Copy your out-of-office reply to your clipboard.",
  },

  // Lists & Data
  list: {
    description: "Make a list of things for later steps to work through.",
    example: "Create a list of Alex, Jordan and Taylor.",
  },
  get_item_from_list: {
    description: "Pick the first, last, random or a numbered entry from a list.",
    example: "Get the first file from the files you found.",
  },
  filter_list: {
    description: "Keep only the entries in a list that match a rule.",
    example: "Keep only files larger than 10 MB.",
  },
  sort_list: {
    description: "Put a list in order.",
    example: "Sort a list of files by date, newest first.",
  },
  count: {
    description: "Count how many entries are in a list.",
    example: "Count the files in a folder.",
  },
  get_value: {
    description: "Read one piece of information out of structured data.",
    example: "Get the customer's name from a record.",
  },

  // Dates & Numbers
  get_current_date: {
    description: "Get today's date to use in later steps.",
    example: "Get today's date for a file name.",
  },
  format_date: {
    description: "Show a date in the style you choose.",
    example: "Format today's date as 2026-03-14.",
  },
  adjust_date: {
    description: "Add or take away days, weeks, months or years from a date.",
    example: "Add 7 days to a due date.",
  },
  calculate: {
    description: "Work out a sum and use the answer in later steps.",
    example: "Calculate 15% of an invoice total.",
  },

  // Logic & Flow
  if: {
    description: "Do one thing when something is true, and something else when it isn't.",
    example: "If the file exists, open it; otherwise, create it.",
  },
  repeat: {
    description: "Run the same steps a set number of times.",
    example: "Repeat a reminder sound three times.",
  },
  repeat_with_each: {
    description: "Run the same steps once for every entry in a list.",
    example: "Open each file in a folder, one at a time.",
  },
  wait: {
    description: "Pause before the next step.",
    example: "Pause for 5 seconds before opening the next page.",
  },
  set_variable: {
    description: "Give a value a name so later steps can use it.",
    example: "Set Client to the name the person chose.",
  },
  run_shortcut: {
    description: "Run another shortcut from inside this one.",
    example: "Run your Start my workday shortcut at the end.",
  },
  stop_shortcut: {
    description: "End the shortcut at this point.",
    example: "Stop here if the person says no.",
  },
  comment: {
    description: "Leave a note for whoever reads the shortcut. It does nothing when run.",
    example: "Add a note explaining why a step is needed.",
  },

  // Show & Speak
  show_notification: {
    description: "Show a notification on your computer.",
    example: "Show a notification saying your backup has finished.",
  },
  show_result: {
    description: "Show text or data in a window you can read and close.",
    example: "Display the answer a step worked out.",
  },
  quick_look: {
    description: "Preview a file, image or text without opening an app.",
    example: "Preview a downloaded file before opening it.",
  },
  speak_text: {
    description: "Read text aloud using your computer's voice.",
    example: "Read “Time for a break” aloud.",
  },
  play_sound: {
    description: "Play a sound or an audio file.",
    example: "Play a chime when a long task finishes.",
  },

  // AI
  generate_text: {
    description: "Ask your connected AI model to write text from an instruction.",
    example: "Generate a friendly reminder email.",
  },
  summarise_text: {
    description: "Ask your connected AI model for a shorter version of some text.",
    example: "Summarise meeting notes into three bullet points.",
  },
  rewrite_text: {
    description: "Ask your connected AI model to say the same thing in a different tone.",
    example: "Rewrite a message in a friendlier tone.",
  },

  // Advanced
  open_link: {
    description:
      "Open any kind of link, such as a web address, an email link or a phone link, with whatever your computer uses for it.",
    example: "Open an email link that fills in a message for you.",
  },
  get_contents_of_url: {
    description: "Fetch information from a web address and use what comes back.",
    example: "Retrieve the latest status from a company status page.",
  },
  run_shell_script: {
    description: "Run a script on your computer and keep what it prints.",
    example: "Run a script that clears the cache.",
  },
  open_plugin_panel: {
    description: "Open a custom screen added by an installed plugin.",
    example: "Open the invoicing plugin's panel.",
  },
};

const RAW_GROUPS: StepGroup[] = [
  {
    id: "web",
    name: "Web",
    icon: "globe",
    holds: "Open websites, search for information and find your way.",
    steps: [
      s("Open Webpage", "open_webpage", "Open {url} in {browser}"),
      s("Search Web", "search_web", "Search {site} for {words}"),
      s("Show Directions", "show_directions", "Get directions to {place}"),
    ],
  },
  {
    id: "email-calls-meetings",
    name: "Email, Calls & Meetings",
    icon: "mail",
    holds: "Send emails, start calls, join meetings and connect to other computers.",
    steps: [
      s("Create Email", "create_email", 'Create an email to {to} about "{subject}"'),
      s("Start Call", "start_call", "Call {number}"),
      s("Join Meeting", "join_meeting", "Join the meeting at {link}"),
      s("Open Chat", "open_chat", "Open a chat with {person} in {app}"),
      s("Connect to Computer", "connect_to_computer", "Connect to {computer}"),
    ],
  },
  {
    id: "files-folders",
    name: "Files & Folders",
    icon: "folder",
    holds: "Find, open, organise, copy and save your files.",
    steps: [
      s("Open File", "open_file", "Open {file}", now),
      s("Open Folder", "open_folder", "Open the {folder} folder", now),
      s("Show in Folder", "show_in_folder", "Show {file} in its folder"),
      s("Select File", "select_file", "Choose a file", now),
      s("Select Folder", "select_folder", "Choose a folder", now),
      s("Find Files", "find_files", "Find files named {pattern} in {folder}"),
      s("Get Contents of Folder", "get_contents_of_folder", "Get the contents of {folder}"),
      s("Get File Details", "get_file_details", "Get the {detail} for {file}"),
      s("Create Folder", "create_folder", "Create a folder called {name} in {folder}"),
      s("Move Files", "move_files", "Move {files} to {folder}"),
      s("Copy Files", "copy_files", "Copy {files} to {folder}"),
      s("Rename Files", "rename_files", "Rename {files} to {name}"),
      s("Delete Files", "delete_files", "Move {files} to the bin"),
      s("Save File", "save_file", "Save {content} as {name} in {folder}"),
      s("Zip Files", "zip_files", "Compress {files} into a ZIP file named {name}"),
      s("Unzip File", "unzip_file", "Extract {file} into {folder}"),
    ],
  },
  {
    id: "apps-system",
    name: "Apps & System",
    icon: "layout-grid",
    holds: "Control your apps, adjust settings and capture your screen.",
    steps: [
      s("Open App", "open_app", "Open {app}", now),
      s("Quit App", "quit_app", "Close {app}"),
      s("Take Screenshot", "take_screenshot", "Capture a screenshot of {area}"),
      s("Set Volume", "set_volume", "Set your volume to {level}"),
      s("Set Appearance", "set_appearance", "Switch your computer to {light/dark} mode"),
      s("Set Do Not Disturb", "set_do_not_disturb", "Turn Do Not Disturb {on/off}"),
      s("Lock Screen", "lock_screen", "Lock your computer screen"),
      s("Get Device Details", "get_device_details", "Get the {detail} of this computer"),
    ],
  },
  {
    id: "ask-choose",
    name: "Ask & Choose",
    icon: "circle-help",
    holds: "Ask questions, collect answers and let people choose what happens next.",
    steps: [
      s("Ask for Input", "ask_for_input", "Ask the user for {prompt}", now),
      s(
        "Ask for Confirmation",
        "ask_for_confirmation",
        'Ask the user to confirm: "{question}"',
        now,
      ),
      s("Choose from List", "choose_from_list", "Choose an item from {list}", now),
      s(
        "Choose from Menu",
        "choose_from_menu",
        "Ask the user to choose what to do: {options}",
        now,
      ),
      s("Confirm Identity", "confirm_identity", "Verify the user's identity", now),
    ],
  },
  {
    id: "text-clipboard",
    name: "Text & Clipboard",
    icon: "type",
    holds: "Create, transform and reuse text wherever you need it.",
    steps: [
      s("Text", "text", 'Use the text "{text}"'),
      s("Combine Text", "combine_text", "Combine {list} using {separator}"),
      s("Split Text", "split_text", "Split {text} wherever {separator} appears"),
      s("Replace Text", "replace_text", 'Replace "{find}" with "{replace}" in {text}'),
      s("Change Case", "change_case", "Convert {text} to {case} case"),
      s("Get Clipboard", "get_clipboard", "Get the current clipboard contents"),
      s("Copy to Clipboard", "copy_to_clipboard", "Copy {content} to your clipboard", now),
    ],
  },
  {
    id: "lists-data",
    name: "Lists & Data",
    icon: "list-checks",
    holds: "Build lists, organise information and find the data you need.",
    steps: [
      s("List", "list", "Create a list containing {items}"),
      s(
        "Get Item from List",
        "get_item_from_list",
        "Get the {first/last/nth/random/range} item(s) from {list}",
      ),
      s("Filter List", "filter_list", "Keep only items in {list} that match {condition}"),
      s("Sort List", "sort_list", "Sort {list} by {field} in {order} order"),
      s("Count", "count", "Count the items in {list}"),
      s("Get Value", "get_value", "Get the value of {key} from {data}"),
    ],
  },
  {
    id: "dates-numbers",
    name: "Dates & Numbers",
    icon: "calendar",
    holds: "Work with dates, adjust time periods and perform calculations.",
    steps: [
      s("Get Current Date", "get_current_date", "Get today's date"),
      s("Format Date", "format_date", "Format {date} as {format}"),
      s("Adjust Date", "adjust_date", "Add {amount} {unit} to {date}"),
      s("Calculate", "calculate", "Calculate the result of {expression}"),
    ],
  },
  {
    id: "logic-flow",
    name: "Logic & Flow",
    icon: "git-branch",
    holds: "Add decisions, repeat tasks and control how your shortcuts run.",
    steps: [
      s("If", "if", "If {condition}, do this; otherwise, do that", now),
      s("Repeat", "repeat", "Repeat these steps {n} times", now),
      s("Repeat with Each", "repeat_with_each", "Repeat these steps for each item in {list}", now),
      s("Wait", "wait", "Pause for {duration}"),
      s("Set Variable", "set_variable", "Set {name} to {value}"),
      s("Run Shortcut", "run_shortcut", "Run the {shortcut} shortcut"),
      s("Stop Shortcut", "stop_shortcut", "Stop running the shortcut"),
      s("Comment", "comment", 'Add a note: "{text}"'),
    ],
  },
  {
    id: "show-speak",
    name: "Show & Speak",
    icon: "volume-2",
    holds: "Show results, display notifications, preview files and speak text aloud.",
    steps: [
      s("Show Notification", "show_notification", 'Show a notification titled "{title}"'),
      s("Show Result", "show_result", "Display {content}"),
      s("Quick Look", "quick_look", "Preview {content}"),
      s("Speak Text", "speak_text", 'Read "{text}" aloud'),
      s("Play Sound", "play_sound", "Play the sound {sound}"),
    ],
  },
  {
    id: "ai",
    name: "AI",
    icon: "sparkles",
    holds: "Generate, summarise and rewrite text with your connected AI model.",
    steps: [
      s("Generate Text", "generate_text", 'Generate text using the instruction "{instruction}"'),
      s("Summarise Text", "summarise_text", "Summarise {text}"),
      s("Rewrite Text", "rewrite_text", "Rewrite {text} in a {tone} tone"),
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    icon: "terminal",
    holds: "Work with URLs, run scripts and access advanced integrations.",
    advanced: true,
    steps: [
      s("Open Link", "open_link", "Open the link {link}", now),
      s("Get Contents of URL", "get_contents_of_url", "Retrieve the contents of {url}"),
      s("Run Shell Script", "run_shell_script", 'Run the script "{script}"', now),
      s("Open Plugin Panel", "open_plugin_panel", "Open the {plugin} plugin panel", now),
    ],
  },
  {
    id: "plugins",
    name: "Plugins",
    icon: "puzzle",
    holds: "Extend your shortcuts with steps from installed plugins.",
    steps: [],
  },
];

/** The groups with each step's description and example attached. */
export const STEP_GROUPS: StepGroup[] = RAW_GROUPS.map((group) => ({
  ...group,
  steps: group.steps.map((step) => ({ ...step, ...DETAILS[step.id] })),
}));

export const ALL_STEPS_COUNT = STEP_GROUPS.reduce((n, group) => n + group.steps.length, 0);
