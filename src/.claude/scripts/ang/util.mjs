import fs from 'node:fs';
import path from 'node:path';
import { PROJECT } from './paths.mjs';

export const read = (file) => fs.readFileSync(file, 'utf8');
export const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
export const posix = (p) => p.split(path.sep).join('/');
export const rel = (p) => posix(path.relative(PROJECT, p));
export const today = () => new Date().toISOString().slice(0, 10);
export const isUrl = (s) => /^(https?:|mailto:)/.test(s);
export const unquote = (s) => s.trim().replace(/^["']|["']$/g, '');

export function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

export function walk(dir, includeAllFiles = false) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, includeAllFiles);
    if (includeAllFiles || entry.name.endsWith('.md')) return [full];
    return [];
  });
}
