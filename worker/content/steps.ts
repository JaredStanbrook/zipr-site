// worker/content/steps.ts
//
// The toolbox: every step a shortcut can be built from, grouped as the app
// groups them.
//
// Source: the client's `docs/Action Model.md` — §24 for the categories and
// §25–§37 for the steps. Labels, ids and sentences are copied from it
// exactly, because the model's own rule is that a name is the same on the
// website, in the app and in the docs. The customer-facing word for one of
// these is a *step*; "action" stays in the implementation (brand guide §1).
//
// The model describes the whole library, and the app is being built in waves
// (the client's planning/ROADMAP.md). So each step carries a `status`, and the
// site says so on every step rather than listing a catalogue as if it all
// shipped:
//
//   available — the app can run it today. Verified against the client's
//               built-in registry (`action_registry.rs`) and the block types
//               built in U13 (If, Choose from Menu, Repeat, Repeat with Each).
//   coming    — specified in the Action Model, not in the app yet.
//
// When a wave ships, flip its steps to `available` here and nowhere else.
// Do not mark a step available because it is in the model.

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
  /** What the group holds, in plain words. */
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
    holds: "Open a page, search, or get directions.",
    steps: [
      s("Open Webpage", "open_webpage", "open {url} in {browser}"),
      s("Search Web", "search_web", "search {site} for {words}"),
      s("Show Directions", "show_directions", "show directions to {place}"),
    ],
  },
  {
    id: "email-calls-meetings",
    name: "Email, Calls & Meetings",
    icon: "mail",
    holds: "Write an email, call someone, join a meeting, or connect to another computer.",
    steps: [
      s("Create Email", "create_email", 'create an email to {to} about "{subject}"'),
      s("Start Call", "start_call", "call {number}"),
      s("Join Meeting", "join_meeting", "join the meeting at {link}"),
      s("Open Chat", "open_chat", "open a chat with {person} in {app}"),
      s("Connect to Computer", "connect_to_computer", "connect to {computer}"),
    ],
  },
  {
    id: "files-folders",
    name: "Files & Folders",
    icon: "folder",
    holds: "Open, find, organise and save files.",
    steps: [
      s("Open File", "open_file", "open {file}", now),
      s("Open Folder", "open_folder", "open the {folder} folder", now),
      s("Show in Folder", "show_in_folder", "show {file} in its folder"),
      s("Select File", "select_file", "ask me to pick a file"),
      s("Select Folder", "select_folder", "ask me to pick a folder"),
      s("Find Files", "find_files", "find files named {pattern} in {folder}"),
      s("Get Contents of Folder", "get_contents_of_folder", "get everything in {folder}"),
      s("Get File Details", "get_file_details", "get the {detail} of {file}"),
      s("Create Folder", "create_folder", "create a folder called {name} in {folder}"),
      s("Move Files", "move_files", "move {files} to {folder}"),
      s("Copy Files", "copy_files", "copy {files} to {folder}"),
      s("Rename Files", "rename_files", "rename {files} to {name}"),
      s("Delete Files", "delete_files", "move {files} to the bin"),
      s("Save File", "save_file", "save {content} as {name} in {folder}"),
      s("Zip Files", "zip_files", "zip {files} into {name}"),
      s("Unzip File", "unzip_file", "unzip {file} into {folder}"),
    ],
  },
  {
    id: "apps-system",
    name: "Apps & System",
    icon: "layout-grid",
    holds: "Open and quit apps, take screenshots, and change computer settings.",
    steps: [
      s("Open App", "open_app", "open {app}", now),
      s("Quit App", "quit_app", "quit {app}"),
      s("Take Screenshot", "take_screenshot", "take a screenshot of {area}"),
      s("Set Volume", "set_volume", "set the volume to {level}"),
      s("Set Appearance", "set_appearance", "switch to {light/dark} mode"),
      s("Set Do Not Disturb", "set_do_not_disturb", "turn Do Not Disturb {on/off}"),
      s("Lock Screen", "lock_screen", "lock the screen"),
      s("Get Device Details", "get_device_details", "get the {detail} of this computer"),
    ],
  },
  {
    id: "ask-choose",
    name: "Ask & Choose",
    icon: "circle-help",
    holds: "Everything that asks the person something first.",
    steps: [
      s("Ask for Input", "ask_for_input", "ask for {prompt}", now),
      s("Ask for Confirmation", "ask_for_confirmation", 'ask "{question}"', now),
      s("Choose from List", "choose_from_list", "choose from {list}", now),
      s("Choose from Menu", "choose_from_menu", "ask which to do: {options}", now),
      s("Confirm Identity", "confirm_identity", "check it's really me", now),
    ],
  },
  {
    id: "text-clipboard",
    name: "Text & Clipboard",
    icon: "type",
    holds: "Write, change and copy text.",
    steps: [
      s("Text", "text", 'text: "{text}"'),
      s("Combine Text", "combine_text", "combine {list} with {separator}"),
      s("Split Text", "split_text", "split {text} by {separator}"),
      s("Replace Text", "replace_text", 'replace "{find}" with "{replace}" in {text}'),
      s("Change Case", "change_case", "change {text} to {case}"),
      s("Get Clipboard", "get_clipboard", "get what's on the clipboard"),
      s("Copy to Clipboard", "copy_to_clipboard", "copy {content} to the clipboard", now),
    ],
  },
  {
    id: "lists-data",
    name: "Lists & Data",
    icon: "list-checks",
    holds: "Work with lists and structured data.",
    steps: [
      s("List", "list", "list: {items}"),
      s(
        "Get Item from List",
        "get_item_from_list",
        "get the {first/last/nth/random/range} item(s) from {list}",
      ),
      s("Filter List", "filter_list", "keep items in {list} where {condition}"),
      s("Sort List", "sort_list", "sort {list} by {field} {order}"),
      s("Count", "count", "count the items in {list}"),
      s("Get Value", "get_value", "get {key} from {data}"),
    ],
  },
  {
    id: "dates-numbers",
    name: "Dates & Numbers",
    icon: "calendar",
    holds: "Today's date, dated names, and simple maths.",
    steps: [
      s("Get Current Date", "get_current_date", "get today's date"),
      s("Format Date", "format_date", "format {date} as {format}"),
      s("Adjust Date", "adjust_date", "add {amount} {unit} to {date}"),
      s("Calculate", "calculate", "calculate {expression}"),
    ],
  },
  {
    id: "logic-flow",
    name: "Logic & Flow",
    icon: "git-branch",
    holds: "If, repeat, wait, variables, and other shortcuts.",
    steps: [
      s("If", "if", "if {condition} … otherwise …", now),
      s("Repeat", "repeat", "repeat {n} times", now),
      s("Repeat with Each", "repeat_with_each", "for each item in {list}", now),
      s("Wait", "wait", "wait {duration}"),
      s("Set Variable", "set_variable", 'call {value} "{name}"'),
      s("Run Shortcut", "run_shortcut", "run the {shortcut} shortcut"),
      s("Stop Shortcut", "stop_shortcut", "stop here"),
      s("Comment", "comment", 'note: "{text}"'),
    ],
  },
  {
    id: "show-speak",
    name: "Show & Speak",
    icon: "volume-2",
    holds: "Notifications, previews, sound and speech.",
    steps: [
      s("Show Notification", "show_notification", 'show "{title}"'),
      s("Show Result", "show_result", "show {content}"),
      s("Quick Look", "quick_look", "preview {content}"),
      s("Speak Text", "speak_text", 'say "{text}"'),
      s("Play Sound", "play_sound", "play {sound}"),
    ],
  },
  {
    id: "ai",
    name: "AI",
    icon: "sparkles",
    holds: "Generate and rework text, using the model you've connected to Zap.",
    steps: [
      s("Generate Text", "generate_text", 'generate text from "{instruction}"'),
      s("Summarise Text", "summarise_text", "summarise {text}"),
      s("Rewrite Text", "rewrite_text", "rewrite {text} to be {tone}"),
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    icon: "terminal",
    holds: "Raw links, web requests, shell commands and plugin screens.",
    advanced: true,
    steps: [
      s("Open Link", "open_link", "open {link}", now),
      s("Get Contents of URL", "get_contents_of_url", "get the contents of {url}"),
      s("Run Shell Script", "run_shell_script", 'run the script "{script}"', now),
      s("Open Plugin Panel", "open_plugin_panel", "open the {plugin} panel", now),
    ],
  },
  {
    id: "plugins",
    name: "Plugins",
    icon: "puzzle",
    holds: "Steps added by the plugins you install.",
    steps: [],
  },
];

/** Steps in a group, plus how many the app runs today. */
export const groupCounts = (group: StepGroup) => ({
  total: group.steps.length,
  available: group.steps.filter((step) => step.status === "available").length,
});

export const ALL_STEPS_COUNT = STEP_GROUPS.reduce((n, group) => n + group.steps.length, 0);
export const AVAILABLE_STEPS_COUNT = STEP_GROUPS.reduce(
  (n, group) => n + groupCounts(group).available,
  0,
);
