import { EPIC_TYPES, ITEM_STATUSES } from '../paths.mjs';
import { fail, rel, today } from '../util.mjs';
import { resolveItem, stageOf } from '../items/resolve.mjs';
import {
  emptyState, ENTRY_KINDS, hasState, kindByName, kindOfId, loadState, nextId, refuseRawSource, saveState, statePath,
} from '../items/state.mjs';

const KIND_NAMES = Object.values(ENTRY_KINDS).map((k) => k.kind);

// Loads the item's state, applies the change, saves it and confirms.
function updateState(itemArg, change) {
  const item = resolveItem(itemArg);
  const state = loadState(item);
  change(state, item);
  saveState(item, state);
  return item;
}

function printState(item) {
  const s = loadState(item);
  const note = s.statusNote ? ` (${s.statusNote})` : '';
  const type = s.type ? ` [${s.type}]` : '';
  const from = (entry) => (entry.from ? `  (from ${entry.from})` : '');
  console.log(`${rel(item)} — ${s.status}${note}${type}`);
  console.log('\nUnknowns (priority order):');
  s.unknowns.forEach((u) => console.log(`  ${u.id}  ${u.question}${u.approach ? `  — via: ${u.approach}` : ''}${from(u)}`));
  console.log('\nKnowns:');
  s.knowns.forEach((k) => console.log(`  ${k.id}  ${k.fact}  → ${k.source}${from(k)}`));
  console.log('\nDecisions:');
  s.decisions.forEach((d) => console.log(`  ${d.id}  ${d.decision}  → ${d.evidence}`));
}

function addEntry(state, item, kindName, text, ref, top) {
  const [prefix, kind] = kindByName(kindName);
  if (top && kindName !== 'unknown') fail('--top only applies to unknowns');
  if (kindName !== 'unknown' && !ref) fail(`a ${kindName} needs its ${kind.ref}`);
  if (kindName !== 'unknown') refuseRawSource(item, ref);
  const entry = { id: nextId(state[kind.list], prefix), [kind.text]: text, [kind.ref]: ref ?? '' };
  if (top) state[kind.list].unshift(entry);
  else state[kind.list].push(entry);
  if (kindName === 'decision') state.lineage.push({ date: today(), event: `decided: ${text}` });
  console.log(`✔ added ${entry.id}`);
}

// Rewrites an entry in place so a changed item never sits beside the one it contradicts.
function replaceEntry(state, item, id, text, ref) {
  const kind = kindOfId(id);
  const entry = kind && state[kind.list].find((x) => x.id === id);
  if (!entry) fail(`no entry with id ${id}`);
  if (ref && kind.kind !== 'unknown') refuseRawSource(item, ref);
  const changes = [];
  if (entry[kind.text] !== text) changes.push(`${entry[kind.text]} → ${text}`);
  if (ref && entry[kind.ref] !== ref) changes.push(`${kind.ref}: ${entry[kind.ref]} → ${ref}`);
  if (!changes.length) fail(`${id} already says that`);
  state.lineage.push({ date: today(), event: `replaced ${id}: ${changes.join('; ')}` });
  entry[kind.text] = text;
  if (ref) entry[kind.ref] = ref;
  console.log(`✔ replaced ${id}`);
}

const confirmUpdated = (item) => console.log(`✔ ${rel(statePath(item))} updated`);

export default [
  {
    noun: 'state', verb: 'init', args: [{ name: 'item' }], flags: [{ name: 'type', enum: EPIC_TYPES }],
    summary: 'create state.json for an item',
    run({ item: itemArg }, { type }) {
      const item = resolveItem(itemArg);
      if (hasState(item)) fail(`state.json already exists in ${rel(item)}`);
      const state = emptyState();
      if (type) state.type = type;
      state.lineage.push({ date: today(), event: `created in ${stageOf(item)}` });
      saveState(item, state);
      console.log(`✔ state initialised for ${rel(item)}`);
    },
  },
  {
    noun: 'state', verb: 'show', args: [{ name: 'item' }], flags: [],
    summary: 'print status, unknowns (priority order), knowns and decisions',
    run({ item }) {
      printState(resolveItem(item));
    },
  },
  {
    noun: 'state', verb: 'status', args: [{ name: 'item' }, { name: 'status', enum: ITEM_STATUSES }, { name: 'note', optional: true }], flags: [],
    summary: 'set the item status, with an optional note',
    run({ item, status, note }) {
      const updated = updateState(item, (s) => {
        s.status = status;
        s.statusNote = note ?? '';
        s.lineage.push({ date: today(), event: `status → ${status}${note ? `: ${note}` : ''}` });
      });
      confirmUpdated(updated);
    },
  },
  {
    noun: 'state', verb: 'type', args: [{ name: 'item' }, { name: 'type', enum: EPIC_TYPES }], flags: [],
    summary: 'set the epic type',
    run({ item, type }) {
      const updated = updateState(item, (s) => {
        s.type = type;
      });
      confirmUpdated(updated);
    },
  },
  {
    noun: 'state', verb: 'lineage', args: [{ name: 'item' }, { name: 'event' }], flags: [],
    summary: 'log a lineage event',
    run({ item, event }) {
      const updated = updateState(item, (s) => {
        s.lineage.push({ date: today(), event });
      });
      confirmUpdated(updated);
    },
  },
  {
    noun: 'state', verb: 'add', args: [{ name: 'item' }, { name: 'kind', enum: KIND_NAMES }, { name: 'text' }, { name: 'ref', optional: true }], flags: [{ name: 'top' }],
    summary: 'add an entry; ref is the approach (optional) / source / evidence; --top puts an unknown first',
    run({ item, kind, text, ref }, { top }) {
      updateState(item, (s, resolved) => addEntry(s, resolved, kind, text, ref, top));
    },
  },
  {
    noun: 'state', verb: 'replace', args: [{ name: 'item' }, { name: 'id' }, { name: 'text' }, { name: 'ref', optional: true }], flags: [],
    summary: 'rewrite an entry in place (id u3, k2, d1), keep the id, log lineage',
    run({ item, id, text, ref }) {
      updateState(item, (s, resolved) => replaceEntry(s, resolved, id, text, ref));
    },
  },
  {
    noun: 'state', verb: 'answer', args: [{ name: 'item' }, { name: 'id' }, { name: 'fact' }, { name: 'source' }], flags: [],
    summary: 'turn an unknown into a known',
    run({ item, id, fact, source }) {
      updateState(item, (s, resolved) => {
        const unknown = s.unknowns.find((u) => u.id === id);
        if (!unknown) fail(`no unknown ${id}`);
        refuseRawSource(resolved, source);
        s.unknowns = s.unknowns.filter((u) => u.id !== id);
        const known = { id: nextId(s.knowns, 'k'), fact, source, answers: unknown.question };
        s.knowns.push(known);
        console.log(`✔ ${id} answered → ${known.id}`);
      });
    },
  },
  {
    noun: 'state', verb: 'order', args: [{ name: 'item' }, { name: 'ids', variadic: true }], flags: [],
    summary: 'put the listed unknowns first, in that order',
    run({ item, ids }) {
      updateState(item, (s) => {
        const first = ids.map((id) => s.unknowns.find((u) => u.id === id) ?? fail(`no unknown ${id}`));
        const rest = s.unknowns.filter((u) => !ids.includes(u.id));
        s.unknowns = [...first, ...rest];
        console.log(`✔ reordered: ${s.unknowns.map((u) => u.id).join(', ')}`);
      });
    },
  },
  {
    noun: 'state', verb: 'remove', args: [{ name: 'item' }, { name: 'id' }], flags: [],
    summary: 'remove an entry by id (u3, k2, d1), log lineage',
    run({ item, id }) {
      const updated = updateState(item, (s) => {
        const kind = kindOfId(id);
        const entry = kind && s[kind.list].find((x) => x.id === id);
        if (!entry) fail(`no entry with id ${id}`);
        s[kind.list] = s[kind.list].filter((x) => x.id !== id);
        s.lineage.push({ date: today(), event: `removed ${id}: ${entry[kind.text]}` });
      });
      confirmUpdated(updated);
    },
  },
];
