// Keeps the root .claude/skills and .claude/agents in step with src/.claude: one relative link per shipped entry.
// Anything at the root that isn't a link is repo-only tooling and never touched.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const KINDS = ["skills", "agents"];

function listEntries(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((name) => !name.startsWith("."))
    .sort();
}

function planKind(plan, shippedDir, rootDir) {
  const shipped = new Set(listEntries(shippedDir));
  const present = listEntries(rootDir);

  for (const name of present) {
    const link = path.join(rootDir, name);
    const isSymlink = fs.lstatSync(link).isSymbolicLink();

    if (!isSymlink) {
      if (shipped.has(name)) {
        plan.conflicts.push(link);
      }

      continue;
    }

    const linkTarget = path.resolve(rootDir, fs.readlinkSync(link));
    const pointsAtTwin = linkTarget === path.join(shippedDir, name);

    if (!shipped.has(name) || !pointsAtTwin) {
      plan.remove.push(link);
    }
  }

  for (const name of shipped) {
    const link = path.join(rootDir, name);
    const isAlreadyLinked =
      present.includes(name) && !plan.remove.includes(link);

    if (isAlreadyLinked) {
      continue;
    }

    plan.create.push({
      path: link,
      target: path.relative(rootDir, path.join(shippedDir, name)),
    });
  }
}

export function planLinks(srcDir, rootDir) {
  const plan = { create: [], remove: [], conflicts: [] };

  for (const kind of KINDS) {
    planKind(
      plan,
      path.join(srcDir, ".claude", kind),
      path.join(rootDir, ".claude", kind),
    );
  }

  return plan;
}

export function applyLinks({ create, remove }) {
  for (const link of remove) {
    fs.unlinkSync(link);
  }

  for (const { path: link, target } of create) {
    fs.mkdirSync(path.dirname(link), { recursive: true });
    fs.symlinkSync(target, link);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const plan = planLinks(path.join(repoRoot, "src"), repoRoot);
  const relativeToRoot = (file) => path.relative(repoRoot, file);

  applyLinks(plan);

  for (const link of plan.remove) {
    console.log(`removed ${relativeToRoot(link)}`);
  }

  for (const { path: link, target } of plan.create) {
    console.log(`linked ${relativeToRoot(link)} → ${target}`);
  }

  for (const link of plan.conflicts) {
    console.error(
      `conflict: ${relativeToRoot(link)} is repo-only but shares a name with a src/ entry`,
    );
  }

  const isInSync =
    !plan.create.length && !plan.remove.length && !plan.conflicts.length;

  if (isInSync) {
    console.log("links in sync, nothing changed");
  }

  if (plan.conflicts.length) {
    process.exit(1);
  }
}
