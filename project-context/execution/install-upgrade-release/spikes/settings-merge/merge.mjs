// Three-way merge of .claude/settings.json for an upgrade.
// base: Ang's settings at the installed SHA; ours: the user's file; theirs: Ang's settings at the target.
// Usage: merge.mjs <base> <ours> <theirs>  → merged JSON on stdout, report on stderr.
import fs from 'node:fs';

const [basePath, oursPath, theirsPath] = process.argv.slice(2);
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const key = (v) => JSON.stringify(v);
const same = (a, b) => key(a) === key(b);
const report = { added: [], removed: [], updated: [], conflicts: [] };

// Arrays are sets of whole entries; a changed hook group is a removed entry plus an added one.
function mergeArray(path, base, ours, theirs) {
  const has = (arr, v) => arr.some((x) => same(x, v));
  for (const b of base) {
    // Both sides dropped the same base entry: each probably replaced it with its own edit.
    if (!has(ours, b) && !has(theirs, b)) report.conflicts.push({ path, base: b, ours: ours.filter((o) => !has(base, o)), theirs: theirs.filter((t) => !has(base, t)) });
  }
  const kept = ours.filter((o) => {
    const dropUpstream = has(base, o) && !has(theirs, o);
    if (dropUpstream) report.removed.push({ path, entry: o });
    return !dropUpstream;
  });
  const added = theirs.filter((t) => !has(base, t) && !has(ours, t));
  added.forEach((t) => report.added.push({ path, entry: t }));
  return [...kept, ...added];
}

function merge(path, base, ours, theirs) {
  if (ours === undefined) {
    // User never had it (or deleted it): take a new upstream key, respect a deleted one.
    if (base === undefined && theirs !== undefined) report.added.push({ path, entry: theirs });
    return base === undefined ? theirs : undefined;
  }
  if (theirs === undefined) {
    if (base !== undefined && same(ours, base)) { report.removed.push({ path, entry: ours }); return undefined; }
    return ours;
  }
  if (isObj(ours) && isObj(theirs)) {
    const b = isObj(base) ? base : {};
    const out = {};
    for (const k of new Set([...Object.keys(ours), ...Object.keys(theirs)])) {
      const v = merge(`${path}.${k}`, b[k], ours[k], theirs[k]);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  if (Array.isArray(ours) && Array.isArray(theirs)) return mergeArray(path, Array.isArray(base) ? base : [], ours, theirs);
  if (same(ours, theirs)) return ours;
  if (base !== undefined && same(ours, base)) { report.updated.push({ path, from: ours, to: theirs }); return theirs; }
  if (base !== undefined && same(theirs, base)) return ours;
  report.conflicts.push({ path, base, ours, theirs });
  return ours;
}

const merged = merge('', read(basePath), read(oursPath), read(theirsPath));
process.stdout.write(JSON.stringify(merged, null, 2) + '\n');
process.stderr.write(JSON.stringify(report, null, 2) + '\n');
