// The streams registry and mailbox, kept as streams.json and mail.json on the `ang/streams` branch.
// Here be dragons: it can't live in project-context/ (every worktree has its own diverging copy) or in .git/ (never
// pushed). An orphan branch is shared by every worktree (they share refs) and travels with the repo. No worktree checks
// it out: it is read with `git show` and written with plumbing. An agent writes only after the user approves (a note it
// suggested, or a stream skill they ran), so writes are rare and never race by design: there is no retry. update-ref's
// old value only makes a clash fail loudly instead of dropping a write.
import { execFileSync } from "node:child_process";
import { PROJECT } from "../../../scripts/ang/paths.mjs";
import { fail } from "../../../scripts/ang/util.mjs";

export const STREAMS_BRANCH = "ang/streams";
const REF = `refs/heads/${STREAMS_BRANCH}`;
const REMOTE_REF = `refs/remotes/origin/${STREAMS_BRANCH}`;
const FILES = { streams: "streams.json", mail: "mail.json" };
// update-ref's all-zero old value means "only if the ref doesn't exist yet".
const REF_MUST_NOT_EXIST = "0".repeat(40);

export function git(args, input) {
  return execFileSync("git", args, {
    cwd: PROJECT,
    input,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}

export function tryGit(args) {
  try {
    return git(args);
  } catch {
    return null;
  }
}

const commitAt = (ref) => tryGit(["rev-parse", "--verify", "--quiet", ref]);

export const refExists = (ref) => commitAt(ref) !== null;
export const currentBranch = () =>
  tryGit(["symbolic-ref", "--short", "--quiet", "HEAD"]);

// A fresh clone has only the remote-tracking ref; building on it keeps one history instead of forking a second root.
function headCommit() {
  return commitAt(REF) ?? commitAt(REMOTE_REF);
}

function readJsonAt(commit, file) {
  const text = commit ? tryGit(["show", `${commit}:${file}`]) : null;

  return text ? JSON.parse(text) : [];
}

function snapshot(commit) {
  return {
    streams: readJsonAt(commit, FILES.streams),
    mail: readJsonAt(commit, FILES.mail),
  };
}

export const loadStore = () => snapshot(headCommit());

function commitStore(store, parent, message) {
  const treeEntries = Object.entries(FILES).map(([key, file]) => {
    const json = JSON.stringify(store[key], null, 2) + "\n";
    const blobId = git(["hash-object", "-w", "--stdin"], json);

    return `100644 blob ${blobId}\t${file}`;
  });
  const tree = git(["mktree"], treeEntries.join("\n") + "\n");
  const parentArgs = parent ? ["-p", parent] : [];

  return git(["commit-tree", tree, ...parentArgs, "-m", message]);
}

function pushStore() {
  if (!tryGit(["remote", "get-url", "origin"])) {
    return;
  }

  const pushed = tryGit(["push", "--quiet", "origin", `${REF}:${REF}`]);

  if (pushed === null) {
    console.error(
      `⚠ couldn't push ${STREAMS_BRANCH} to origin; the next write pushes both`,
    );
  }
}

// change(store) edits the store in place, or calls fail() to refuse.
export function updateStore(message, change) {
  const localHead = commitAt(REF);
  const parent = headCommit();
  const store = snapshot(parent);

  change(store);

  const commit = commitStore(store, parent, message);
  const expectedOldValue = localHead ?? REF_MUST_NOT_EXIST;
  const isSwapped =
    tryGit(["update-ref", REF, commit, expectedOldValue]) !== null;

  if (!isSwapped) {
    fail(`${STREAMS_BRANCH} changed under this write; run it again`);
  }

  pushStore();

  return store;
}

// The stream this checkout belongs to: 'main' on main, the registry entry for HEAD's branch, or null when unregistered.
export function currentStream(streams) {
  const branch = currentBranch();

  if (branch === "main") {
    return "main";
  }

  return streams.find((s) => s.branch === branch)?.slug ?? null;
}
