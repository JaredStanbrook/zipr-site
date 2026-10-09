/**
 * Reading the site in another language, without sending anyone anywhere.
 *
 * **How it works.** The server only ever renders English. Each language has a
 * catalogue — `public/i18n/<code>.json`, served from this domain — mapping a
 * short hash of an English sentence to its translation. When a visitor picks
 * a language, this module splits the page into sentences, looks each one up,
 * and swaps in the translation. A sentence with no entry stays English, so a
 * copy edit made after the translations were written degrades one sentence at
 * a time instead of breaking a page.
 *
 * **Why not a translation service.** The privacy notice promises no
 * third-party scripts and no tracking, and a visitor's browsing would have to
 * be sent to a translator for that to work. Catalogues in the repository are
 * reviewable, cost nothing per visit and never leave the domain.
 *
 * **What counts as a sentence** ("segment"). Text is translated a whole run at
 * a time — `Turn the steps you keep explaining into <em>one click.</em>` is one
 * unit, not two fragments — because word order differs between languages and
 * fragments translate badly. Inline elements inside a run (`em`, `a`, `span`…)
 * become numbered placeholders, `Turn the steps … into <1>one click.</1>`, and
 * are rebuilt from the original elements so their classes and links survive.
 * Code, icons, images and anything marked `translate="no"` are kept verbatim.
 *
 * This file is written against the standard DOM only, so the tests run it
 * under `linkedom` and the extraction script runs it in a real browser, and
 * both see exactly the segments a visitor's browser will.
 */

// --- Hashing ------------------------------------------------------------------------

/** FNV-1a, 32 bits, as eight hex digits: a stable short id for a sentence. */
export const hashKey = (text: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

// --- Classifying nodes --------------------------------------------------------------

/** Never translated, and never looked inside. They also end a run of text. */
const SKIP_TAGS = new Set([
  "script",
  "style",
  "template",
  "noscript",
  "pre",
  "textarea",
  "iframe",
  "canvas",
  "hr",
  "head",
]);

/** Sit inside a line of text but are kept as they are. */
const ATOM_TAGS = new Set(["code", "kbd", "samp", "img", "br", "wbr", "svg", "input"]);

/** Sit inside a line of text, and their words are translated with it. */
const INLINE_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "cite",
  "data",
  "del",
  "dfn",
  "em",
  "i",
  "ins",
  "mark",
  "q",
  "s",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
]);

type Kind = "text" | "inline" | "atom" | "block" | "skip" | "ignore";

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

const tagOf = (el: Element) => el.tagName.toLowerCase();

const marksNoTranslate = (el: Element) =>
  el.getAttribute("translate") === "no" || el.classList.contains("notranslate");

/** An element is inline only if everything inside it is too. */
const isPureInline = (el: Element): boolean => {
  for (const child of Array.from(el.childNodes)) {
    const kind = classify(child);
    if (kind !== "text" && kind !== "ignore" && kind !== "inline" && kind !== "atom") return false;
  }
  return true;
};

const classify = (node: Node): Kind => {
  if (node.nodeType === TEXT_NODE) return "text";
  if (node.nodeType !== ELEMENT_NODE) return "ignore";

  const el = node as Element;
  const tag = tagOf(el);
  if (SKIP_TAGS.has(tag)) return "skip";
  if (ATOM_TAGS.has(tag) || el.hasAttribute("data-lucide")) return "atom";
  if (INLINE_TAGS.has(tag)) {
    // A timestamp is data however it is spelled: "5 Oct 2026" has letters in it.
    if (tag === "time" || marksNoTranslate(el)) return "atom";
    if (!isPureInline(el)) return "block";
    // A wrapper with no words in it — `<span>$6</span>`, `<span>5</span>` — is
    // data, not language: kept exactly as it is, so a price or a count can
    // change without orphaning the sentence around it.
    return hasLetters(el.textContent ?? "") ? "inline" : "atom";
  }
  return marksNoTranslate(el) ? "skip" : "block";
};

const hasLetters = (text: string) => /\p{L}/u.test(text);

/**
 * Atoms that are part of what a sentence says, and so stay in it as a
 * placeholder: code, and anything marked `translate="no"` such as a brand
 * name. Every other atom — an icon, an image, a bare figure — is decoration or
 * data, and is left out of a sentence when it sits at either edge.
 */
const isContentAtom = (el: Element) =>
  tagOf(el) === "code" || tagOf(el) === "kbd" || tagOf(el) === "samp" || marksNoTranslate(el);

// --- Encoding a run as a string -----------------------------------------------------

const escapeText = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const unescapeText = (text: string) =>
  text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

const collapse = (text: string) => text.replace(/\s+/g, " ").trim();

/**
 * A run of siblings as text with numbered placeholders.
 *
 * `els` collects the elements in the order they were numbered (1-based), which
 * is how the translation is later rebuilt from the original nodes.
 */
const encode = (nodes: Node[], els: Element[]): string => {
  let out = "";
  const visit = (node: Node) => {
    switch (classify(node)) {
      case "text":
        out += escapeText(node.textContent ?? "");
        break;
      case "inline": {
        const n = els.push(node as Element);
        out += `<${n}>`;
        node.childNodes.forEach(visit);
        out += `</${n}>`;
        break;
      }
      case "atom": {
        const n = els.push(node as Element);
        out += `<${n}/>`;
        break;
      }
      default:
        break;
    }
  };
  nodes.forEach(visit);
  return collapse(out);
};

// --- Parsing a translation ----------------------------------------------------------

export type Template =
  | { type: "text"; text: string }
  | { type: "atom"; n: number }
  | { type: "inline"; n: number; children: Template[] };

/**
 * A translated string as a tree, or null if it is not well formed.
 *
 * Well formed means every tag closes in order and a literal `<` is written
 * `&lt;`. Placeholders may be reordered — a language is entitled to put the
 * emphasised phrase somewhere else — but not dropped or repeated, which
 * `sameShape` checks against the source.
 */
export const parseTemplate = (input: string): Template[] | null => {
  const root: Template[] = [];
  const stack: { n: number; children: Template[] }[] = [];
  const current = () => (stack.length ? stack[stack.length - 1].children : root);

  const token = /<(\d+)\/>|<(\d+)>|<\/(\d+)>|([^<]+)/g;
  let consumed = 0;
  for (let match = token.exec(input); match; match = token.exec(input)) {
    if (match.index !== consumed) return null;
    consumed = token.lastIndex;
    if (match[1] !== undefined) current().push({ type: "atom", n: Number(match[1]) });
    else if (match[2] !== undefined) stack.push({ n: Number(match[2]), children: [] });
    else if (match[3] !== undefined) {
      const open = stack.pop();
      if (!open || open.n !== Number(match[3])) return null;
      current().push({ type: "inline", n: open.n, children: open.children });
    } else current().push({ type: "text", text: unescapeText(match[4]) });
  }
  if (consumed !== input.length || stack.length) return null;
  return root;
};

const placeholdersOf = (tree: Template[], into: string[] = []): string[] => {
  for (const node of tree) {
    if (node.type === "atom") into.push(`${node.n}/`);
    else if (node.type === "inline") {
      into.push(`${node.n}`);
      placeholdersOf(node.children, into);
    }
  }
  return into;
};

/** Whether `translation` carries exactly the placeholders `source` does. */
export const sameShape = (source: string, translation: string): boolean => {
  const a = parseTemplate(source);
  const b = parseTemplate(translation);
  if (!a || !b) return false;
  const left = placeholdersOf(a).sort().join(",");
  const right = placeholdersOf(b).sort().join(",");
  return left === right;
};

// --- Finding the segments in a page -------------------------------------------------

export interface Segment {
  /** The English sentence, with placeholders. */
  key: string;
  /** `hashKey(key)`: what the catalogue is indexed by. */
  id: string;
  /** The parent whose children the run was found among. */
  container: Element;
  /** The consecutive siblings that make up the run. */
  nodes: Node[];
  /** Placeholder elements, 1-based by position in this array plus one. */
  els: Element[];
}

const finishRun = (run: Node[], container: Element, out: Segment[]) => {
  if (!run.length) return;

  // A run with no words of its own, only elements separated by space or
  // punctuation — a row of navigation links, a pair of buttons, a feature and
  // its note — is several labels, not one sentence. Translating "Features Zap
  // Downloads Pricing" as a unit would be unnatural, and it would change with
  // whichever link happens to be marked current.
  const hasWords = run.some(
    (node) => classify(node) === "text" && hasLetters(node.textContent ?? ""),
  );
  if (!hasWords) {
    for (const node of run) if (classify(node) === "inline") walk(node as Element, out);
    return;
  }

  // The sentence runs from the first node that says something to the last.
  // Whitespace, icons and wrapped figures at the edges are left outside it: an
  // icon is not words, and a figure like a price is data that changes without
  // the sentence changing, so keeping it out keeps the sentence's id stable.
  // Bare text with no letters — a closing quote, a full stop — is part of the
  // sentence and stays in. A brand name or a piece of code is words, and stays
  // in as a placeholder so the translation can put it where its grammar wants.
  const says = (node: Node) => {
    switch (classify(node)) {
      case "text":
        return /\S/.test(node.textContent ?? "");
      case "inline":
        return true;
      case "atom":
        return isContentAtom(node as Element);
      default:
        return false;
    }
  };

  let first = -1;
  let last = -1;
  run.forEach((node, i) => {
    if (says(node)) {
      if (first < 0) first = i;
      last = i;
    }
  });
  if (first < 0) return;

  const nodes = run.slice(first, last + 1);

  const els: Element[] = [];
  const key = encode(nodes, els);
  if (!hasLetters(key.replace(/<\/?\d+\/?>/g, ""))) return;
  out.push({ key, id: hashKey(key), container, nodes, els });
};

const walk = (el: Element, out: Segment[]) => {
  let run: Node[] = [];
  const flush = () => {
    finishRun(run, el, out);
    run = [];
  };

  for (const child of Array.from(el.childNodes)) {
    switch (classify(child)) {
      case "text":
      case "inline":
      case "atom":
        run.push(child);
        break;
      case "block":
        flush();
        walk(child as Element, out);
        break;
      case "skip":
        flush();
        break;
      default:
        break;
    }
  }
  flush();
};

/** Every translatable sentence under `root`, in document order. */
export const collectSegments = (root: Element): Segment[] => {
  if (classify(root) === "skip") return [];
  const out: Segment[] = [];
  walk(root, out);
  return out;
};

// --- Attributes ---------------------------------------------------------------------

const TRANSLATED_ATTRIBUTES = ["alt", "title", "aria-label", "placeholder"];

export interface AttributeSegment {
  key: string;
  id: string;
  element: Element;
  attribute: string;
}

/** Text that lives in an attribute: alternative text, labels, placeholders. */
export const collectAttributes = (root: Element): AttributeSegment[] => {
  const selector = TRANSLATED_ATTRIBUTES.map((name) => `[${name}]`).join(",");
  const out: AttributeSegment[] = [];
  for (const element of Array.from(root.querySelectorAll(selector))) {
    if (element.closest('[translate="no"], .notranslate, script, style, template, pre')) continue;
    for (const attribute of TRANSLATED_ATTRIBUTES) {
      const value = element.getAttribute(attribute);
      if (!value || !hasLetters(value)) continue;
      const key = collapse(value);
      out.push({ key, id: hashKey(key), element, attribute });
    }
  }
  return out;
};

// --- Applying a catalogue -----------------------------------------------------------

export type Catalogue = Record<string, string>;

const build = (tree: Template[], els: Element[], doc: Document): Node[] =>
  tree.map((node) => {
    if (node.type === "text") return doc.createTextNode(node.text);
    const original = els[node.n - 1];
    if (node.type === "atom") return original.cloneNode(true);
    const copy = original.cloneNode(false);
    for (const child of build(node.children, els, doc)) copy.appendChild(child);
    return copy;
  });

/**
 * Put `translation` where the segment's English was.
 *
 * Returns false, and changes nothing, if the translation does not carry the
 * same placeholders as the English: a mangled translation falls back to
 * English rather than losing a link.
 */
export const applySegment = (segment: Segment, translation: string): boolean => {
  if (!sameShape(segment.key, translation)) return false;
  const tree = parseTemplate(translation);
  if (!tree) return false;

  const first = segment.nodes[0];
  const parent = first.parentNode;
  const doc = first.ownerDocument;
  if (!parent || !doc) return false;

  const built = build(tree, segment.els, doc);
  // Leading and trailing spaces are layout, not words: `<a><svg/> Download</a>`
  // needs its space, so it is kept from the original.
  const startsWithSpace = /^\s/.test(first.textContent ?? "") && first.nodeType === TEXT_NODE;
  const lastNode = segment.nodes[segment.nodes.length - 1];
  const endsWithSpace = /\s$/.test(lastNode.textContent ?? "") && lastNode.nodeType === TEXT_NODE;
  if (startsWithSpace) built.unshift(doc.createTextNode(" "));
  if (endsWithSpace) built.push(doc.createTextNode(" "));

  for (const node of built) parent.insertBefore(node, first);
  for (const node of segment.nodes) parent.removeChild(node);
  return true;
};

export interface TranslateResult {
  /** Sentences and attributes replaced. */
  applied: number;
  /** English keys that the catalogue has no usable entry for. */
  missing: string[];
}

/**
 * Translate everything under `root` that the catalogue has an entry for.
 *
 * All segments are found before any is changed, so replacing one cannot
 * disturb another's position.
 */
export const translateTree = (root: Element, catalogue: Catalogue): TranslateResult => {
  const segments = collectSegments(root);
  const attributes = collectAttributes(root);
  const result: TranslateResult = { applied: 0, missing: [] };

  for (const segment of segments) {
    const translation = catalogue[segment.id];
    if (translation && applySegment(segment, translation)) result.applied++;
    else result.missing.push(segment.key);
  }

  for (const item of attributes) {
    const translation = catalogue[item.id];
    if (translation && !/[<>]/.test(translation)) {
      item.element.setAttribute(item.attribute, translation);
      result.applied++;
    } else result.missing.push(item.key);
  }

  return result;
};
