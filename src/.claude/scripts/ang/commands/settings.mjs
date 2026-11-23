import fs from "node:fs";
import path from "node:path";
import { readJson, writeJson } from "../util.mjs";
import { mergeSettings } from "../settings/merge.mjs";

export default [
  {
    noun: "settings",
    verb: "merge",
    args: [],
    flags: [
      { name: "base", value: "file|none", required: true },
      { name: "ours", value: "file", required: true },
      { name: "theirs", value: "file", required: true },
    ],
    summary:
      "three-way merge Ang's settings into --ours in place (base none: the install merge); prints conflicts as JSON",
    run(_, { base, ours, theirs }) {
      const baseSettings = base === "none" ? {} : readJson(base);
      const ourSettings = readJson(ours, { missing: {} });
      const theirSettings = readJson(theirs);
      const { merged, conflicts } = mergeSettings(
        baseSettings,
        ourSettings,
        theirSettings,
      );

      fs.mkdirSync(path.dirname(path.resolve(ours)), { recursive: true });
      writeJson(ours, merged);
      console.log(JSON.stringify(conflicts, null, 2));
    },
  },
];
