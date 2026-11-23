import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter, setFrontmatterTags } from "./frontmatter.mjs";

const frontmatterDoc = (...lines) => `---\n${lines.join("\n")}\n---\n# Body\n`;

test("parseFrontmatter returns null without frontmatter", () => {
  assert.equal(parseFrontmatter("# Just a heading\n"), null);
});

test("parseFrontmatter reads CRLF line endings", () => {
  const text = "---\r\ntitle: A\r\ntags:\r\n  - x\r\n---\r\nbody";

  assert.deepEqual(parseFrontmatter(text), { title: "A", tags: ["x"] });
});

test("parseFrontmatter reads key-value lines, unquoting and trimming values", () => {
  const frontmatter = parseFrontmatter(
    frontmatterDoc(
      "short-description2: plain",
      'title:    "Quoted"  ',
      "status: 'ready'",
    ),
  );

  assert.deepEqual(frontmatter, {
    "short-description2": "plain",
    title: "Quoted",
    status: "ready",
  });
});

test("parseFrontmatter splits inline arrays, dropping empty items", () => {
  assert.deepEqual(parseFrontmatter(frontmatterDoc('tags: [a, "b", ]')), {
    tags: ["a", "b"],
  });
});

test("parseFrontmatter reads a block list under an empty value", () => {
  const frontmatter = parseFrontmatter(
    frontmatterDoc("tags:", "- one", "  -   two", '\t-\t"three"', "  - "),
  );

  assert.deepEqual(frontmatter, { tags: ["one", "two", "three", ""] });
});

test("parseFrontmatter treats an empty value with only spaces as a block list", () => {
  assert.deepEqual(parseFrontmatter(frontmatterDoc("tags:   ", "  - a")), {
    tags: ["a"],
  });
});

test("parseFrontmatter skips a list item with no list key above it", () => {
  assert.deepEqual(
    parseFrontmatter(frontmatterDoc("- stray", "title: A", "  - also stray")),
    { title: "A" },
  );
});

test("parseFrontmatter skips a bare dash inside a block list", () => {
  assert.deepEqual(parseFrontmatter(frontmatterDoc("tags:", "  -", "  - a")), {
    tags: ["a"],
  });
});

test("parseFrontmatter skips keys that do not start with a letter, or are indented", () => {
  const text = frontmatterDoc(
    "1st: x",
    "_private: y",
    "  indented: z",
    "title : w",
    "Ok: v",
  );

  assert.deepEqual(parseFrontmatter(text), { Ok: "v" });
});

test("parseFrontmatter ends a block list at the next key-value line", () => {
  const frontmatter = parseFrontmatter(
    frontmatterDoc("tags:", "  - a", "status: ready", "  - b"),
  );

  assert.deepEqual(frontmatter, { tags: ["a"], status: "ready" });
});

test("setFrontmatterTags replaces inline tags", () => {
  const text = frontmatterDoc("title: A", "tags: [old]", "status: ready");

  assert.equal(
    setFrontmatterTags(text, ["x", "y"]),
    frontmatterDoc("title: A", "tags: [x, y]", "status: ready"),
  );
});

test("setFrontmatterTags collapses a block list into one inline line, leaving the rest untouched", () => {
  const text = frontmatterDoc(
    "title: A",
    "tags:",
    "  - old",
    "  -  other",
    "status: ready",
    "related:",
    "  - keep",
  );

  assert.equal(
    setFrontmatterTags(text, ["x"]),
    frontmatterDoc(
      "title: A",
      "tags: [x]",
      "status: ready",
      "related:",
      "  - keep",
    ),
  );
});

test("setFrontmatterTags collapses a block list indented with tabs", () => {
  const text = frontmatterDoc("tags:", "\t-\ta", "\t- b", "title: A");

  assert.equal(
    setFrontmatterTags(text, ["x"]),
    frontmatterDoc("tags: [x]", "title: A"),
  );
});

test("setFrontmatterTags leaves CRLF lines after the tags intact", () => {
  const text = "---\r\ntags:\r\n  - a\r\ntitle: A\r\n---\r\n";

  assert.equal(
    setFrontmatterTags(text, ["x"]),
    "---\r\ntags: [x]\r\ntitle: A\r\n---\r\n",
  );
});

test("setFrontmatterTags returns the text unchanged without a tags line or frontmatter", () => {
  const noTags = frontmatterDoc("title: A");
  const noFrontmatter = "# No frontmatter\ntags: [a]\n";

  assert.equal(setFrontmatterTags(noTags, ["x"]), noTags);
  assert.equal(setFrontmatterTags(noFrontmatter, ["x"]), noFrontmatter);
});

test("setFrontmatterTags leaves a body line starting tags: alone", () => {
  const text = `${frontmatterDoc("title: A", "tags: [a]")}tags: [body]\n`;

  assert.equal(
    setFrontmatterTags(text, ["x"]),
    `${frontmatterDoc("title: A", "tags: [x]")}tags: [body]\n`,
  );
});
