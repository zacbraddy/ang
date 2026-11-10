import fs from 'node:fs';
import path from 'node:path';
import { CTX, DEPARTMENTS, FLOW, PROJECT, STAGES, TAGS_FILE } from '../paths.mjs';
import { read, rel, walk } from '../util.mjs';
import { parseFrontmatter } from './frontmatter.mjs';
import { saveTags } from './tags.mjs';

function indexEntry(file) {
  const fm = parseFrontmatter(read(file)) ?? {};
  return {
    title: typeof fm.title === 'string' ? fm.title : path.basename(file, '.md'),
    path: rel(file),
    shortDescription: typeof fm.shortDescription === 'string' ? fm.shortDescription : '',
    tags: Array.isArray(fm.tags) ? fm.tags : [],
  };
}

// Returns how many index.json files changed.
export function buildIndex() {
  let changed = 0;
  for (const stage of STAGES) {
    const dir = path.join(CTX, stage);
    if (!fs.existsSync(dir)) continue;
    const entries = walk(dir).map(indexEntry).sort((a, b) => a.path.localeCompare(b.path));
    const out = JSON.stringify(entries, null, 2) + '\n';
    const indexFile = path.join(dir, 'index.json');
    const unchanged = fs.existsSync(indexFile) && read(indexFile) === out;
    if (unchanged) continue;
    fs.writeFileSync(indexFile, out);
    changed++;
  }
  return changed;
}

function ensureDirWithGitkeep(dir) {
  fs.mkdirSync(dir, { recursive: true });
  if (fs.readdirSync(dir).length === 0) fs.writeFileSync(path.join(dir, '.gitkeep'), '');
}

export function initLibrary() {
  const departmentDirs = DEPARTMENTS.filter((d) => d !== 'technical').map((d) => `10k/${d}`);
  const dirs = [...FLOW, '10k/technical/architecture', '10k/technical/adrs', ...departmentDirs];
  for (const dir of dirs) ensureDirWithGitkeep(path.join(CTX, dir));
  ensureDirWithGitkeep(path.join(PROJECT, 'workflow-improvements'));
  if (!fs.existsSync(TAGS_FILE)) saveTags([]);
  buildIndex();
}
