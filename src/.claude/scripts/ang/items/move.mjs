import fs from "node:fs";
import path from "node:path";
import { CTX } from "../paths.mjs";
import { fail, posix, read, rel, today, walk } from "../util.mjs";
import { buildIndex } from "../library/index.mjs";
import { loadTriggers, saveTriggers } from "../triggers/triggers.mjs";
import {
  emptyState,
  hasState,
  loadState,
  logLineage,
  nextId,
  saveState,
} from "./state.mjs";
import { stageOf } from "./resolve.mjs";

const ITEM_BOOKKEEPING_FILES = ["README.md", "state.json", "index.json"];

// Rewrites absolute /project-context/… references in every doc. Returns how many docs changed.
function rewriteAbsoluteRefs(pairs) {
  const longestFirst = [...pairs].sort((a, b) => b[0].length - a[0].length);
  let rewrittenCount = 0;

  for (const file of walk(CTX)) {
    const original = read(file);
    let text = original;

    for (const [from, to] of longestFirst) {
      text = text.split(from).join(to);
    }

    if (text === original) {
      continue;
    }

    fs.writeFileSync(file, text);
    rewrittenCount++;
  }

  return rewrittenCount;
}

export function moveItem(from, stage) {
  const to = path.join(CTX, stage, path.basename(from));

  if (fs.existsSync(to)) {
    fail(`already exists: ${rel(to)}`);
  }

  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);

  const rewrittenCount = rewriteAbsoluteRefs([
    [`/${rel(from)}/`, `/${rel(to)}/`],
  ]);

  logLineage(to, `moved ${stageOf(from)} → ${stageOf(to)}`);
  buildIndex();
  console.log(
    `✔ moved ${rel(from)} → ${rel(to)} (rewrote links in ${rewrittenCount} file(s))`,
  );
}

function withSlugSuffix(file, slug) {
  const ext = path.extname(file);
  const stem = ext ? file.slice(0, -ext.length) : file;

  return `${stem}-${slug}${ext}`;
}

// old path → new path for every file moving from incoming into target; the incoming hub maps onto the target hub.
function planMergeMoves(incoming, target, nest) {
  const slug = path.basename(incoming);
  const destinationRoot = nest ? path.join(target, nest, slug) : target;
  const moves = new Map();

  for (const file of walk(incoming, true)) {
    const relative = path.relative(incoming, file);

    if (ITEM_BOOKKEEPING_FILES.includes(relative)) {
      continue;
    }

    const destination = path.join(destinationRoot, relative);
    const isTaken = fs.existsSync(destination);

    moves.set(file, isTaken ? withSlugSuffix(destination, slug) : destination);
  }

  moves.set(path.join(incoming, "README.md"), path.join(target, "README.md"));

  return moves;
}

const isUrlAnchorOrAbsolute = (link) => /^(?:https?:|mailto:|#|\/)/.test(link);

function relinkMovedDoc(link, from, to, moves) {
  const [linkPath, anchor] = link.split("#");
  const oldTarget = path.resolve(path.dirname(from), decodeURI(linkPath));
  const newTarget = moves.get(oldTarget) ?? oldTarget;
  let relative = posix(path.relative(path.dirname(to), newTarget));

  if (!relative.startsWith(".")) {
    relative = `./${relative}`;
  }

  const anchorPart = anchor ? `#${anchor}` : "";

  return `](${relative}${anchorPart})`;
}

// Relative links inside moved docs: resolve against the old location, point at the new one.
function rewriteRelativeLinks(moves, targetHub) {
  for (const [from, to] of moves) {
    const isMovedDoc =
      to.endsWith(".md") && to !== targetHub && fs.existsSync(to);

    if (!isMovedDoc) {
      continue;
    }

    const text = read(to).replace(/\]\(([^)\s]+)\)/g, (whole, link) =>
      isUrlAnchorOrAbsolute(link)
        ? whole
        : relinkMovedDoc(link, from, to, moves),
    );

    fs.writeFileSync(to, text);
  }
}

function mergeState(incoming, target, moves, nest) {
  const slug = path.basename(incoming);
  const incomingState = hasState(incoming) ? loadState(incoming) : emptyState();
  const targetState = hasState(target) ? loadState(target) : emptyState();
  const remapRef = (ref) => {
    if (!ref || /^(?:https?:|mailto:|\/)/.test(ref)) {
      return ref;
    }

    const moved = moves.get(path.resolve(incoming, ref));

    return moved ? posix(path.relative(target, moved)) : ref;
  };

  for (const unknown of incomingState.unknowns) {
    targetState.unknowns.push({
      ...unknown,
      id: nextId(targetState.unknowns, "u"),
      from: slug,
    });
  }

  for (const known of incomingState.knowns) {
    targetState.knowns.push({
      ...known,
      id: nextId(targetState.knowns, "k"),
      source: remapRef(known.source),
      from: slug,
    });
  }

  for (const decision of incomingState.decisions) {
    targetState.decisions.push({
      ...decision,
      id: nextId(targetState.decisions, "d"),
      evidence: remapRef(decision.evidence),
      from: slug,
    });
  }

  for (const entry of incomingState.lineage) {
    targetState.lineage.push({ ...entry, event: `[${slug}] ${entry.event}` });
  }

  const nestNote = nest ? ` into ${nest}/` : "";

  targetState.lineage.push({
    date: today(),
    event: `merged ${slug} from ${stageOf(incoming)}${nestNote}`,
  });
  saveState(target, targetState);
}

function repointTriggers(fromSlug, toSlug) {
  const triggers = loadTriggers();
  const repointCondition = (condition) =>
    condition
      .replace(new RegExp(`^story:${fromSlug}/`), `story:${toSlug}/`)
      .replace(new RegExp(`^stage:${fromSlug}=`), `stage:${toSlug}=`);
  const repointed = triggers.map((trigger) => ({
    ...trigger,
    conditions: trigger.conditions.map(repointCondition),
  }));
  const hasChanged = JSON.stringify(repointed) !== JSON.stringify(triggers);

  if (hasChanged) {
    saveTriggers(repointed);
  }
}

export function mergeItem(incoming, target, nest) {
  if (incoming === target) {
    fail("cannot merge an item into itself");
  }

  const slug = path.basename(incoming);
  const incomingHub = path.join(incoming, "README.md");
  const targetHub = path.join(target, "README.md");
  const moves = planMergeMoves(incoming, target, nest);

  for (const [from, to] of moves) {
    if (from === incomingHub || !fs.existsSync(from)) {
      continue;
    }

    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(from, to);
  }

  rewriteRelativeLinks(moves, targetHub);

  const absolutePairs = [...moves].map(([from, to]) => [
    `/${rel(from)}`,
    `/${rel(to)}`,
  ]);
  const rewrittenCount = rewriteAbsoluteRefs(absolutePairs);

  mergeState(incoming, target, moves, nest);
  repointTriggers(slug, path.basename(target));
  fs.rmSync(incoming, { recursive: true, force: true });
  buildIndex();

  const movedCount = moves.size - 1;

  console.log(
    `✔ merged ${slug} → ${rel(target)} (${movedCount} file(s) moved, links rewritten in ${rewrittenCount} file(s))`,
  );
  console.log(
    "  Next: dedupe/reprioritise with state commands (state show, state remove, state order) and rewrite the target hub.",
  );
}
