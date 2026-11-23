import { test } from "node:test";
import assert from "node:assert/strict";
import { chooseRoute } from "./size.mjs";

const WITH_VERSION_RECORD = true;
const NO_VERSION_RECORD = false;
const ONE_SIDED_CATEGORIES = [
  "unchanged",
  "fast-path",
  "fast-path-delete",
  "upstream-new",
  "keep-local",
  "local-only",
];
const entry = (category, hunks = 0) => ({
  path: `${category}-${Math.random()}`,
  category,
  hunks,
});
const CONFLICTED_KINDS = [
  ["conflict", 2],
  ["conflict-no-base", 2],
  ["conflict-delete", 0],
];
const conflictedEntries = (count) =>
  Array.from({ length: count }, (_, i) =>
    entry(...CONFLICTED_KINDS[i % CONFLICTED_KINDS.length]),
  );

test("only one-sided changes route fast", () => {
  const entries = ONE_SIDED_CATEGORIES.map((category) => entry(category));

  const route = chooseRoute(entries, WITH_VERSION_RECORD);

  assert.equal(route.route, "fast");
  assert.deepEqual(
    [route.conflictedFiles, route.conflictHunks, route.cleanMerges],
    [0, 0, 0],
  );
  assert.ok(route.reason);
});

test("a clean merge alone routes agent-resolved", () => {
  const entries = [entry("unchanged"), entry("clean-merge")];

  const route = chooseRoute(entries, WITH_VERSION_RECORD);

  assert.equal(route.route, "agent-resolved");
  assert.equal(route.cleanMerges, 1);
});

test("conflicted file counts route at each boundary", () => {
  const cases = [
    [1, "agent-resolved"],
    [5, "agent-resolved"],
    [6, "guided"],
    [11, "guided"],
    [12, "guided-with-warning"],
  ];

  for (const [count, expected] of cases) {
    const { route } = chooseRoute(
      conflictedEntries(count),
      WITH_VERSION_RECORD,
    );

    assert.equal(route, expected, `${count} conflicted files`);
  }
});

test("no version record always routes guided with warning", () => {
  const withEntries = chooseRoute([entry("unchanged")], NO_VERSION_RECORD);
  const empty = chooseRoute([], NO_VERSION_RECORD);

  assert.equal(withEntries.route, "guided-with-warning");
  assert.equal(empty.route, "guided-with-warning");
  assert.match(empty.reason, /version record/);
});

test("conflict hunks sum max(hunks, 1) over conflicted files", () => {
  const entries = [
    entry("conflict", 3),
    entry("conflict-delete", 0),
    entry("conflict-no-base", 1),
    entry("clean-merge"),
  ];

  const route = chooseRoute(entries, WITH_VERSION_RECORD);

  assert.deepEqual(
    [route.conflictedFiles, route.conflictHunks, route.cleanMerges],
    [3, 5, 1],
  );
});
