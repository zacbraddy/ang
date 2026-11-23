import fs from "node:fs";
import path from "node:path";
import { CTX, ITEM_STAGES } from "../paths.mjs";
import { read } from "../util.mjs";
import { parseFrontmatter } from "../library/frontmatter.mjs";
import {
  evalTrigger,
  loadTriggers,
  triggerErrors,
} from "../triggers/triggers.mjs";
import { hasState, loadState } from "./state.mjs";
import { dependsOn, storiesOf } from "./stories.mjs";

function itemLine(name, item, state) {
  const hubFile = path.join(item, "README.md");
  const title = fs.existsSync(hubFile)
    ? parseFrontmatter(read(hubFile))?.title
    : null;
  const type = state?.type ? ` [${state.type}]` : "";
  const note = state?.statusNote ? ` (${state.statusNote})` : "";
  const status = state ? state.status + note : "no state";
  const titlePart = typeof title === "string" ? ` — ${title}` : "";

  return `  ${name}${type} — ${status}${titlePart}`;
}

function storyNote(story, waitingOn) {
  const { status, blockedReason, revisit } = story.fm;
  const isWaiting = waitingOn.length > 0;

  if (status === "blocked") {
    const revisitNote = revisit ? ` (revisit ${revisit})` : "";

    return ` — BLOCKED: ${blockedReason ?? "?"}${revisitNote}`;
  }

  if (status === "ready" && !isWaiting) {
    return " — parallel-safe";
  }

  if (isWaiting && status !== "done") {
    return ` — waits on ${waitingOn.join(", ")}`;
  }

  return "";
}

function countByStatus(stories) {
  const counts = {};

  for (const story of stories) {
    const status = story.fm.status ?? "?";

    counts[status] = (counts[status] ?? 0) + 1;
  }

  return counts;
}

function printStories(item) {
  const stories = storiesOf(item);

  if (!stories.length) {
    return;
  }

  const doneNumbers = new Set(
    stories
      .filter((story) => story.fm.status === "done")
      .map((story) => story.num),
  );
  const summary = Object.entries(countByStatus(stories))
    .map(([status, count]) => `${count} ${status}`)
    .join(", ");

  console.log(`      stories: ${summary}`);

  for (const story of stories) {
    const waitingOn = dependsOn(story.fm).filter(
      (dep) => !doneNumbers.has(dep),
    );
    const title = story.fm.title ?? path.basename(story.file);
    const status = story.fm.status ?? "?";
    const owner = story.fm.owner ?? "?";

    console.log(
      `        ${story.num} ${status} [${owner}] ${title}${storyNote(story, waitingOn)}`,
    );
  }
}

function itemDirsIn(stageDir) {
  if (!fs.existsSync(stageDir)) {
    return [];
  }

  return fs
    .readdirSync(stageDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());
}

function printStage(stage) {
  const stageDir = path.join(CTX, stage);
  const items = itemDirsIn(stageDir);

  console.log(`\n${stage}/ (${items.length})`);

  for (const entry of items) {
    const item = path.join(stageDir, entry.name);
    const state = hasState(item) ? loadState(item) : null;

    console.log(itemLine(entry.name, item, state));

    if (state?.unknowns.length) {
      const nextUnknown = state.unknowns[0];

      console.log(
        `      ${state.unknowns.length} unknown(s); next: ${nextUnknown.id} ${nextUnknown.question}`,
      );
    }

    printStories(item);
  }
}

export function printBoard(onlyStage) {
  const stages = onlyStage ? [onlyStage] : ITEM_STAGES;

  stages.forEach(printStage);

  const shouldSkipTriggers = onlyStage || triggerErrors().length;

  if (shouldSkipTriggers) {
    return;
  }

  const triggers = loadTriggers().map(evalTrigger);

  if (!triggers.length) {
    return;
  }

  const countInState = (state) =>
    triggers.filter((trigger) => trigger.state === state).length;
  const ready = countInState("ready");
  const toJudge = countInState("judge");
  const hint = ready + toJudge > 0 ? " (trigger check)" : "";

  console.log(
    `\ntriggers: ${countInState("waiting")} waiting, ${toJudge} to judge, ${ready} ready${hint}`,
  );
}
