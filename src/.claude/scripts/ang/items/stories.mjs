import path from 'node:path';
import { parseFrontmatter } from '../library/frontmatter.mjs';
import { read, walk } from '../util.mjs';

export function storiesOf(item) {
  const stories = walk(path.join(item, 'stories')).map((file) => {
    const fm = parseFrontmatter(read(file)) ?? {};
    const num = path.basename(file).match(/^(\d+)/)?.[1] ?? '?';
    return { file, num, fm };
  });
  return stories.sort((a, b) => a.num.localeCompare(b.num));
}

export function dependsOn(fm) {
  const deps = Array.isArray(fm.dependsOn) ? fm.dependsOn : [];
  return deps.map((dep) => String(dep).padStart(2, '0'));
}
