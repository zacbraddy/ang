import fs from "node:fs";
import path from "node:path";
import { VERSION_FILE } from "../paths.mjs";
import { fail, readJson, rel, writeJson } from "../util.mjs";

// The one reader of the record (d35), shared with upgrade target.
export const readVersionRecord = () =>
  fs.existsSync(VERSION_FILE) ? readJson(VERSION_FILE) : null;

export default [
  {
    noun: "version",
    verb: "show",
    args: [],
    flags: [],
    summary: "print the installed Ang version record, or none",
    run() {
      const record = readVersionRecord();

      console.log(record ? JSON.stringify(record, null, 2) : "none");
    },
  },
  {
    noun: "version",
    verb: "write",
    args: [],
    flags: [
      { name: "ref", value: "tag", required: true },
      { name: "sha", value: "sha", required: true },
    ],
    summary: `record the installed Ang ref and full commit SHA in ${rel(VERSION_FILE)}`,
    run(_, { ref, sha }) {
      if (!ref.trim()) {
        fail("--ref must not be empty");
      }

      const isFullSha = /^[0-9a-f]{40}$/.test(sha);

      if (!isFullSha) {
        fail(
          `--sha must be a full 40-character lowercase hex commit SHA, got "${sha}"`,
        );
      }

      fs.mkdirSync(path.dirname(VERSION_FILE), { recursive: true });
      writeJson(VERSION_FILE, {
        ref,
        sha,
        installedAt: new Date().toISOString(),
      });
      console.log(`✔ recorded Ang ${ref} (${sha.slice(0, 7)})`);
    },
  },
];
