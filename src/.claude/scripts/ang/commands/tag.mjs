import fs from "node:fs";
import { DEPARTMENTS, SLUG_RE, TAG_LIMIT } from "../paths.mjs";
import { fail, read } from "../util.mjs";
import {
  parseFrontmatter,
  setFrontmatterTags,
} from "../library/frontmatter.mjs";
import { buildIndex } from "../library/index.mjs";
import { loadTags, saveTags, taggedDocs, tagUsage } from "../library/tags.mjs";

function printStats() {
  const tags = loadTags();
  const usage = tagUsage();
  const uses = (tag) => usage.get(tag)?.length ?? 0;
  const byUse = [...tags].sort((a, b) => uses(b.tag) - uses(a.tag));

  console.log(`${tags.length} tags registered (soft limit ${TAG_LIMIT})\n`);

  for (const entry of byUse) {
    const useCount = String(uses(entry.tag)).padStart(4);
    const departments = entry.department.join(", ");

    console.log(
      `${useCount}  ${entry.tag}  [${departments}]  ${entry.shortDescription}`,
    );
  }

  const registered = new Set(tags.map((t) => t.tag));
  const unregistered = [...usage.keys()].filter((t) => !registered.has(t));

  if (unregistered.length) {
    console.log(`\nUsed but unregistered: ${unregistered.join(", ")}`);
  }
}

function retagDocs(fromTags, into) {
  const isMerging = (tag) => fromTags.includes(tag);
  let touched = 0;

  for (const file of taggedDocs()) {
    const text = read(file);
    const currentTags = parseFrontmatter(text)?.tags ?? [];

    if (!currentTags.some(isMerging)) {
      continue;
    }

    const renamedTags = currentTags.map((tag) => (isMerging(tag) ? into : tag));
    const renamed = [...new Set(renamedTags)];

    fs.writeFileSync(file, setFrontmatterTags(text, renamed));
    touched++;
  }

  return touched;
}

export default [
  {
    noun: "tag",
    verb: "stats",
    args: [],
    flags: [],
    summary: "registered tags by usage, plus tags used but not registered",
    run: printStats,
  },
  {
    noun: "tag",
    verb: "add",
    args: [{ name: "tag" }, { name: "description" }, { name: "departments" }],
    flags: [],
    summary: `register a tag; departments are comma-separated (${DEPARTMENTS.join(", ")})`,
    run({ tag, description, departments }) {
      const tags = loadTags();

      if (!SLUG_RE.test(tag)) {
        fail("tags are kebab-case");
      }

      if (tags.some((t) => t.tag === tag)) {
        fail(`tag exists: ${tag}`);
      }

      const department = departments.split(",").map((d) => d.trim());
      const unknownDepartments = department.filter(
        (d) => !DEPARTMENTS.includes(d),
      );

      if (unknownDepartments.length) {
        fail(
          `unknown department(s): ${unknownDepartments.join(", ")} — valid: ${DEPARTMENTS.join(", ")}`,
        );
      }

      saveTags([...tags, { tag, shortDescription: description, department }]);
      console.log(`✔ added tag ${tag}`);
    },
  },
  {
    noun: "tag",
    verb: "merge",
    args: [{ name: "tags", variadic: true }],
    flags: [{ name: "into", value: "tag", required: true }],
    summary:
      "rewrite every doc using the tags to use --into instead, then unregister them",
    run({ tags: mergeArgs }, { into }) {
      const tags = loadTags();
      const fromTags = mergeArgs.filter((t) => t !== into);
      const target = tags.find((t) => t.tag === into);

      if (!target) {
        fail(`target tag "${into}" not registered — add it first`);
      }

      const touched = retagDocs(fromTags, into);
      const mergedTags = tags.filter((t) => fromTags.includes(t.tag));

      for (const merged of mergedTags) {
        target.department = [
          ...new Set([...target.department, ...merged.department]),
        ];
      }

      saveTags(tags.filter((t) => !fromTags.includes(t.tag)));
      buildIndex();
      console.log(
        `✔ merged ${fromTags.join(", ")} → ${into} (${touched} doc(s) updated)`,
      );
    },
  },
  {
    noun: "tag",
    verb: "remove",
    args: [{ name: "tag" }],
    flags: [],
    summary: "unregister an unused tag",
    run({ tag }) {
      const used = tagUsage().get(tag);

      if (used?.length) {
        fail(`"${tag}" is used by ${used.length} doc(s); merge it instead`);
      }

      saveTags(loadTags().filter((t) => t.tag !== tag));
      console.log(`✔ removed tag ${tag}`);
    },
  },
];
