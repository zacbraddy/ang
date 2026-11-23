import { after, test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { chainGuides, githubGuideFetcher, parseGuide } from "./guides.mjs";

const guideMarkdown = ({
  version = "v1.1.0",
  from = "v1.0.0",
  moves = "- None",
  migrations = "- None",
  retired = "- None",
  notes = "- None",
} = {}) =>
  `# Upgrade guide ${version}\nfrom: ${from}\n## Moves\n${moves}\n## Migrations\n${migrations}\n## Retired\n${retired}\n## Notes for the merge\n${notes}\n`;

test("parseGuide returns every section, each move split into from, to and note", () => {
  const markdown = guideMarkdown({
    moves:
      "- `.claude/ang.json` -> `ang.json`: carry every key across.\n- `a/b.md` -> `c/b.md`",
    migrations: "- Run `library index`.",
    retired:
      '- "testing rules" wording: replaced by\n  `engineering-defaults.md`.',
    notes: "\n- Keep local hooks.\n",
  });

  const parsed = parseGuide(markdown);

  assert.deepEqual(parsed, {
    version: "v1.1.0",
    from: "v1.0.0",
    moves: [
      {
        from: ".claude/ang.json",
        to: "ang.json",
        note: "carry every key across.",
      },
      { from: "a/b.md", to: "c/b.md", note: "" },
    ],
    migrations: ["Run `library index`."],
    retired: [
      '"testing rules" wording: replaced by\n`engineering-defaults.md`.',
    ],
    notes: ["Keep local hooks."],
  });
});

test("parseGuide reads a section holding only None as empty", () => {
  const parsed = parseGuide(guideMarkdown());

  assert.deepEqual(
    [parsed.moves, parsed.migrations, parsed.retired, parsed.notes],
    [[], [], [], []],
  );
});

test("parseGuide reads from: none as the root of the chain", () => {
  assert.equal(parseGuide(guideMarkdown({ from: "none" })).from, null);
});

test("parseGuide throws naming a missing title, from: line or heading", () => {
  const valid = guideMarkdown();
  const cases = [
    [valid.replace("# Upgrade guide v1.1.0\n", ""), /title/],
    [valid.replace("from: v1.0.0\n", ""), /from:/],
    [valid.replace("from: v1.0.0", "from:"), /from:/],
    [valid.replace("## Moves\n- None\n", ""), /Moves/],
    [valid.replace("## Migrations\n- None\n", ""), /Migrations/],
    [valid.replace("## Retired\n- None\n", ""), /Retired/],
    [
      valid.replace("## Notes for the merge\n- None\n", ""),
      /Notes for the merge/,
    ],
  ];

  for (const [markdown, message] of cases) {
    assert.throws(() => parseGuide(markdown), message);
  }
});

test("parseGuide throws naming a heading that appears twice or out of order", () => {
  const repeated = guideMarkdown() + "## Retired\n- None\n";
  const swapped = guideMarkdown()
    .replace("## Moves", "## TMP")
    .replace("## Retired", "## Moves")
    .replace("## TMP", "## Retired");

  assert.throws(() => parseGuide(repeated), /Retired.*twice/);
  assert.throws(() => parseGuide(swapped), /order/);
});

test("parseGuide throws naming a section with no entries and no None", () => {
  assert.throws(
    () => parseGuide(guideMarkdown({ migrations: "" })),
    /Migrations/,
  );
});

test("parseGuide reads a move with a colon and an empty note as no note", () => {
  const markdown = guideMarkdown({ moves: "- `a`->`b`:\n- `c` -> `d`:   " });

  assert.deepEqual(parseGuide(markdown).moves, [
    { from: "a", to: "b", note: "" },
    { from: "c", to: "d", note: "" },
  ]);
});

test("parseGuide throws quoting a Moves entry not shaped `a` -> `b`", () => {
  assert.throws(
    () => parseGuide(guideMarkdown({ moves: "- a.md to b.md" })),
    /a\.md to b\.md/,
  );
});

// A fetchGuide over a Map of tag → markdown that records every tag it was asked for.
function recordingFetcher(guides) {
  const asked = [];
  const fetchGuide = async (tag) => {
    asked.push(tag);

    if (!guides.has(tag)) {
      throw new Error(`no upgrade guide for ${tag}`);
    }

    return guides.get(tag);
  };

  return { fetchGuide, asked };
}

const RELEASES = new Map([
  ["v1.0.0", guideMarkdown({ version: "v1.0.0", from: "none" })],
  ["v1.1.0", guideMarkdown({ version: "v1.1.0", from: "v1.0.0" })],
  ["v1.2.0", guideMarkdown({ version: "v1.2.0", from: "v1.1.0" })],
]);

test("chainGuides returns the guides after the installed tag, oldest first, without fetching the installed one", async () => {
  const { fetchGuide, asked } = recordingFetcher(RELEASES);

  const chain = await chainGuides(fetchGuide, "v1.0.0", "v1.2.0");

  assert.deepEqual(
    chain.map((guide) => guide.version),
    ["v1.1.0", "v1.2.0"],
  );
  assert.ok(!asked.includes("v1.0.0"));
});

test("chainGuides returns nothing and fetches nothing when installed is the target", async () => {
  const { fetchGuide, asked } = recordingFetcher(RELEASES);

  const chain = await chainGuides(fetchGuide, "v1.2.0", "v1.2.0");

  assert.deepEqual(chain, []);
  assert.deepEqual(asked, []);
});

test("chainGuides throws naming a missing guide", async () => {
  const guides = new Map(RELEASES);

  guides.delete("v1.1.0");

  await assert.rejects(
    chainGuides(recordingFetcher(guides).fetchGuide, "v1.0.0", "v1.2.0"),
    /v1\.1\.0/,
  );
});

test("chainGuides throws naming both when a guide is titled for another tag", async () => {
  const guides = new Map(RELEASES).set(
    "v1.1.0",
    guideMarkdown({ version: "v1.1.1", from: "v1.0.0" }),
  );

  await assert.rejects(
    chainGuides(recordingFetcher(guides).fetchGuide, "v1.0.0", "v1.2.0"),
    /v1\.1\.1.*v1\.1\.0|v1\.1\.0.*v1\.1\.1/,
  );
});

test("chainGuides throws broken chain when the walk reaches the root without meeting the installed tag", async () => {
  for (const installed of ["v0.9.0", "v1.3.0", "main"]) {
    await assert.rejects(
      chainGuides(recordingFetcher(RELEASES).fetchGuide, installed, "v1.2.0"),
      (error) => {
        assert.match(error.message, /broken chain/);
        assert.match(error.message, new RegExp(installed));
        assert.match(error.message, /v1\.2\.0/);

        return true;
      },
    );
  }
});

test("chainGuides throws broken chain naming a from: line that loops back", async () => {
  const guides = new Map(RELEASES).set(
    "v1.1.0",
    guideMarkdown({ version: "v1.1.0", from: "v1.2.0" }),
  );

  await assert.rejects(
    chainGuides(recordingFetcher(guides).fetchGuide, "v1.0.0", "v1.2.0"),
    /broken chain.*loop.*v1\.2\.0/,
  );
});

// A local server that answers each path from `routes` (path → [status, body]); anything else is a 404.
const GUIDE_PATH = "/zacbraddy/ang/v1.2.0/releases/upgrades/v1.1.0.md";

async function serveRoutes(routes) {
  const requested = [];
  const server = http.createServer((request, response) => {
    requested.push(request.url);

    const [status, body] = routes[request.url] ?? [404, "Not Found"];

    response.writeHead(status).end(body);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  after(() => server.close());

  return { base: `http://127.0.0.1:${server.address().port}`, requested };
}

test("githubGuideFetcher reads each guide at the target tag", async () => {
  const { base, requested } = await serveRoutes({
    [GUIDE_PATH]: [200, "the guide"],
  });

  const markdown = await githubGuideFetcher("v1.2.0", base)("v1.1.0");

  assert.equal(markdown, "the guide");
  assert.deepEqual(requested, [GUIDE_PATH]);
});

test("githubGuideFetcher says there is no guide for the tag at the target on a 404", async () => {
  const { base } = await serveRoutes({});

  await assert.rejects(
    githubGuideFetcher("v1.2.0", base)("v1.1.0"),
    /no upgrade guide for v1\.1\.0 at v1\.2\.0/,
  );
});

test("githubGuideFetcher names the status on any other non-2xx", async () => {
  const { base } = await serveRoutes({
    [GUIDE_PATH]: [500, "oops"],
  });

  await assert.rejects(githubGuideFetcher("v1.2.0", base)("v1.1.0"), /500/);
});

test("githubGuideFetcher names the network when the fetch itself fails", async () => {
  const server = http.createServer();

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  const base = `http://127.0.0.1:${server.address().port}`;

  await new Promise((resolve) => server.close(resolve));

  await assert.rejects(githubGuideFetcher("v1.2.0", base)("v1.1.0"), /network/);
});
