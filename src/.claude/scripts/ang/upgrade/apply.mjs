import fs from "node:fs";
import path from "node:path";
import { EXCLUDED } from "./classify.mjs";
import { CONFLICTED } from "./size.mjs";

const WRITTEN_CATEGORIES = ["fast-path", "upstream-new", "clean-merge"];
const LEFT_ALONE_CATEGORIES = ["unchanged", "keep-local", "local-only"];
const KNOWN_CATEGORIES = [
  ...WRITTEN_CATEGORIES,
  ...LEFT_ALONE_CATEGORIES,
  "fast-path-delete",
  ...CONFLICTED,
];
const RESOLUTIONS = ["write", "delete", "keep"];
// Only these hold git merge-file output; the rest are upstream's bytes, which may legitimately quote a marker.
const MERGE_OUTPUT_CATEGORIES = ["clean-merge", "conflict", "conflict-no-base"];
const CONFLICT_MARKER = /^(?:<{7}|>{7}) /m;

// A moved file that would otherwise be left alone still has to land at its new path.
function actionFor(entry) {
  if (CONFLICTED.includes(entry.category)) {
    return entry.resolution;
  }

  if (WRITTEN_CATEGORIES.includes(entry.category)) {
    return "write";
  }

  if (entry.category === "fast-path-delete") {
    return "delete";
  }

  return entry.movedFrom ? "write" : "keep";
}

function pathProblem(filePath) {
  if (typeof filePath !== "string" || !filePath) {
    return "has no path";
  }

  if (path.isAbsolute(filePath) || path.posix.isAbsolute(filePath)) {
    return "is absolute";
  }

  if (filePath.split(/[\\/]/).includes("..")) {
    return "leaves the project";
  }

  if (EXCLUDED(filePath)) {
    return "is excluded from upgrades";
  }

  return null;
}

function mergedFileProblem(entry) {
  if (!entry.mergedFile || !fs.existsSync(entry.mergedFile)) {
    return "mergedFile is missing";
  }

  const holdsMergeOutput = MERGE_OUTPUT_CATEGORIES.includes(entry.category);

  if (
    holdsMergeOutput &&
    CONFLICT_MARKER.test(fs.readFileSync(entry.mergedFile, "utf8"))
  ) {
    return "mergedFile still has conflict markers";
  }

  return null;
}

// Gathers every problem before anything is written, so an apply is all or nothing (d26).
export function checkPlan(entries) {
  const problems = [];

  for (const entry of entries) {
    const at = entry.path ?? "(no path)";
    const pathsToCheck =
      entry.movedFrom === undefined
        ? [entry.path]
        : [entry.path, entry.movedFrom];

    for (const filePath of pathsToCheck) {
      const problem = pathProblem(filePath);

      if (problem) {
        problems.push(`${at}: ${filePath ?? "path"} ${problem}`);
      }
    }

    const isKnownCategory = KNOWN_CATEGORIES.includes(entry.category);
    const isUnresolvedConflict =
      CONFLICTED.includes(entry.category) &&
      !RESOLUTIONS.includes(entry.resolution);

    if (!isKnownCategory) {
      problems.push(`${at}: unknown category "${entry.category}"`);
    } else if (isUnresolvedConflict) {
      problems.push(
        `${at}: ${entry.category} needs a resolution of ${RESOLUTIONS.join(", ")}`,
      );
    }

    if (!isKnownCategory || actionFor(entry) !== "write") {
      continue;
    }

    const mergedProblem = mergedFileProblem(entry);

    if (mergedProblem) {
      problems.push(`${at}: ${mergedProblem}`);
    }
  }

  return problems;
}

// Runs only on a plan checkPlan passes. fs alone, so the git index is never touched.
export function applyPlan(entries, projectRoot) {
  const result = { written: [], deleted: [], kept: [] };

  for (const entry of entries) {
    const target = path.join(projectRoot, entry.path);
    const action = actionFor(entry);
    const isKept = action !== "write" && action !== "delete";

    if (isKept) {
      // Kept local bytes still have to follow a move, or they're stranded outside every later upgrade.
      if (entry.movedFrom) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.renameSync(path.join(projectRoot, entry.movedFrom), target);
      }

      if (entry.category !== "unchanged") {
        result.kept.push(entry.path);
      }

      continue;
    }

    if (action === "write") {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(entry.mergedFile, target);
      result.written.push(entry.path);
    } else {
      fs.rmSync(target, { force: true });
      result.deleted.push(entry.path);
    }

    if (entry.movedFrom) {
      fs.rmSync(path.join(projectRoot, entry.movedFrom), { force: true });
    }
  }

  return result;
}
