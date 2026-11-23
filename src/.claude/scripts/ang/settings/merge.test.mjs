import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeArray, mergeSettings } from "./merge.mjs";

// The settings-merge spike's scenarios. BASE is the shipped settings.json as it stood at 6cf9987 (it still has Bash(jq:*)).
const hookCommand = (subcommand) =>
  `node "$CLAUDE_PROJECT_DIR/.claude/scripts/ang-context-manager.mjs" ${subcommand}`;
const hookGroup = (subcommand, matcher) => ({
  ...(matcher && { matcher }),
  hooks: [{ type: "command", command: hookCommand(subcommand) }],
});
const BASE = {
  outputStyle: "Partner In Crime",
  permissions: {
    allow: [
      "Bash(node .claude/scripts/ang-context-manager.mjs:*)",
      "Bash(jq:*)",
    ],
  },
  hooks: {
    SessionStart: [hookGroup("session banner")],
    SubagentStart: [hookGroup("session subagent")],
    PostToolUse: [hookGroup("library index --quiet", "Write|Edit|MultiEdit")],
    Stop: [hookGroup("library index --quiet")],
  },
};
const clone = (value) => structuredClone(value);
const json = (value) => JSON.stringify(value);
const countOccurrences = (value, needle) =>
  json(value).split(needle).length - 1;

// Ang's next release: a changed hook command, one permission dropped and one added, a new hook event and a renamed outputStyle.
const TARGET = clone(BASE);

TARGET.outputStyle = "Partners In Crime";
TARGET.hooks.SessionStart = [hookGroup("session banner --compact")];
TARGET.permissions.allow = [
  "Bash(node .claude/scripts/ang-context-manager.mjs:*)",
  "Bash(gh release view:*)",
];
TARGET.hooks.UserPromptSubmit = [hookGroup("session prompt")];

// The d7 install merge the spike reproduced: user wins, missing keys added, arrays unioned.
const isPlainObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

function installMerge(user, ang) {
  if (Array.isArray(user) && Array.isArray(ang)) {
    const isInUser = (entry) => user.some((own) => json(own) === json(entry));

    return [...user, ...ang.filter((entry) => !isInUser(entry))];
  }

  if (isPlainObject(user) && isPlainObject(ang)) {
    const merged = { ...user };

    for (const key of Object.keys(ang)) {
      merged[key] = key in user ? installMerge(user[key], ang[key]) : ang[key];
    }

    return merged;
  }

  return user;
}

const PRE_ANG = {
  outputStyle: "Explanatory",
  model: "opus",
  permissions: { allow: ["Bash(npm test:*)"], deny: ["Read(.env)"] },
  hooks: { Stop: [{ hooks: [{ type: "command", command: "say done" }] }] },
};
const CUSTOMISED = installMerge(PRE_ANG, BASE);
// Customised, plus two Ang hooks edited after install: the banner (which upstream also changes) and the PostToolUse matcher (which it doesn't).
const EDITED = clone(CUSTOMISED);

EDITED.hooks.SessionStart = [hookGroup("session banner --no-mail")];
EDITED.hooks.PostToolUse = [
  hookGroup("library index --quiet", "Write|Edit|MultiEdit|NotebookEdit"),
];

function assertUpgraded(merged) {
  assert.ok(!json(merged).includes("Bash(jq:*)"), "dropped permission removed");
  assert.equal(
    countOccurrences(merged, "Bash(gh release view:*)"),
    1,
    "new permission added once",
  );
  assert.equal(
    countOccurrences(merged, "session prompt"),
    1,
    "new hook event added once",
  );
  assert.equal(
    countOccurrences(merged, "library index --quiet"),
    2,
    "unchanged Stop and PostToolUse hooks still there once",
  );

  for (const groups of Object.values(merged.hooks)) {
    assert.equal(
      new Set(groups.map(json)).size,
      groups.length,
      "no hook group twice",
    );
  }
}

function assertUserSurvives(merged) {
  assert.equal(merged.outputStyle, "Explanatory");
  assert.equal(merged.model, "opus");
  assert.deepEqual(merged.permissions.deny, ["Read(.env)"]);
  assert.ok(merged.permissions.allow.includes("Bash(npm test:*)"));
  assert.ok(json(merged).includes("say done"));
}

test("vanilla: a file equal to base becomes the target exactly, with no conflicts", () => {
  const { merged, conflicts } = mergeSettings(BASE, clone(BASE), TARGET);

  assert.equal(json(merged), json(TARGET));
  assert.deepEqual(conflicts, []);
});

test("customised: the user keeps their values, Ang adds three and removes two, and the outputStyle conflict is dropped", () => {
  const { merged, conflicts } = mergeSettings(BASE, CUSTOMISED, TARGET);

  assertUserSurvives(merged);
  assertUpgraded(merged);

  assert.equal(
    countOccurrences(merged, "session banner"),
    1,
    "old banner hook replaced, not duplicated",
  );
  assert.ok(json(merged).includes("session banner --compact"));
  assert.deepEqual(conflicts, []);
});

test("edited: the local matcher edit is kept and the banner edited on both sides is one conflict with both entries kept", () => {
  const { merged, conflicts } = mergeSettings(BASE, EDITED, TARGET);

  assertUserSurvives(merged);
  assertUpgraded(merged);

  assert.ok(json(merged).includes("Write|Edit|MultiEdit|NotebookEdit"));
  assert.deepEqual(merged.hooks.SessionStart, [
    hookGroup("session banner --no-mail"),
    hookGroup("session banner --compact"),
  ]);
  assert.deepEqual(conflicts, [
    {
      path: ["hooks", "SessionStart"],
      base: hookGroup("session banner"),
      ours: [hookGroup("session banner --no-mail")],
      theirs: [hookGroup("session banner --compact")],
    },
  ]);
});

test("no record: an empty base gives the install merge, removing nothing", () => {
  const { merged } = mergeSettings({}, PRE_ANG, BASE);

  assert.equal(json(merged), json(CUSTOMISED));

  const upgrade = mergeSettings({}, CUSTOMISED, TARGET).merged;

  assert.equal(json(upgrade), json(installMerge(CUSTOMISED, TARGET)));
  assert.ok(
    json(upgrade).includes("Bash(jq:*)"),
    "stale entries stay without a base",
  );
});

test("every scenario re-run against the same base and target changes nothing", () => {
  for (const [base, ours] of [
    [BASE, clone(BASE)],
    [BASE, CUSTOMISED],
    [BASE, EDITED],
    [{}, CUSTOMISED],
  ]) {
    const once = mergeSettings(base, ours, TARGET).merged;

    const againstTarget = mergeSettings(TARGET, once, TARGET).merged;
    const againstBase = mergeSettings(base, once, TARGET).merged;

    assert.equal(json(againstTarget), json(once));
    assert.equal(json(againstBase), json(once));
  }
});

test("an entry both sides removed is not a conflict unless both added their own", () => {
  assert.deepEqual(mergeArray(["a", "b"], ["a"], ["a"]), {
    merged: ["a"],
    conflicts: [],
  });
  assert.deepEqual(mergeArray(["a", "b"], ["a", "c"], ["a"]), {
    merged: ["a", "c"],
    conflicts: [],
  });
  assert.deepEqual(mergeArray(["a", "b"], ["a", "c"], ["a", "c"]), {
    merged: ["a", "c"],
    conflicts: [],
  });
});

test("every scenario re-run against the old base reports no new conflicts", () => {
  for (const ours of [clone(BASE), CUSTOMISED]) {
    const once = mergeSettings(BASE, ours, TARGET).merged;

    assert.deepEqual(mergeSettings(BASE, once, TARGET).conflicts, []);
  }
});

test("a key the user deleted stays deleted while base and target still have it", () => {
  const ours = clone(BASE);

  delete ours.hooks.SubagentStart;

  const { merged, conflicts } = mergeSettings(BASE, ours, TARGET);

  assert.ok(!("SubagentStart" in merged.hooks));
  assert.deepEqual(conflicts, []);
});

test("array entries that differ only in key order are the same entry", () => {
  const reordered = {
    hooks: [{ command: "x", type: "command" }],
    matcher: "Write",
  };
  const original = {
    matcher: "Write",
    hooks: [{ type: "command", command: "x" }],
  };

  assert.deepEqual(mergeArray([], [original], [reordered]), {
    merged: [original],
    conflicts: [],
  });
  assert.deepEqual(mergeArray([reordered], [original], []), {
    merged: [],
    conflicts: [],
  });
});

test("new keys follow the user keys, in the target order", () => {
  const { merged } = mergeSettings({}, { b: 1, a: 1 }, { c: 1, a: 2, d: 1 });

  assert.deepEqual(Object.keys(merged), ["b", "a", "c", "d"]);
});
