import fs from 'node:fs';
import path from 'node:path';
import { CTX } from '../paths.mjs';
import { fail, posix, read, rel, today, walk } from '../util.mjs';
import { buildIndex } from '../library/index.mjs';
import { loadTriggers, saveTriggers } from '../triggers/triggers.mjs';
import { emptyState, hasState, loadState, logLineage, nextId, saveState } from './state.mjs';
import { stageOf } from './resolve.mjs';

// Rewrites absolute /project-context/… references in every doc. Returns how many docs changed.
function rewriteAbsoluteRefs(pairs) {
  const longestFirst = [...pairs].sort((a, b) => b[0].length - a[0].length);
  let rewritten = 0;
  for (const file of walk(CTX)) {
    const original = read(file);
    let text = original;
    for (const [from, to] of longestFirst) text = text.split(from).join(to);
    if (text === original) continue;
    fs.writeFileSync(file, text);
    rewritten++;
  }
  return rewritten;
}

export function moveItem(from, stage) {
  const to = path.join(CTX, stage, path.basename(from));
  if (fs.existsSync(to)) fail(`already exists: ${rel(to)}`);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);
  const rewritten = rewriteAbsoluteRefs([[`/${rel(from)}/`, `/${rel(to)}/`]]);
  logLineage(to, `moved ${stageOf(from)} → ${stageOf(to)}`);
  buildIndex();
  console.log(`✔ moved ${rel(from)} → ${rel(to)} (rewrote links in ${rewritten} file(s))`);
}

// old path → new path for every file moving from incoming into target; the incoming hub maps onto the target hub.
function planMergeMoves(incoming, target, nest) {
  const slug = path.basename(incoming);
  const moves = new Map();
  for (const file of walk(incoming, true)) {
    const relative = path.relative(incoming, file);
    if (['README.md', 'state.json', 'index.json'].includes(relative)) continue;
    let dest = nest ? path.join(target, nest, slug, relative) : path.join(target, relative);
    if (fs.existsSync(dest)) {
      const ext = path.extname(dest);
      const stem = ext ? dest.slice(0, -ext.length) : dest;
      dest = `${stem}-${slug}${ext}`;
    }
    moves.set(file, dest);
  }
  moves.set(path.join(incoming, 'README.md'), path.join(target, 'README.md'));
  return moves;
}

// Relative links inside moved docs: resolve against the old location, point at the new one.
function rewriteRelativeLinks(moves, targetHub) {
  for (const [from, to] of moves) {
    if (!to.endsWith('.md') || to === targetHub || !fs.existsSync(to)) continue;
    const text = read(to).replace(/\]\(([^)\s]+)\)/g, (whole, link) => {
      if (/^(https?:|mailto:|#|\/)/.test(link)) return whole;
      const [linkPath, anchor] = link.split('#');
      const oldAbs = path.resolve(path.dirname(from), decodeURI(linkPath));
      const newAbs = moves.get(oldAbs) ?? oldAbs;
      let relative = posix(path.relative(path.dirname(to), newAbs));
      if (!relative.startsWith('.')) relative = `./${relative}`;
      return `](${relative}${anchor ? `#${anchor}` : ''})`;
    });
    fs.writeFileSync(to, text);
  }
}

function mergeState(incoming, target, moves, nest) {
  const slug = path.basename(incoming);
  const incState = hasState(incoming) ? loadState(incoming) : emptyState();
  const tgtState = hasState(target) ? loadState(target) : emptyState();
  const remap = (ref) => {
    if (!ref || /^(https?:|mailto:|\/)/.test(ref)) return ref;
    const moved = moves.get(path.resolve(incoming, ref));
    return moved ? posix(path.relative(target, moved)) : ref;
  };
  for (const u of incState.unknowns) tgtState.unknowns.push({ ...u, id: nextId(tgtState.unknowns, 'u'), from: slug });
  for (const k of incState.knowns) tgtState.knowns.push({ ...k, id: nextId(tgtState.knowns, 'k'), source: remap(k.source), from: slug });
  for (const d of incState.decisions) tgtState.decisions.push({ ...d, id: nextId(tgtState.decisions, 'd'), evidence: remap(d.evidence), from: slug });
  for (const l of incState.lineage) tgtState.lineage.push({ ...l, event: `[${slug}] ${l.event}` });
  const nestNote = nest ? ` into ${nest}/` : '';
  tgtState.lineage.push({ date: today(), event: `merged ${slug} from ${stageOf(incoming)}${nestNote}` });
  saveState(target, tgtState);
}

function repointTriggers(fromSlug, toSlug) {
  const triggers = loadTriggers();
  const repointCondition = (c) => c
    .replace(new RegExp(`^story:${fromSlug}/`), `story:${toSlug}/`)
    .replace(new RegExp(`^stage:${fromSlug}=`), `stage:${toSlug}=`);
  const repointed = triggers.map((t) => ({ ...t, conditions: t.conditions.map(repointCondition) }));
  if (JSON.stringify(repointed) !== JSON.stringify(triggers)) saveTriggers(repointed);
}

export function mergeItem(incoming, target, nest) {
  if (incoming === target) fail('cannot merge an item into itself');
  const slug = path.basename(incoming);
  const targetHub = path.join(target, 'README.md');
  const moves = planMergeMoves(incoming, target, nest);

  for (const [from, to] of moves) {
    const isIncomingHub = from === path.join(incoming, 'README.md');
    if (isIncomingHub || !fs.existsSync(from)) continue;
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(from, to);
  }
  rewriteRelativeLinks(moves, targetHub);
  const absolutePairs = [...moves].map(([from, to]) => [`/${rel(from)}`, `/${rel(to)}`]);
  const rewritten = rewriteAbsoluteRefs(absolutePairs);
  mergeState(incoming, target, moves, nest);
  repointTriggers(slug, path.basename(target));
  fs.rmSync(incoming, { recursive: true, force: true });
  buildIndex();
  console.log(`✔ merged ${slug} → ${rel(target)} (${moves.size - 1} file(s) moved, links rewritten in ${rewritten} file(s))`);
  console.log('  Next: dedupe/reprioritise with state commands (state show, state remove, state order) and rewrite the target hub.');
}
