import fs from "node:fs";
import path from "node:path";
import {
  CTX,
  DEPARTMENTS,
  FLOW,
  PROJECT,
  STAGES,
  TAGS_FILE,
} from "../paths.mjs";
import { read, rel, walk } from "../util.mjs";
import { parseFrontmatter } from "./frontmatter.mjs";
import { saveTags } from "./tags.mjs";

function indexEntry(file) {
  const { title, shortDescription, tags } = parseFrontmatter(read(file)) ?? {};

  return {
    title: typeof title === "string" ? title : path.basename(file, ".md"),
    path: rel(file),
    shortDescription:
      typeof shortDescription === "string" ? shortDescription : "",
    tags: Array.isArray(tags) ? tags : [],
  };
}

// Returns how many index.json files changed.
export function buildIndex() {
  let changed = 0;

  for (const stage of STAGES) {
    const dir = path.join(CTX, stage);

    if (!fs.existsSync(dir)) {
      continue;
    }

    const entries = walk(dir)
      .map(indexEntry)
      .sort((a, b) => a.path.localeCompare(b.path));
    const json = JSON.stringify(entries, null, 2) + "\n";
    const indexFile = path.join(dir, "index.json");
    const isUnchanged = fs.existsSync(indexFile) && read(indexFile) === json;

    if (isUnchanged) {
      continue;
    }

    fs.writeFileSync(indexFile, json);
    changed++;
  }

  return changed;
}

function ensureDirWithGitkeep(dir) {
  fs.mkdirSync(dir, { recursive: true });

  if (fs.readdirSync(dir).length === 0) {
    fs.writeFileSync(path.join(dir, ".gitkeep"), "");
  }
}

export function initLibrary() {
  const departmentDirs = DEPARTMENTS.filter(
    (department) => department !== "technical",
  ).map((department) => `10k/${department}`);
  const dirs = [
    ...FLOW,
    "10k/technical/architecture",
    "10k/technical/adrs",
    ...departmentDirs,
  ];

  for (const dir of dirs) {
    ensureDirWithGitkeep(path.join(CTX, dir));
  }

  ensureDirWithGitkeep(path.join(PROJECT, "workflow-improvements"));

  if (!fs.existsSync(TAGS_FILE)) {
    saveTags([]);
  }

  buildIndex();
}
