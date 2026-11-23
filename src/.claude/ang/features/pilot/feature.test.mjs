import { test } from "node:test";
import assert from "node:assert/strict";
import pilot from "./feature.mjs";

test("check accepts null and a name", () => {
  assert.equal(pilot.config.check(null), null);
  assert.equal(pilot.config.check("Zac"), null);
});

test("check rejects an empty string, whitespace and a number", () => {
  for (const value of ["", "   ", 42]) {
    assert.equal(
      pilot.config.check(value),
      "must be null or a name",
      String(value),
    );
  }
});

test("on when a name is set, off when null", () => {
  assert.equal(pilot.on("Zac"), true);
  assert.equal(pilot.on(null), false);
});
