import fs from 'node:fs';
import path from 'node:path';
import { CTX, DEPARTMENTS, EPIC_TYPES, ITEM_STATUSES, PROJECT, STORY_OWNERS, STORY_STATUSES, TAG_LIMIT } from '../paths.mjs';
import { isUrl, read, rel, walk } from '../util.mjs';
import { loadConfig } from '../config/config.mjs';
import { FEATURES, onFeatures } from '../features.mjs';
import { citesRaw, RAW_SOURCE_HINT, resolveRef } from '../items/state.mjs';
import { evalTrigger, loadTriggers, printReadyTriggers, triggerErrors } from '../triggers/triggers.mjs';
import { parseFrontmatter } from './frontmatter.mjs';
import { buildIndex } from './index.mjs';
import { loadTags, taggedDocs } from './tags.mjs';

function checkTags(tags, report) {
  const seen = new Set();
  for (const t of tags) {
    if (seen.has(t.tag)) report.errors.push(`tags.json: duplicate tag "${t.tag}"`);
    seen.add(t.tag);
    if (!t.shortDescription) report.errors.push(`tags.json: "${t.tag}" has no shortDescription`);
    if (!t.department?.length) report.errors.push(`tags.json: "${t.tag}" has no department`);
    const unknownDepts = (t.department ?? []).filter((d) => !DEPARTMENTS.includes(d));
    if (unknownDepts.length) report.errors.push(`tags.json: "${t.tag}" has unknown department(s) ${unknownDepts.join(', ')}`);
  }
  if (tags.length > TAG_LIMIT) report.warnings.push(`${tags.length} tags (> ${TAG_LIMIT}) — time for /curate-tags`);
  return seen;
}

function checkStory(where, fm, errors) {
  if (!STORY_STATUSES.includes(fm.status)) errors.push(`${where}: status must be one of ${STORY_STATUSES.join('|')}`);
  if (!STORY_OWNERS.includes(fm.owner)) errors.push(`${where}: owner must be one of ${STORY_OWNERS.join('|')}`);
  if (fm.status === 'blocked' && !fm.blockedReason) errors.push(`${where}: blocked stories need blockedReason (and ideally revisit)`);
}

function checkDocs(knownTags, report) {
  const { errors, warnings } = report;
  for (const file of taggedDocs()) {
    const text = read(file);
    const fm = parseFrontmatter(text);
    const where = rel(file);
    if (!fm) {
      errors.push(`${where}: missing frontmatter`);
      continue;
    }
    if (typeof fm.title !== 'string' || !fm.title) errors.push(`${where}: missing title`);
    if (typeof fm.shortDescription !== 'string' || !fm.shortDescription) errors.push(`${where}: missing shortDescription`);
    if (!Array.isArray(fm.tags) || fm.tags.length === 0) {
      errors.push(`${where}: needs at least one tag`);
    } else {
      const unregistered = fm.tags.filter((t) => !knownTags.has(t));
      unregistered.forEach((t) => errors.push(`${where}: unregistered tag "${t}" (use: tag add)`));
    }
    if (!/^##\s+Summary/m.test(text)) warnings.push(`${where}: no "## Summary" section`);
    if (/\/stories\/[^/]+\.md$/.test(where)) checkStory(where, fm, errors);
  }
}

function checkLinks(errors) {
  for (const file of walk(CTX)) {
    const body = read(file).replace(/```[\s\S]*?```/g, '');
    for (const [, target] of body.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (isUrl(target) || target.startsWith('#')) continue;
      const clean = decodeURI(target.split('#')[0]);
      const abs = clean.startsWith('/') ? path.join(PROJECT, clean) : path.resolve(path.dirname(file), clean);
      if (!fs.existsSync(abs)) errors.push(`${rel(file)}: broken link → ${target}`);
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
  if (!ITEM_STATUSES.includes(state.status)) errors.push(`${where}: status must be one of ${ITEM_STATUSES.join('|')}`);
  if (state.type && !EPIC_TYPES.includes(state.type)) errors.push(`${where}: type must be one of ${EPIC_TYPES.join('|')}`);
  for (const key of ['unknowns', 'knowns', 'decisions', 'lineage']) {
    if (!Array.isArray(state[key])) errors.push(`${where}: ${key} must be an array`);
  }
  const sources = (state.knowns ?? []).map((k) => k.source);
  const evidence = (state.decisions ?? []).map((d) => d.evidence);
  for (const ref of [...sources, ...evidence]) {
    if (!ref || isUrl(ref)) continue;
    if (citesRaw(item, ref)) errors.push(`${where}: source under raw/ → ${ref} (${RAW_SOURCE_HINT})`);
    else if (!fs.existsSync(resolveRef(item, ref))) errors.push(`${where}: missing source → ${ref}`);
  }
  if (!fs.existsSync(path.join(item, 'README.md'))) errors.push(`${rel(item)}: item has state.json but no README.md hub`);
}

// Prints warnings, errors and ready triggers. Returns true when valid.
export function validateLibrary() {
  const { config, errors } = loadConfig();
  const report = { errors, warnings: [] };
  FEATURES.forEach((f) => errors.push(...f.validate(!!config[f.key])));
  const onWithWarnings = onFeatures(config).filter((f) => f.warnings);
  onWithWarnings.forEach((f) => report.warnings.push(...f.warnings()));
  const knownTags = checkTags(loadTags(), report);
  checkDocs(knownTags, report);
  checkLinks(errors);
  const stateFiles = walk(CTX, true).filter((f) => path.basename(f) === 'state.json');
  stateFiles.forEach((f) => checkStateFile(f, errors));
  const badTriggers = triggerErrors();
  errors.push(...badTriggers);

  const stale = buildIndex();
  if (stale) report.warnings.push(`regenerated ${stale} stale index.json file(s)`);
  report.warnings.forEach((w) => console.log(`⚠ ${w}`));
  errors.forEach((e) => console.log(`✖ ${e}`));
  if (!badTriggers.length) printReadyTriggers(loadTriggers().map(evalTrigger));
  return errors.length === 0;
}
