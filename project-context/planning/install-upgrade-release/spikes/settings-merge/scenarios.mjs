import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const [S, MERGE] = process.argv.slice(2);
const j = (v) => JSON.parse(JSON.stringify(v));
const write = (name, v) => { fs.writeFileSync(`${S}/${name}`, JSON.stringify(v, null, 2) + '\n'); return `${S}/${name}`; };
const base = JSON.parse(fs.readFileSync(`${S}/base.json`, 'utf8'));
const cmd = (sub) => `node "$CLAUDE_PROJECT_DIR/.claude/scripts/ang-context-manager.mjs" ${sub}`;

// The install merge from spikes/install-script: user wins, missing keys added, arrays unioned.
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const installMerge = (u, a) => {
  if (Array.isArray(u) && Array.isArray(a)) { const seen = new Set(u.map((x) => JSON.stringify(x))); return [...u, ...a.filter((x) => !seen.has(JSON.stringify(x)))]; }
  if (isObj(u) && isObj(a)) { const out = { ...u }; for (const k of Object.keys(a)) out[k] = k in u ? installMerge(u[k], a[k]) : a[k]; return out; }
  return u;
};

const target = j(base);
target.outputStyle = 'Partners In Crime';
target.hooks.SessionStart[0].hooks[0].command = cmd('session banner --compact');
target.permissions.allow = target.permissions.allow.filter((p) => p !== 'Bash(jq:*)').concat('Bash(gh release view:*)');
target.hooks.UserPromptSubmit = [{ hooks: [{ type: 'command', command: cmd('session prompt') }] }];

// The fake existing project from the install spike, before Ang.
const preAng = {
  outputStyle: 'Explanatory', model: 'opus',
  permissions: { allow: ['Bash(npm test:*)'], deny: ['Read(.env)'] },
  hooks: { Stop: [{ hooks: [{ type: 'command', command: 'say done' }] }] },
};
const customised = installMerge(preAng, base);
// Same, but the user also edited two Ang hooks after installing: one upstream changes, one it doesn't.
const edited = j(customised);
const ss = edited.hooks.SessionStart.find((g) => JSON.stringify(g).includes('session banner'));
ss.hooks[0].command = cmd('session banner --no-mail');
const ptu = edited.hooks.PostToolUse.find((g) => g.matcher);
ptu.matcher = 'Write|Edit|MultiEdit|NotebookEdit';

const runWithReport = (b, o, t) => {
  const r = spawnSync('node', [MERGE, b, o, t], { encoding: 'utf8' });
  return { merged: JSON.parse(r.stdout), report: JSON.parse(r.stderr) };
};

const bp = write('base.json', base), tp = write('target.json', target);
const scenarios = {
  vanilla: j(base),
  customised,
  edited,
};
let fail = 0;
const check = (name, cond) => { console.log(`  ${cond ? 'pass' : 'FAIL'}  ${name}`); if (!cond) fail++; };
const s = (v) => JSON.stringify(v);
const count = (m, needle) => (s(m).match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

for (const [name, ours] of Object.entries(scenarios)) {
  const { merged: m, report } = runWithReport(bp, write(`${name}.json`, ours), tp);
  write(`${name}.merged.json`, m);
  console.log(`\n${name}: +${report.added.length} -${report.removed.length} ~${report.updated.length} conflicts ${report.conflicts.length}`);
  if (name === 'vanilla') check('equals target exactly', s(m) === s(target));
  check('no jq permission left', !s(m).includes('Bash(jq:*)'));
  check('gh permission added once', count(m, 'Bash(gh release view:*)') === 1);
  check('UserPromptSubmit hook added once', count(m, 'session prompt') === 1);
  check('Stop index hook still there once', count(m, 'library index --quiet') === 2);
  check('no hook group appears twice', Object.values(m.hooks).every((gs) => new Set(gs.map(s)).size === gs.length));
  if (name !== 'vanilla') {
    check('user outputStyle, model, deny, own allow and own Stop hook survive',
      m.outputStyle === 'Explanatory' && m.model === 'opus' && s(m.permissions.deny) === s(['Read(.env)']) && m.permissions.allow.includes('Bash(npm test:*)') && s(m).includes('say done'));
  }
  if (name === 'customised') check('old banner hook replaced, not duplicated', count(m, 'session banner') === 1 && s(m).includes('--compact'));
  if (name === 'edited') {
    check('local PostToolUse matcher edit kept', s(m).includes('NotebookEdit'));
    check('banner edited on both sides flagged as a conflict', report.conflicts.some((c) => c.path === '.hooks.SessionStart'));
    console.log('  banner hooks after merge:', m.hooks.SessionStart.map((g) => g.hooks[0].command.split(' ').slice(-2).join(' ')));
    console.log('  conflict:', s(report.conflicts));
  }
  // A second upgrade to the same release changes nothing.
  const again = runWithReport(tp, write(`${name}.merged.json`, m), tp);
  check('re-run is a no-op', s(again.merged) === s(m) && again.report.added.length + again.report.removed.length + again.report.updated.length === 0);
}
// No version record: base unknown, so fall back to an empty base.
const { merged: nr, report: nrr } = runWithReport(write('empty.json', {}), write('customised.json', customised), tp);
write('no-record.merged.json', nr);
console.log(`\nno record (empty base): +${nrr.added.length} -${nrr.removed.length} conflicts ${nrr.conflicts.length}`);
console.log(`  jq permission left: ${s(nr).includes('Bash(jq:*)')}, banner hooks: ${count(nr, 'session banner')}`);
console.log(fail ? `\n${fail} FAILED` : '\nall checks passed');
process.exit(fail ? 1 : 0);
