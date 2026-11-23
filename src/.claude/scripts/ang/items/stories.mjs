import path from "node:path";
import { parseFrontmatter } from "../library/frontmatter.mjs";
import { read, walk } from "../util.mjs";

export function storiesOf(item) {
  const stories = walk(path.join(item, "stories")).map((file) => {
    const frontmatter = parseFrontmatter(read(file)) ?? {};
    const leadingDigits = path.basename(file).match(/^(\d+)/)?.[1];

    return { file, num: leadingDigits ?? "?", fm: frontmatter };
  });

  return stories.sort((a, b) => a.num.localeCompare(b.num));
}

export function dependsOn(frontmatter) {
  const deps = Array.isArray(frontmatter.dependsOn)
    ? frontmatter.dependsOn
    : [];

  return deps.map((dep) => String(dep).padStart(2, "0"));
}
