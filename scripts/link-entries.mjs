#!/usr/bin/env node
// Keeps the root .claude/skills and .claude/agents in step with src/.claude: one relative link per shipped entry.
// Anything at the root that isn't a link is repo-only tooling and never touched.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const KINDS = ['skills', 'agents'];

const entries = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => !name.startsWith('.')).sort() : []);

export function planLinks(srcDir, rootDir) {
  const plan = { create: [], remove: [], conflicts: [] };
  for (const kind of KINDS) {
    const srcKind = path.join(srcDir, '.claude', kind);
    const rootKind = path.join(rootDir, '.claude', kind);
    const shipped = new Set(entries(srcKind));
    const present = entries(rootKind);

    for (const name of present) {
      const link = path.join(rootKind, name);
      if (!fs.lstatSync(link).isSymbolicLink()) {
        if (shipped.has(name)) plan.conflicts.push(link);
        continue;
      }
      const pointsAtTwin = path.resolve(rootKind, fs.readlinkSync(link)) === path.join(srcKind, name);
      if (!shipped.has(name) || !pointsAtTwin) plan.remove.push(link);
    }

    for (const name of shipped) {
      const link = path.join(rootKind, name);
      if (present.includes(name) && !plan.remove.includes(link)) continue;
      plan.create.push({ path: link, target: path.relative(rootKind, path.join(srcKind, name)) });
    }
  }
  return plan;
}

export function applyLinks({ create, remove }) {
  for (const link of remove) fs.unlinkSync(link);
  for (const { path: link, target } of create) {
    fs.mkdirSync(path.dirname(link), { recursive: true });
    fs.symlinkSync(target, link);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(import.meta.dirname, '..');
  const plan = planLinks(path.join(root, 'src'), root);
  const rel = (file) => path.relative(root, file);
  applyLinks(plan);
  for (const link of plan.remove) console.log(`removed ${rel(link)}`);
  for (const { path: link, target } of plan.create) console.log(`linked ${rel(link)} → ${target}`);
  for (const link of plan.conflicts) console.error(`conflict: ${rel(link)} is repo-only but shares a name with a src/ entry`);
  if (!plan.create.length && !plan.remove.length && !plan.conflicts.length) console.log('links in sync, nothing changed');
  if (plan.conflicts.length) process.exit(1);
}
