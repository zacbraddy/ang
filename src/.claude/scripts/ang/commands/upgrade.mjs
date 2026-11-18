import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { applyPlan, checkPlan } from '../upgrade/apply.mjs';
import { applyMoves, classifyTrees, readTree } from '../upgrade/classify.mjs';
import { chainGuides, githubGuideFetcher } from '../upgrade/guides.mjs';
import { chooseRoute } from '../upgrade/size.mjs';
import { PROJECT } from '../paths.mjs';
import { fail, readJson } from '../util.mjs';

function folderTree(dir, flag) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) fail(`--${flag} ${dir}: folder not found`);
  return readTree(dir);
}

function readGuides(file) {
  if (!file) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return fail(`--guides ${file}: unreadable (${error.message})`);
  }
}

// The instance is read only at paths Ang ships, plus each move's old path so a user's edits follow the move.
function readInstance(paths) {
  const files = new Map();
  for (const p of paths) {
    const file = path.join(PROJECT, p);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) files.set(p, fs.readFileSync(file));
  }
  return files;
}

function plan({ base, target, guides: guidesFile }) {
  const hasRecord = base !== 'none';
  const rawBase = hasRecord ? folderTree(base, 'base') : new Map();
  const theirs = folderTree(target, 'target');
  const guides = readGuides(guidesFile);
  const moveSources = guides.flatMap((g) => g.moves.map((m) => m.from));
  const baseFiles = applyMoves(rawBase, guides).files;
  const ours = applyMoves(readInstance(new Set([...rawBase.keys(), ...theirs.keys(), ...moveSources])), guides);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ang-upgrade-'));
  try {
    const entries = classifyTrees(baseFiles, ours.files, theirs, ours.movedFrom).map(({ merged, ...entry }) => {
      if (merged === null) return entry;
      const mergedFile = path.join(tempDir, entry.path);
      fs.mkdirSync(path.dirname(mergedFile), { recursive: true });
      fs.writeFileSync(mergedFile, merged);
      return { ...entry, mergedFile };
    });
    return { route: chooseRoute(entries, hasRecord), entries, tempDir };
  } catch (error) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw error;
  }
}

export default [
  {
    noun: 'upgrade', verb: 'guides', args: [],
    flags: [{ name: 'from', value: 'tag', required: true }, { name: 'to', value: 'tag', required: true }],
    summary: 'print the upgrade guides between two Ang tags as JSON, oldest first, chained by their from: lines',
    // dispatch doesn't await run, so the rejection is caught here rather than left unhandled.
    run(_, { from, to }) {
      return chainGuides(githubGuideFetcher(to), from, to)
        .then((guides) => console.log(JSON.stringify(guides, null, 2)))
        .catch((error) => fail(error.message));
    },
  },
  {
    noun: 'upgrade', verb: 'plan', args: [],
    flags: [{ name: 'base', value: 'dir|none', required: true }, { name: 'target', value: 'dir', required: true }, { name: 'guides', value: 'file' }],
    summary: 'classify every shipped file across base, project and target; print { route, entries, tempDir } with merged files in tempDir',
    run(_, flags) {
      try {
        console.log(JSON.stringify(plan(flags), null, 2));
      } catch (error) {
        fail(error.message);
      }
    },
  },
  {
    noun: 'upgrade', verb: 'apply', args: [],
    flags: [{ name: 'plan', value: 'file', required: true }],
    summary: 'check a resolved upgrade plan, then write it to the working tree unstaged; any problem writes nothing',
    run(_, { plan: planFile }) {
      const { entries } = readJson(planFile);
      if (!Array.isArray(entries)) fail(`${planFile}: no entries array`);
      const problems = checkPlan(entries);
      if (problems.length) fail(`plan not applied, nothing written:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
      console.log(JSON.stringify(applyPlan(entries, PROJECT), null, 2));
    },
  },
];
