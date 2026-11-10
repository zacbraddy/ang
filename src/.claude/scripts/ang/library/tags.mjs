import fs from 'node:fs';
import path from 'node:path';
import { CTX, STAGES, TAGS_FILE, TRIGGER_DIR } from '../paths.mjs';
import { read, rel, walk, writeJson } from '../util.mjs';
import { parseFrontmatter } from './frontmatter.mjs';

export function loadTags() {
  if (!fs.existsSync(TAGS_FILE)) return [];
  return JSON.parse(read(TAGS_FILE));
}

export function saveTags(tags) {
  const sorted = tags.sort((a, b) => a.tag.localeCompare(b.tag));
  writeJson(TAGS_FILE, sorted);
}

export function taggedDocs() {
  const stageDocs = STAGES.flatMap((stage) => walk(path.join(CTX, stage)));
  return [...stageDocs, ...walk(TRIGGER_DIR)];
}

// tag → paths of the docs that use it
export function tagUsage() {
  const usage = new Map();
  for (const file of taggedDocs()) {
    const tags = parseFrontmatter(read(file))?.tags ?? [];
    for (const tag of tags) {
      const docs = usage.get(tag) ?? [];
      usage.set(tag, [...docs, rel(file)]);
    }
  }
  return usage;
}
