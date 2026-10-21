export type StepStatus = "available" | "coming";

export interface Step {
  label: string;
  /** The snake_case id, as stored and shared. */
  id: string;
  /** Natural-language description of the step, with substitution slots. */
  sentence: string;
  status: StepStatus;
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

export const STEP_GROUPS: StepGroup[] = [
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

export const ALL_STEPS_COUNT = STEP_GROUPS.reduce((n, group) => n + group.steps.length, 0);
