import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { posix, walk } from "../util.mjs";

// Owned by other mechanisms: settings merge, the version record and per-user overlays.
export const EXCLUDED = (repoPath) =>
  repoPath === ".claude/settings.json" ||
  repoPath === ".claude/ang/version.json" ||
  /\.local\./.test(path.posix.basename(repoPath));

// A FileMap is Map<repo-relative posix path, Buffer>; an absent file is simply not in the map.
export function readTree(dir) {
  return new Map(
    walk(dir, true).map((file) => [
      posix(path.relative(dir, file)),
      fs.readFileSync(file),
    ]),
  );
}

// Renames through every guide's Moves, oldest first. An existing file at the new path wins, so the old one stays put.
export function applyMoves(files, guides) {
  const movedFiles = new Map(files);
  const movedFrom = new Map();

  for (const { from, to } of guides.flatMap((guide) => guide.moves)) {
    if (!movedFiles.has(from) || movedFiles.has(to)) {
      continue;
    }

    movedFiles.set(to, movedFiles.get(from));
    movedFiles.delete(from);

    // A file moved more than once still records the path it started at.
    movedFrom.set(to, movedFrom.get(from) ?? from);
    movedFrom.delete(from);
  }

  return { files: movedFiles, movedFrom };
}

export function mergeFile(ours, base, theirs, filePath) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ang-merge-"));
  const writeInput = (name, bytes) => {
    const file = path.join(tempDir, name);

    fs.writeFileSync(file, bytes);

    return file;
  };

  try {
    const localFile = writeInput("local", ours);
    const baseFile = writeInput("base", base);
    const upstreamFile = writeInput("upstream", theirs);
    const labels = ["-L", "local", "-L", "base", "-L", "upstream"];
    const result = spawnSync("git", [
      "merge-file",
      "-p",
      ...labels,
      localFile,
      baseFile,
      upstreamFile,
    ]);

    // The exit status is the conflict count, capped at 127; anything else (or no status) is git failing, not a count.
    const gitFailed =
      result.error || result.status === null || result.status > 127;

    if (gitFailed) {
      const reason =
        result.error?.message ??
        (result.stderr.toString().trim() || `exit ${result.status}`);

      throw new Error(`git merge-file failed on ${filePath}: ${reason}`);
    }

    return { merged: result.stdout, hunks: result.status };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

const sameBytes = (a, b) => (a === null || b === null ? a === b : a.equals(b));

// The upgrade merge spike's decision table. `merged` holds the bytes a write would put at the path, or null.
export function classifyFile(base, ours, theirs, filePath) {
  const result = (category, merged = null, hunks = 0) => ({
    category,
    hunks,
    merged,
  });

  if (sameBytes(ours, theirs)) {
    return result("unchanged");
  }

  if (sameBytes(ours, base)) {
    if (theirs === null) {
      return result("fast-path-delete");
    }

    return result(base === null ? "upstream-new" : "fast-path", theirs);
  }

  if (sameBytes(theirs, base)) {
    return result(base === null ? "local-only" : "keep-local");
  }

  if (ours === null || theirs === null) {
    return result("conflict-delete", theirs);
  }

  const { merged, hunks } = mergeFile(
    ours,
    base ?? Buffer.alloc(0),
    theirs,
    filePath,
  );

  if (hunks === 0) {
    return result("clean-merge", merged);
  }

  return result(base === null ? "conflict-no-base" : "conflict", merged, hunks);
}

// Every path Ang ships at base or target, sorted. `movedFrom` comes from applyMoves on the instance: a moved file that
// would otherwise be left alone still has to land at its new path, so it carries the local bytes to write there.
export function classifyTrees(
  baseFiles,
  oursFiles,
  theirsFiles,
  movedFrom = new Map(),
) {
  const shippedPaths = new Set([...baseFiles.keys(), ...theirsFiles.keys()]);
  const paths = [...shippedPaths].filter((p) => !EXCLUDED(p)).sort();

  return paths.map((filePath) => {
    const base = baseFiles.get(filePath) ?? null;
    const ours = oursFiles.get(filePath) ?? null;
    const theirs = theirsFiles.get(filePath) ?? null;
    const entry = {
      path: filePath,
      ...classifyFile(base, ours, theirs, filePath),
    };

    if (!movedFrom.has(filePath)) {
      return entry;
    }

    entry.movedFrom = movedFrom.get(filePath);

    const keepsLocalBytes = ["unchanged", "keep-local"].includes(
      entry.category,
    );

    if (keepsLocalBytes) {
      entry.merged = ours;
    }

    return entry;
  });
}
