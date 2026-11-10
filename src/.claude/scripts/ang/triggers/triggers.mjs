import fs from 'node:fs';
import path from 'node:path';
import { FLOW, ITEM_STAGES, PROJECT, SLUG_RE, STORY_STATUSES, TRIGGER_DIR, TRIGGERS_FILE } from '../paths.mjs';
import { read, rel, walk, writeJson } from '../util.mjs';
import { findItem, stageOf } from '../items/resolve.mjs';
import { storiesOf } from '../items/stories.mjs';
import { parseFrontmatter } from '../library/frontmatter.mjs';
import { loadStore, refExists, tryGit } from '../../../ang/features/streams/store.mjs';

export const loadTriggers = () => (fs.existsSync(TRIGGERS_FILE) ? JSON.parse(read(TRIGGERS_FILE)) : []);
export const saveTriggers = (triggers) => writeJson(TRIGGERS_FILE, triggers);
export const triggerDoc = (slug) => path.join(TRIGGER_DIR, `${slug}.md`);

const CONDITION_FORMS = 'story:<item>/<NN>=<status>[|status], stage:<item>=<stage>, file:<path>, after:<YYYY-MM-DD[THH:MM]>, '
  + 'custom:<text>, stream:<stream>:<story:|stage:|file: condition>';

function parseStoryCondition(raw, arg) {
  const match = arg.match(/^([a-z0-9-]+)\/(\d+)=([a-z|]+)$/);
  if (!match) return { error: `"${raw}" — expected story:<item>/<NN>=<status>[|status]` };
  const statuses = match[3].split('|');
  const unknownStatuses = statuses.filter((s) => !STORY_STATUSES.includes(s));
  if (unknownStatuses.length) return { error: `"${raw}" — status must be one of ${STORY_STATUSES.join('|')}` };
  return { kind: 'story', item: match[1], story: match[2].padStart(2, '0'), statuses };
}

function parseStageCondition(raw, arg) {
  const match = arg.match(/^([a-z0-9-]+)=([a-z0-9]+)$/);
  if (!match || !ITEM_STAGES.includes(match[2])) return { error: `"${raw}" — expected stage:<item>=<${ITEM_STAGES.join('|')}>` };
  return { kind: 'stage', item: match[1], stage: match[2] };
}

function parseAfterCondition(raw, arg) {
  const wellFormed = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(arg);
  const localTime = arg.includes('T') ? arg : `${arg}T00:00`;
  const at = wellFormed ? new Date(localTime) : null;
  if (!at || Number.isNaN(at.getTime())) return { error: `"${raw}" — expected after:YYYY-MM-DD or after:YYYY-MM-DDTHH:MM` };
  return { kind: 'after', at };
}

// Only conditions about project content mean anything on another branch: time and judgement are the same everywhere.
function parseStreamCondition(raw, arg) {
  const match = arg.match(/^([a-z0-9-]+):((?:story|stage|file):[\s\S]+)$/);
  if (!match) return { error: `"${raw}" — expected stream:<stream>:<story:|stage:|file: condition>` };
  const inner = parseCondition(match[2]);
  if (inner.error) return { error: `in "${raw}": ${inner.error}` };
  return { kind: 'stream', stream: match[1], inner };
}

// Conditions are stored as the strings the user and agents type, so add and validate share one parser.
export function parseCondition(raw) {
  const match = String(raw).match(/^(story|stage|file|after|custom|stream):([\s\S]+)$/);
  if (!match) return { error: `"${raw}" is not a condition (${CONDITION_FORMS})` };
  const [, kind, arg] = match;
  if (kind === 'story') return parseStoryCondition(raw, arg);
  if (kind === 'stage') return parseStageCondition(raw, arg);
  if (kind === 'after') return parseAfterCondition(raw, arg);
  if (kind === 'stream') return parseStreamCondition(raw, arg);
  return { kind, text: arg.trim() };
}

// Where story:, stage: and file: conditions look: this checkout, or another stream's branch.
const localSource = {
  label: null,
  item(slug) {
    const item = findItem(slug);
    if (!item) return null;
    const stories = () => storiesOf(item).map((s) => ({ num: s.num, status: s.fm.status }));
    return { stage: stageOf(item), stories };
  },
  fileExists: (file) => fs.existsSync(path.resolve(PROJECT, file)),
};

function branchStories(branch, storiesDir) {
  const listing = tryGit(['ls-tree', '-r', '--name-only', branch, '--', `${storiesDir}/`]) ?? '';
  const files = listing.split('\n').filter((file) => file.endsWith('.md'));
  const stories = files.map((file) => {
    const fm = parseFrontmatter(tryGit(['show', `${branch}:${file}`]) ?? '') ?? {};
    const num = path.posix.basename(file).match(/^(\d+)/)?.[1] ?? '?';
    return { num, status: fm.status };
  });
  return stories;
}

// Worktrees share refs and objects, so another stream's branch reads through git without checking it out.
function branchSource(branch) {
  const exists = (repoPath) => tryGit(['cat-file', '-e', `${branch}:${repoPath.replace(/^\.\//, '')}`]) !== null;
  return {
    label: branch,
    item(slug) {
      const stage = ITEM_STAGES.find((s) => exists(`project-context/${s}/${slug}`));
      if (!stage) return null;
      const stories = () => branchStories(branch, `project-context/${stage}/${slug}/stories`);
      return { stage, stories };
    },
    fileExists: exists,
  };
}

function evalStreamCondition({ stream, inner }) {
  const entry = loadStore().streams.find((s) => s.slug === stream);
  if (!entry) return { result: 'gone', why: `no stream ${stream} registered` };
  if (!refExists(`refs/heads/${entry.branch}`)) return { result: 'gone', why: `stream ${stream}'s branch ${entry.branch} is gone` };
  return evalCondition(inner, branchSource(entry.branch));
}

// met | unmet | judge (custom: an agent must check it before calling the trigger ready) | gone (points at something that no longer exists)
function evalCondition(condition, source = localSource) {
  if (condition.kind === 'custom') return { result: 'judge' };
  if (condition.kind === 'stream') return evalStreamCondition(condition);
  if (condition.kind === 'file') return { result: source.fileExists(condition.text) ? 'met' : 'unmet' };
  if (condition.kind === 'after') return { result: Date.now() >= condition.at.getTime() ? 'met' : 'unmet' };
  const onBranch = source.label ? ` on ${source.label}` : '';
  const item = source.item(condition.item);
  if (!item) return { result: 'gone', why: `item ${condition.item} not found${onBranch}` };
  if (condition.kind === 'stage') {
    const reached = FLOW.indexOf(item.stage) >= FLOW.indexOf(condition.stage);
    return { result: reached ? 'met' : 'unmet' };
  }
  const story = item.stories().find((s) => s.num === condition.story);
  if (!story) return { result: 'gone', why: `story ${condition.item}/${condition.story} not found${onBranch}` };
  return { result: condition.statuses.includes(story.status) ? 'met' : 'unmet' };
}

// waiting | judge | ready. Custom conditions only matter once every checkable one is met, so an unmet one keeps it waiting.
// A trigger pointing at something gone can never fire, so validate reports it as an error instead.
function triggerState(results) {
  const checkable = results.filter((r) => r.result !== 'judge');
  const allCheckableMet = checkable.every((r) => r.result === 'met');
  if (!allCheckableMet) return 'waiting';
  const needsJudgement = checkable.length < results.length;
  return needsJudgement ? 'judge' : 'ready';
}

export function evalTrigger(trigger) {
  const results = trigger.conditions.map((raw) => ({ raw, ...evalCondition(parseCondition(raw)) }));
  return { ...trigger, state: triggerState(results), results };
}

export function goneErrors(trigger) {
  const gone = evalTrigger(trigger).results.filter((r) => r.result === 'gone');
  return gone.map((r) => `${r.raw} points at something gone (${r.why}) — repoint or remove it`);
}

export function conditionErrors(conditions) {
  const parseErrors = conditions.map(parseCondition).filter((p) => p.error).map((p) => p.error);
  if (parseErrors.length) return parseErrors;
  return goneErrors({ conditions });
}

export function triggerErrors() {
  let triggers;
  try {
    triggers = loadTriggers();
  } catch {
    return ['triggers.json: invalid JSON'];
  }
  const errors = [];
  const slugs = new Set();
  for (const trigger of triggers) {
    const where = `triggers.json: ${trigger.slug ?? '(no slug)'}`;
    if (!SLUG_RE.test(trigger.slug ?? '')) errors.push(`${where}: slug must be kebab-case`);
    if (slugs.has(trigger.slug)) errors.push(`${where}: duplicate slug`);
    slugs.add(trigger.slug);
    if (!trigger.intent) errors.push(`${where}: no intent`);
    if (!trigger.conditions?.length) {
      errors.push(`${where}: no conditions`);
      continue;
    }
    conditionErrors(trigger.conditions).forEach((e) => errors.push(`${where}: ${e}`));
    if (trigger.slug && !fs.existsSync(triggerDoc(trigger.slug))) errors.push(`${where}: missing doc ${rel(triggerDoc(trigger.slug))}`);
  }
  for (const doc of walk(TRIGGER_DIR)) {
    if (slugs.has(path.basename(doc, '.md'))) continue;
    errors.push(`${rel(doc)}: no triggers.json entry (trigger add, or delete the doc)`);
  }
  return errors;
}

// Returns how many were ready or need judgement.
export function printReadyTriggers(evaluated) {
  const ready = evaluated.filter((t) => t.state === 'ready');
  const toJudge = evaluated.filter((t) => t.state === 'judge');
  for (const trigger of ready) {
    console.log(`⏰ ready  ${trigger.slug}: ${trigger.intent}  → run /trigger ${trigger.slug} in a fresh session`);
  }
  for (const trigger of toJudge) {
    const questions = trigger.results.filter((r) => r.result === 'judge').map((r) => r.raw.slice('custom:'.length));
    console.log(`🤔 needs judgement  ${trigger.slug}: ${trigger.intent} — evaluate: ${questions.join('; ')}`);
  }
  return ready.length + toJudge.length;
}
