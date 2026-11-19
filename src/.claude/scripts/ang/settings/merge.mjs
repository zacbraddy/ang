// Three-way merge of .claude/settings.json. base: Ang's settings at the installed version ({} when unknown, which gives
// the install merge); ours: the user's file; theirs: Ang's settings at the target version.

// Top-level keys whose conflicts aren't reported: tailor-ang owns outputStyle, so the user's value is kept silently.
export const SKIPPED_KEYS = new Set(['outputStyle']);

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const canonical = (v) => {
  if (Array.isArray(v)) return v.map(canonical);
  if (!isObject(v)) return v;
  return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])]));
};
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const has = (entries, value) => entries.some((e) => same(e, value));

// Arrays are sets of whole entries: a changed hook group is one entry removed and another added.
export function mergeArray(base, ours, theirs, path = []) {
  const conflicts = [];
  const oursOnly = ours.filter((o) => !has(base, o) && !has(theirs, o));
  const theirsOnly = theirs.filter((t) => !has(base, t) && !has(ours, t));
  for (const entry of base) {
    // Both sides dropped the same entry and each added its own, so each probably replaced it with its own edit.
    if (!has(ours, entry) && !has(theirs, entry) && oursOnly.length && theirsOnly.length) {
      conflicts.push({ path, base: entry, ours: oursOnly, theirs: theirsOnly });
    }
  }
  const kept = ours.filter((o) => !(has(base, o) && !has(theirs, o)));
  const added = theirs.filter((t) => !has(base, t) && !has(ours, t));
  return { merged: [...kept, ...added], conflicts };
}

function merge(path, base, ours, theirs, conflicts) {
  // Missing from the user's file: a new Ang key arrives, one the user deleted stays deleted.
  if (ours === undefined) return base === undefined ? theirs : undefined;
  if (theirs === undefined) return base !== undefined && same(ours, base) ? undefined : ours;
  if (isObject(ours) && isObject(theirs)) {
    const b = isObject(base) ? base : {};
    const out = {};
    for (const k of new Set([...Object.keys(ours), ...Object.keys(theirs)])) {
      const value = merge([...path, k], b[k], ours[k], theirs[k], conflicts);
      if (value !== undefined) out[k] = value;
    }
    return out;
  }
  if (Array.isArray(ours) && Array.isArray(theirs)) {
    const result = mergeArray(Array.isArray(base) ? base : [], ours, theirs, path);
    conflicts.push(...result.conflicts);
    return result.merged;
  }
  if (same(ours, theirs)) return ours;
  if (base !== undefined && same(ours, base)) return theirs;
  if (base === undefined || !same(theirs, base)) conflicts.push({ path, base, ours, theirs });
  return ours;
}

export function mergeSettings(base, ours, theirs) {
  const conflicts = [];
  const merged = merge([], base, ours, theirs, conflicts);
  return { merged, conflicts: conflicts.filter((c) => !SKIPPED_KEYS.has(c.path[0])) };
}
