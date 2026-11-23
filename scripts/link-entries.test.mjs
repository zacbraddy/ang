import { after, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { applyLinks, planLinks } from "./link-entries.mjs";

const tempDirs = [];

after(() =>
  tempDirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);

// A fake repo: src/.claude/skills/<name>/SKILL.md and src/.claude/agents/<name>.md, plus empty root .claude/{skills,agents}.
function fakeRepo({ skills = [], agents = [] } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ang-links-"));

  tempDirs.push(root);

  const src = path.join(root, "src");

  for (const kind of ["skills", "agents"]) {
    fs.mkdirSync(path.join(src, ".claude", kind), { recursive: true });
    fs.mkdirSync(path.join(root, ".claude", kind), { recursive: true });
  }

  for (const name of skills) {
    const skillDir = path.join(src, ".claude", "skills", name);

    fs.mkdirSync(skillDir);
    fs.writeFileSync(path.join(skillDir, "SKILL.md"), name);
  }

  for (const name of agents) {
    fs.writeFileSync(path.join(src, ".claude", "agents", name), name);
  }

  const rootEntry = (...parts) => path.join(root, ".claude", ...parts);

  return { root, src, rootEntry };
}

const createdPaths = (plan) => plan.create.map((link) => link.path);

test("a src entry with no root link is planned for creation", () => {
  const { root, src, rootEntry } = fakeRepo({ skills: ["kill"] });

  assert.deepEqual(createdPaths(planLinks(src, root)), [
    rootEntry("skills", "kill"),
  ]);
});

test("dotfiles in src are not entries", () => {
  const { root, src } = fakeRepo({ skills: ["kill"] });

  fs.writeFileSync(path.join(src, ".claude", "skills", ".DS_Store"), "");

  assert.equal(planLinks(src, root).create.length, 1);
});

test("a root link whose src entry is gone is planned for removal", () => {
  const { root, src, rootEntry } = fakeRepo();

  fs.symlinkSync("../../src/.claude/skills/gone", rootEntry("skills", "gone"));

  const plan = planLinks(src, root);

  assert.deepEqual(plan.remove, [rootEntry("skills", "gone")]);
  assert.deepEqual(plan.create, []);
});

test("a root link pointing away from its src twin is planned for removal and recreation", () => {
  const { root, src, rootEntry } = fakeRepo({ skills: ["kill"] });

  fs.symlinkSync("../../elsewhere/kill", rootEntry("skills", "kill"));

  const plan = planLinks(src, root);

  assert.deepEqual(plan.remove, [rootEntry("skills", "kill")]);
  assert.deepEqual(createdPaths(plan), [rootEntry("skills", "kill")]);
});

test("a real file or folder at the root is repo-only and left alone", () => {
  const { root, src, rootEntry } = fakeRepo();

  fs.mkdirSync(rootEntry("skills", "cut-release"));
  fs.writeFileSync(rootEntry("agents", "release-scout.md"), "scout");

  assert.deepEqual(planLinks(src, root), {
    create: [],
    remove: [],
    conflicts: [],
  });
});

test("a repo-only entry sharing a src entry name is a conflict and nothing is created over it", () => {
  const { root, src, rootEntry } = fakeRepo({ skills: ["kill"] });

  fs.mkdirSync(rootEntry("skills", "kill"));

  assert.deepEqual(planLinks(src, root), {
    create: [],
    remove: [],
    conflicts: [rootEntry("skills", "kill")],
  });
});

test("applying links gives folder and file entries relative links that resolve", () => {
  const { root, src, rootEntry } = fakeRepo({
    skills: ["kill"],
    agents: ["context-scout.md"],
  });

  applyLinks(planLinks(src, root));

  assert.equal(
    fs.readlinkSync(rootEntry("skills", "kill")),
    "../../src/.claude/skills/kill",
  );
  assert.equal(
    fs.readlinkSync(rootEntry("agents", "context-scout.md")),
    "../../src/.claude/agents/context-scout.md",
  );
  assert.equal(
    fs.readFileSync(rootEntry("skills", "kill", "SKILL.md"), "utf8"),
    "kill",
  );
  assert.equal(
    fs.readFileSync(rootEntry("agents", "context-scout.md"), "utf8"),
    "context-scout.md",
  );
});

test("applying replaces a misdirected link and removes a dangling one", () => {
  const { root, src, rootEntry } = fakeRepo({ skills: ["kill"] });

  fs.symlinkSync("../../elsewhere/kill", rootEntry("skills", "kill"));
  fs.symlinkSync("../../src/.claude/skills/gone", rootEntry("skills", "gone"));

  applyLinks(planLinks(src, root));

  assert.deepEqual(fs.readdirSync(rootEntry("skills")), ["kill"]);
  assert.equal(
    fs.readlinkSync(rootEntry("skills", "kill")),
    "../../src/.claude/skills/kill",
  );
});

test("a repo already in sync plans nothing and applying leaves the disk unchanged", () => {
  const { root, src, rootEntry } = fakeRepo({
    skills: ["kill"],
    agents: ["stage-gate.md"],
  });

  applyLinks(planLinks(src, root));

  const linkModifiedAt = () =>
    fs.lstatSync(rootEntry("skills", "kill")).mtimeMs;
  const before = linkModifiedAt();
  const plan = planLinks(src, root);

  assert.deepEqual(plan, { create: [], remove: [], conflicts: [] });

  applyLinks(plan);

  assert.equal(linkModifiedAt(), before);
});

test("the real repo has no link drift", () => {
  const root = path.resolve(import.meta.dirname, "..");

  assert.deepEqual(planLinks(path.join(root, "src"), root), {
    create: [],
    remove: [],
    conflicts: [],
  });
});
