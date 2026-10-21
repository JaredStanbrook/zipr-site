
 // worker/content/steps.ts
//
// The toolbox: every step is a shortcut that can be built from,
// grouped as the app groups them.
//
// Source: the client's `docs/Action Model.md` — §24 for the categories and
// §25–§37 for the steps. Labels, ids and sentences should remain consistent
// with the Action Model. The customer-facing word for one of these is a
// *step*; "action" stays in the implementation (brand guide §1).
//
// The model describes the whole library, and the app is being built in waves
// (the client's planning/ROADMAP.md). So each step carries a `status`, and
// the site says so on every step rather than listing a catalogue as if it all
// shipped:
//
//   available — the app can run it today. Verified against the client's
//               built-in registry (`action_registry.rs`) and the block types
//               built in U13 (If, Choose from Menu, Repeat, Repeat with Each).
//   coming    — specified in the Action Model, not in the app yet.
//
// When a wave ships, flip its steps to `available` here and nowhere else.
// Do not mark a step available because it is in the model.
//
// Copy guidelines:
//   - Keep canonical category names, labels and IDs stable.
//   - Write category descriptions in plain, outcome-focused language.
//   - Make sentences natural, concise and easy to understand.
//   - Keep placeholders intact so existing consumers can substitute values.
//   - Preserve verified availability statuses.

export type StepStatus = "available" | "coming";

export interface Step {
  label: string;
  /** The snake_case id, as stored and shared. */
  id: string;
  /** How it reads aloud, with {slots}. Kept in English: it is the app's own text. */
  sentence: string;
  status: StepStatus;
}

export interface StepGroup {
  id: string;
  /** The model's category name, kept in English on every page for the same reason. */
  name: string;
  /** Lucide icon name. Must also be registered in components/lib/icons.ts. */
  icon: string;
  /** A short, outcome-focused description of what the group helps people do. */
  holds: string;
  /** Shown collapsed on the page and marked as needing more know-how. */
  advanced?: boolean;
  steps: Step[];
}

const s = (
  label: string,
  id: string,
  sentence: string,
  status: StepStatus = "coming",
): Step => ({
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
    holds:
      "Send emails, start calls, join meetings and connect to other computers.",
    steps: [
      s(
        "Create Email",
        "create_email",
        'Create an email to {to} about "{subject}"',
      ),
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
      s(
        "Get Contents of Folder",
        "get_contents_of_folder",
        "Get the contents of {folder}",
      ),
      s("Get File Details", "get_file_details", "Get the {detail} for {file}"),
      s(
        "Create Folder",
        "create_folder",
        "Create a folder called {name} in {folder}",
      ),
      s("Move Files", "move_files", "Move {files} to {folder}"),
      s("Copy Files", "copy_files", "Copy {files} to {folder}"),
      s("Rename Files", "rename_files", "Rename {files} to {name}"),
      s("Delete Files", "delete_files", "Move {files} to the bin"),
      s(
        "Save File",
        "save_file",
        "Save {content} as {name} in {folder}",
      ),
      s("Zip Files", "zip_files", "Zip {files} into {name}"),
      s("Unzip File", "unzip_file", "Unzip {file} into {folder}"),
    ],
  },
  {
    id: "apps-system",
    name: "Apps & System",
    icon: "layout-grid",
    holds: "Control your apps, adjust settings and capture your screen.",
    steps: [
      s("Open App", "open_app", "Open {app}", now),
      s("Quit App", "quit_app", "Quit {app}"),
      s("Take Screenshot", "take_screenshot", "Take a screenshot of {area}"),
      s("Set Volume", "set_volume", "Set the volume to {level}"),
      s("Set Appearance", "set_appearance", "Switch to {light/dark} mode"),
      s(
        "Set Do Not Disturb",
        "set_do_not_disturb",
        "Turn Do Not Disturb {on/off}",
      ),
      s("Lock Screen", "lock_screen", "Lock the screen"),
      s(
        "Get Device Details",
        "get_device_details",
        "Get the {detail} of this computer",
      ),
    ],
  },
  {
    id: "ask-choose",
    name: "Ask & Choose",
    icon: "circle-help",
    holds:
      "Ask questions, collect answers and let people choose what happens next.",
    steps: [
      s("Ask for Input", "ask_for_input", "Ask for {prompt}", now),
      s(
        "Ask for Confirmation",
        "ask_for_confirmation",
        'Ask "{question}"',
        now,
      ),
      s("Choose from List", "choose_from_list", "Choose from {list}", now),
      s(
        "Choose from Menu",
        "choose_from_menu",
        "Ask which to do: {options}",
        now,
      ),
      s("Confirm Identity", "confirm_identity", "Check it's really me", now),
    ],
  },
  {
    id: "text-clipboard",
    name: "Text & Clipboard",
    icon: "type",
    holds: "Create, transform and reuse text wherever you need it.",
    steps: [
      s("Text", "text", 'Text: "{text}"'),
      s("Combine Text", "combine_text", "Combine {list} with {separator}"),
      s("Split Text", "split_text", "Split {text} by {separator}"),
      s(
        "Replace Text",
        "replace_text",
        'Replace "{find}" with "{replace}" in {text}',
      ),
      s("Change Case", "change_case", "Change {text} to {case}"),
      s("Get Clipboard", "get_clipboard", "Get the current clipboard contents"),
      s(
        "Copy to Clipboard",
        "copy_to_clipboard",
        "Copy {content} to the clipboard",
        now,
      ),
    ],
  },
  {
    id: "lists-data",
    name: "Lists & Data",
    icon: "list-checks",
    holds: "Build lists, organise information and find the data you need.",
    steps: [
      s("List", "list", "List: {items}"),
      s(
        "Get Item from List",
        "get_item_from_list",
        "Get the {first/last/nth/random/range} item(s) from {list}",
      ),
      s("Filter List", "filter_list", "Keep items in {list} where {condition}"),
      s("Sort List", "sort_list", "Sort {list} by {field} {order}"),
      s("Count", "count", "Count the items in {list}"),
      s("Get Value", "get_value", "Get {key} from {data}"),
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
      s("Calculate", "calculate", "Calculate {expression}"),
    ],
  },
  {
    id: "logic-flow",
    name: "Logic & Flow",
    icon: "git-branch",
    holds: "Add decisions, repeat tasks and control how your workflows run.",
    steps: [
      s("If", "if", "If {condition}, do this; otherwise, do that", now),
      s("Repeat", "repeat", "Repeat {n} times", now),
      s(
        "Repeat with Each",
        "repeat_with_each",
        "Repeat for each item in {list}",
        now,
      ),
      s("Wait", "wait", "Wait {duration}"),
      s("Set Variable", "set_variable", "Set {name} to {value}"),
      s("Run Shortcut", "run_shortcut", "Run the {shortcut} shortcut"),
      s("Stop Shortcut", "stop_shortcut", "Stop here"),
      s("Comment", "comment", 'Note: "{text}"'),
    ],
  },
  {
    id: "show-speak",
    name: "Show & Speak",
    icon: "volume-2",
    holds:
      "Show results, display notifications, preview files and speak text aloud.",
    steps: [
      s(
        "Show Notification",
        "show_notification",
        'Show a notification titled "{title}"',
      ),
      s("Show Result", "show_result", "Show {content}"),
      s("Quick Look", "quick_look", "Preview {content}"),
      s("Speak Text", "speak_text", 'Say "{text}"'),
      s("Play Sound", "play_sound", "Play {sound}"),
    ],
  },
  {
    id: "ai",
    name: "AI",
    icon: "sparkles",
    holds:
      "Generate, summarise and rewrite text with your connected AI model.",
    steps: [
      s(
        "Generate Text",
        "generate_text",
        'Generate text using "{instruction}"',
      ),
      s("Summarise Text", "summarise_text", "Summarise {text}"),
      s("Rewrite Text", "rewrite_text", "Rewrite {text} in a {tone} tone"),
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    icon: "terminal",
    holds:
      "Work with URLs, run scripts and access advanced integrations.",
    advanced: true,
    steps: [
      s("Open Link", "open_link", "Open {link}", now),
      s(
        "Get Contents of URL",
        "get_contents_of_url",
        "Get the contents of {url}",
      ),
      s("Run Shell Script", "run_shell_script", 'Run the script "{script}"', now),
      s("Open Plugin Panel", "open_plugin_panel", "Open the {plugin} panel", now),
    ],
  },
  {
    id: "plugins",
    name: "Plugins",
    icon: "puzzle",
    holds: "Extend your workflows with steps from installed plugins.",
    steps: [],
  },
];

export const ALL_STEPS_COUNT = STEP_GROUPS.reduce(
  (n, group) => n + group.steps.length,
  0,
);
