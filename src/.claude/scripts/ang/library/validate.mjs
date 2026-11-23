import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  CTX,
  DEPARTMENTS,
  EPIC_TYPES,
  ITEM_STATUSES,
  LOCAL_FILE,
  PROJECT,
  STORY_OWNERS,
  STORY_STATUSES,
  TAG_LIMIT,
} from "../paths.mjs";
import { isUrl, read, rel, walk } from "../util.mjs";
import { loadConfig } from "../config/config.mjs";
import { FEATURES, onFeatures } from "../features.mjs";
import { citesRaw, RAW_SOURCE_HINT, resolveRef } from "../items/state.mjs";
import {
  evalTrigger,
  loadTriggers,
  printReadyTriggers,
  triggerErrors,
} from "../triggers/triggers.mjs";
import { parseFrontmatter } from "./frontmatter.mjs";
import { buildIndex } from "./index.mjs";
import { loadTags, taggedDocs } from "./tags.mjs";

function checkTags(tags, report) {
  const seen = new Set();

  for (const { tag, shortDescription, department } of tags) {
    if (seen.has(tag)) {
      report.errors.push(`tags.json: duplicate tag "${tag}"`);
    }

    seen.add(tag);

    if (!shortDescription) {
      report.errors.push(`tags.json: "${tag}" has no shortDescription`);
    }

    if (!department?.length) {
      report.errors.push(`tags.json: "${tag}" has no department`);
    }

    const unknownDepartments = (department ?? []).filter(
      (name) => !DEPARTMENTS.includes(name),
    );

    if (unknownDepartments.length) {
      report.errors.push(
        `tags.json: "${tag}" has unknown department(s) ${unknownDepartments.join(", ")}`,
      );
    }
  }

  if (tags.length > TAG_LIMIT) {
    report.warnings.push(
      `${tags.length} tags (> ${TAG_LIMIT}) — time for /curate-tags`,
    );
  }

  return seen;
}

function checkStory(where, frontmatter, errors) {
  const { status, owner, blockedReason } = frontmatter;

  if (!STORY_STATUSES.includes(status)) {
    errors.push(`${where}: status must be one of ${STORY_STATUSES.join("|")}`);
  }

  if (!STORY_OWNERS.includes(owner)) {
    errors.push(`${where}: owner must be one of ${STORY_OWNERS.join("|")}`);
  }

  if (status === "blocked" && !blockedReason) {
    errors.push(
      `${where}: blocked stories need blockedReason (and ideally revisit)`,
    );
  }
}

function checkDocs(knownTags, report) {
  const { errors, warnings } = report;

  for (const file of taggedDocs()) {
    const text = read(file);
    const frontmatter = parseFrontmatter(text);
    const where = rel(file);

    if (!frontmatter) {
      errors.push(`${where}: missing frontmatter`);
      continue;
    }

    const { title, shortDescription, tags } = frontmatter;

    if (typeof title !== "string" || !title) {
      errors.push(`${where}: missing title`);
    }

    if (typeof shortDescription !== "string" || !shortDescription) {
      errors.push(`${where}: missing shortDescription`);
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      errors.push(`${where}: needs at least one tag`);
    } else {
      const unregistered = tags.filter((tag) => !knownTags.has(tag));

      unregistered.forEach((tag) =>
        errors.push(`${where}: unregistered tag "${tag}" (use: tag add)`),
      );
    }

    const hasSummary = /^##\s+Summary/m.test(text);
    const isStory = /\/stories\/[^/]+\.md$/.test(where);

    if (!hasSummary) {
      warnings.push(`${where}: no "## Summary" section`);
    }

    if (isStory) {
      checkStory(where, frontmatter, errors);
    }
  }
}

function checkLinks(errors) {
  for (const file of walk(CTX)) {
    const textOutsideCodeFences = read(file).replace(/```[\s\S]*?```/g, "");
    const links = textOutsideCodeFences.matchAll(/\]\(([^)\s]+)\)/g);

    for (const [, target] of links) {
      if (isUrl(target) || target.startsWith("#")) {
        continue;
      }

      const linkPath = decodeURI(target.split("#")[0]);
      const resolved = linkPath.startsWith("/")
        ? path.join(PROJECT, linkPath)
        : path.resolve(path.dirname(file), linkPath);

      if (!fs.existsSync(resolved)) {
        errors.push(`${rel(file)}: broken link → ${target}`);
      }
    }
  }
}

function checkStateFile(file, errors) {
  const item = path.dirname(file);
  const where = rel(file);
  let state;

  try {
    state = JSON.parse(read(file));
  } catch {
    errors.push(`${where}: invalid JSON`);

    return;
  }

  if (!ITEM_STATUSES.includes(state.status)) {
    errors.push(`${where}: status must be one of ${ITEM_STATUSES.join("|")}`);
  }

  if (state.type && !EPIC_TYPES.includes(state.type)) {
    errors.push(`${where}: type must be one of ${EPIC_TYPES.join("|")}`);
  }

  for (const key of ["unknowns", "knowns", "decisions", "lineage"]) {
    if (!Array.isArray(state[key])) {
      errors.push(`${where}: ${key} must be an array`);
    }
  }

  const sources = (state.knowns ?? []).map((known) => known.source);
  const evidence = (state.decisions ?? []).map((decision) => decision.evidence);

  for (const ref of [...sources, ...evidence]) {
    if (!ref || isUrl(ref)) {
      continue;
    }

    if (citesRaw(item, ref)) {
      errors.push(`${where}: source under raw/ → ${ref} (${RAW_SOURCE_HINT})`);
    } else if (!fs.existsSync(resolveRef(item, ref))) {
      errors.push(`${where}: missing source → ${ref}`);
    }
  }

  if (!fs.existsSync(path.join(item, "README.md"))) {
    errors.push(`${rel(item)}: item has state.json but no README.md hub`);
  }
}

// Status 1 is git's "not ignored"; no git, no repo or any other failure says nothing.
function localFileIgnoreWarning() {
  if (!fs.existsSync(LOCAL_FILE)) {
    return [];
  }

  const { status } = spawnSync("git", ["check-ignore", "-q", LOCAL_FILE], {
    cwd: PROJECT,
  });

  if (status !== 1) {
    return [];
  }

  return [
    `${rel(LOCAL_FILE)} is not gitignored; it holds personal settings, add it to .gitignore`,
  ];
}

// Prints warnings, errors and ready triggers. Returns true when valid.
export function validateLibrary() {
  const { config, errors, warnings } = loadConfig();
  const report = {
    errors,
    warnings: [...warnings, ...localFileIgnoreWarning()],
  };

  for (const feature of FEATURES) {
    errors.push(...feature.validate(!!config[feature.key]));
  }

  for (const feature of onFeatures(config)) {
    if (feature.warnings) {
      report.warnings.push(...feature.warnings());
    }
  }

  const knownTags = checkTags(loadTags(), report);

  checkDocs(knownTags, report);
  checkLinks(errors);

  const stateFiles = walk(CTX, true).filter(
    (file) => path.basename(file) === "state.json",
  );

  stateFiles.forEach((file) => checkStateFile(file, errors));

  const badTriggers = triggerErrors();

  errors.push(...badTriggers);

  const staleIndexCount = buildIndex();

  if (staleIndexCount) {
    report.warnings.push(
      `regenerated ${staleIndexCount} stale index.json file(s)`,
    );
  }

  report.warnings.forEach((warning) => console.log(`⚠ ${warning}`));
  errors.forEach((error) => console.log(`✖ ${error}`));

  if (!badTriggers.length) {
    printReadyTriggers(loadTriggers().map(evalTrigger));
  }

  return errors.length === 0;
}
