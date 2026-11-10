import fs from 'node:fs';
import path from 'node:path';
import { CTX, PROJECT } from '../paths.mjs';
import { fail, isUrl, read, rel, today, writeJson } from '../util.mjs';

export const statePath = (item) => path.join(item, 'state.json');
export const hasState = (item) => fs.existsSync(statePath(item));
export const emptyState = () => ({ status: 'active', statusNote: '', unknowns: [], knowns: [], decisions: [], lineage: [] });

export function loadState(item) {
  if (!hasState(item)) fail(`no state.json in ${rel(item)} — run: state init ${rel(item)}`);
  return JSON.parse(read(statePath(item)));
}

export const saveState = (item, state) => writeJson(statePath(item), state);

export function logLineage(item, event) {
  if (!hasState(item)) return;
  const state = loadState(item);
  state.lineage.push({ date: today(), event });
  saveState(item, state);
}

export function nextId(list, prefix) {
  const numbers = list.map((entry) => Number(String(entry.id).replace(/\D/g, '')) || 0);
  return `${prefix}${Math.max(0, ...numbers) + 1}`;
}

// The kinds of state entry, keyed by the id prefix that names them (u3, k2, d1).
export const ENTRY_KINDS = {
  u: { kind: 'unknown', list: 'unknowns', text: 'question', ref: 'approach' },
  k: { kind: 'known', list: 'knowns', text: 'fact', ref: 'source' },
  d: { kind: 'decision', list: 'decisions', text: 'decision', ref: 'evidence' },
};
export const kindByName = (name) => Object.entries(ENTRY_KINDS).find(([, k]) => k.kind === name);
export const kindOfId = (id) => ENTRY_KINDS[id?.[0]];

export const resolveRef = (item, ref) => (ref.startsWith('/') ? path.join(PROJECT, ref) : path.resolve(item, ref));

// raw files are consumed and deleted by design, so a source pointing into raw/ breaks validate later
export const RAW_SOURCE_HINT = 'raw files get deleted once consumed; cite the durable doc the fact lands in instead';
export function citesRaw(item, ref) {
  if (!ref || isUrl(ref)) return false;
  const inside = path.relative(path.join(CTX, 'raw'), resolveRef(item, ref));
  return !inside.startsWith('..') && !path.isAbsolute(inside);
}
export function refuseRawSource(item, ref) {
  if (citesRaw(item, ref)) fail(`source ${ref} is under project-context/raw/: ${RAW_SOURCE_HINT}`);
}
