// Starting values from the upgrade merge spike. Revisit when users report upgrades taking the wrong route.
export const AGENT_RESOLVES_UP_TO = 5;
export const WARN_FROM = 12;
export const CONFLICTED = ['conflict', 'conflict-no-base', 'conflict-delete'];

export function chooseRoute(entries, hasRecord) {
  const conflicts = entries.filter((e) => CONFLICTED.includes(e.category));
  const counts = {
    conflictedFiles: conflicts.length,
    conflictHunks: conflicts.reduce((sum, e) => sum + Math.max(e.hunks, 1), 0),
    cleanMerges: entries.filter((e) => e.category === 'clean-merge').length,
  };
  const route = (name, reason) => ({ route: name, ...counts, reason });
  const files = `${counts.conflictedFiles} conflicted file${counts.conflictedFiles === 1 ? '' : 's'}`;

  if (!hasRecord) return route('guided-with-warning', 'no version record, so every file both sides have looks conflicted');
  if (counts.conflictedFiles >= WARN_FROM) return route('guided-with-warning', `${files}, at or over ${WARN_FROM}`);
  if (counts.conflictedFiles > AGENT_RESOLVES_UP_TO) return route('guided', `${files}, over ${AGENT_RESOLVES_UP_TO}`);
  if (counts.conflictedFiles || counts.cleanMerges) return route('agent-resolved', `${files} and ${counts.cleanMerges} clean merges to reread`);
  return route('fast', 'every change is one-sided');
}
