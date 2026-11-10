import fs from 'node:fs';
import path from 'node:path';
import { CTX, ITEM_STAGES } from '../paths.mjs';
import { read } from '../util.mjs';
import { parseFrontmatter } from '../library/frontmatter.mjs';
import { evalTrigger, loadTriggers, triggerErrors } from '../triggers/triggers.mjs';
import { hasState, loadState } from './state.mjs';
import { dependsOn, storiesOf } from './stories.mjs';

function itemLine(name, item, state) {
  const hub = path.join(item, 'README.md');
  const title = fs.existsSync(hub) ? parseFrontmatter(read(hub))?.title : null;
  const type = state?.type ? ` [${state.type}]` : '';
  const note = state?.statusNote ? ` (${state.statusNote})` : '';
  const status = state ? state.status + note : 'no state';
  const titlePart = typeof title === 'string' ? ` — ${title}` : '';
  return `  ${name}${type} — ${status}${titlePart}`;
}

function storyNote(story, waitingOn) {
  const { status, blockedReason, revisit } = story.fm;
  if (status === 'blocked') return ` — BLOCKED: ${blockedReason ?? '?'}${revisit ? ` (revisit ${revisit})` : ''}`;
  if (status === 'ready' && !waitingOn.length) return ' — parallel-safe';
  if (waitingOn.length && status !== 'done') return ` — waits on ${waitingOn.join(', ')}`;
  return '';
}

function printStories(item) {
  const stories = storiesOf(item);
  if (!stories.length) return;
  const done = new Set(stories.filter((s) => s.fm.status === 'done').map((s) => s.num));
  const counts = {};
  for (const story of stories) {
    const status = story.fm.status ?? '?';
    counts[status] = (counts[status] ?? 0) + 1;
  }
  const summary = Object.entries(counts).map(([status, n]) => `${n} ${status}`).join(', ');
  console.log(`      stories: ${summary}`);
  for (const story of stories) {
    const waitingOn = dependsOn(story.fm).filter((dep) => !done.has(dep));
    const title = story.fm.title ?? path.basename(story.file);
    console.log(`        ${story.num} ${story.fm.status ?? '?'} [${story.fm.owner ?? '?'}] ${title}${storyNote(story, waitingOn)}`);
  }
}

function printStage(stage) {
  const dir = path.join(CTX, stage);
  const items = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()) : [];
  console.log(`\n${stage}/ (${items.length})`);
  for (const entry of items) {
    const item = path.join(dir, entry.name);
    const state = hasState(item) ? loadState(item) : null;
    console.log(itemLine(entry.name, item, state));
    if (state?.unknowns.length) {
      const next = state.unknowns[0];
      console.log(`      ${state.unknowns.length} unknown(s); next: ${next.id} ${next.question}`);
    }
    printStories(item);
  }
}

export function printBoard(onlyStage) {
  const stages = onlyStage ? [onlyStage] : ITEM_STAGES;
  stages.forEach(printStage);
  if (onlyStage || triggerErrors().length) return;
  const triggers = loadTriggers().map(evalTrigger);
  if (!triggers.length) return;
  const count = (state) => triggers.filter((t) => t.state === state).length;
  const ready = count('ready');
  const toJudge = count('judge');
  const hint = ready + toJudge ? ' (trigger check)' : '';
  console.log(`\ntriggers: ${count('waiting')} waiting, ${toJudge} to judge, ${ready} ready${hint}`);
}
