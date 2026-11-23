// Three-way merge of .claude/settings.json. base: Ang's settings at the installed version ({} when unknown, which gives
// the install merge); ours: the user's file; theirs: Ang's settings at the target version.

// Top-level keys whose conflicts aren't reported: tailor-ang owns outputStyle, so the user's value is kept silently.
export const SKIPPED_KEYS = new Set(["outputStyle"]);

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const canonical = (value) => {
  if (Array.isArray(value)) {
    return value.map(canonical);
  }

  if (!isObject(value)) {
    return value;
  }

  const sortedKeys = Object.keys(value).sort();

  return Object.fromEntries(
    sortedKeys.map((key) => [key, canonical(value[key])]),
  );
};

const same = (a, b) =>
  JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const includesEntry = (entries, value) => entries.some((e) => same(e, value));

// Arrays are sets of whole entries: a changed hook group is one entry removed and another added.
export function mergeArray(base, ours, theirs, path = []) {
  const isNew = (entry) => !includesEntry(base, entry);
  const oursOnly = ours.filter((o) => isNew(o) && !includesEntry(theirs, o));
  const theirsOnly = theirs.filter((t) => isNew(t) && !includesEntry(ours, t));
  const bothAddedEntries = oursOnly.length > 0 && theirsOnly.length > 0;
  const conflicts = [];

  for (const entry of base) {
    const droppedByBoth =
      !includesEntry(ours, entry) && !includesEntry(theirs, entry);

    // Both sides dropped the same entry and each added its own, so each probably replaced it with its own edit.
    if (droppedByBoth && bothAddedEntries) {
      conflicts.push({ path, base: entry, ours: oursOnly, theirs: theirsOnly });
    }
  }

  const droppedByTheirs = (entry) =>
    includesEntry(base, entry) && !includesEntry(theirs, entry);
  const kept = ours.filter((o) => !droppedByTheirs(o));

  return { merged: [...kept, ...theirsOnly], conflicts };
}

function mergeObject(path, base, ours, theirs, conflicts) {
  const baseObject = isObject(base) ? base : {};
  const allKeys = new Set([...Object.keys(ours), ...Object.keys(theirs)]);
  const merged = {};

  for (const key of allKeys) {
    const value = merge(
      [...path, key],
      baseObject[key],
      ours[key],
      theirs[key],
      conflicts,
    );

    if (value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
}

function merge(path, base, ours, theirs, conflicts) {
  const matchesBase = (value) => base !== undefined && same(value, base);

  // Missing from the user's file: a new Ang key arrives, one the user deleted stays deleted.
  if (ours === undefined) {
    return base === undefined ? theirs : undefined;
  }

  if (theirs === undefined) {
    return matchesBase(ours) ? undefined : ours;
  }

  if (isObject(ours) && isObject(theirs)) {
    return mergeObject(path, base, ours, theirs, conflicts);
  }

  if (Array.isArray(ours) && Array.isArray(theirs)) {
    const baseArray = Array.isArray(base) ? base : [];
    const result = mergeArray(baseArray, ours, theirs, path);

    conflicts.push(...result.conflicts);

    return result.merged;
  }

  if (same(ours, theirs)) {
    return ours;
  }

  if (matchesBase(ours)) {
    return theirs;
  }

  if (!matchesBase(theirs)) {
    conflicts.push({ path, base, ours, theirs });
  }

  return ours;
}

export function mergeSettings(base, ours, theirs) {
  const conflicts = [];
  const merged = merge([], base, ours, theirs, conflicts);

  return {
    merged,
    conflicts: conflicts.filter((c) => !SKIPPED_KEYS.has(c.path[0])),
  };
}
