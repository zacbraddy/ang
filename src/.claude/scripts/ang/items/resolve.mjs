import fs from 'node:fs';
import path from 'node:path';
import { CTX, FLOW, ITEM_STAGES, PROJECT } from '../paths.mjs';
import { fail, rel } from '../util.mjs';

// <item> is a path (project-context/ideas/foo) or a bare slug found in any stage folder.
export function resolveItem(arg) {
  if (!arg) fail('item path or slug required');
  const direct = path.resolve(PROJECT, arg);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  for (const stage of FLOW) {
    const candidate = path.join(CTX, stage, arg);
    if (fs.existsSync(candidate)) return candidate;
  }
  fail(`item not found: ${arg}`);
}

// Like resolveItem for a bare slug, but returns null instead of failing (trigger conditions).
export function findItem(slug) {
  for (const stage of ITEM_STAGES) {
    const candidate = path.join(CTX, stage, slug);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export const stageOf = (item) => rel(item).split('/')[1];
