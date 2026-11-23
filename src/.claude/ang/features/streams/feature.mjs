import fs from "node:fs";
import commands from "./commands.mjs";
import {
  currentStream,
  loadStore,
  refExists,
  STREAMS_BRANCH,
} from "./store.mjs";

// Registry drift, which catches worktrees and branches deleted by hand. Warnings, because only the user can say whether a
// stream is finished: /end-stream is the fix.
function warnings() {
  const { streams, mail } = loadStore();
  const registeredSlugs = new Set(streams.map((s) => s.slug));
  const streamsMissingBranch = streams.filter(
    (s) => !refExists(`refs/heads/${s.branch}`),
  );
  const streamsMissingWorktree = streams.filter(
    (s) => !fs.existsSync(s.worktree),
  );
  const strayNotes = mail.filter((m) => !registeredSlugs.has(m.to));

  return [
    ...streamsMissingBranch.map(
      (stream) =>
        `${STREAMS_BRANCH}: stream ${stream.slug}'s branch ${stream.branch} is gone (/end-stream ${stream.slug})`,
    ),
    ...streamsMissingWorktree.map(
      (stream) =>
        `${STREAMS_BRANCH}: stream ${stream.slug}'s worktree ${stream.worktree} is gone`,
    ),
    ...strayNotes.map(
      (note) =>
        `${STREAMS_BRANCH}: note ${note.id} is addressed to unregistered stream ${note.to} (mail forward or mail handle)`,
    ),
  ];
}

function banner() {
  const { streams, mail } = loadStore();
  const current = currentStream(streams);

  if (current === "main") {
    return "on main";
  }

  if (!current) {
    return "unregistered";
  }

  const unreadCount = mail.filter((m) => m.to === current).length;

  return unreadCount ? `${current}, ${unreadCount} unread mail` : current;
}

export default {
  key: "streams",
  dir: import.meta.dirname,
  validate: () => [],
  warnings,
  banner,
  commands,
  bootstrap: {
    question:
      "Will the user run several Ang sessions in parallel here, one branch per worktree (streams), with a shared registry and a user-approved mailbox between them? Worth it only when long-running work in one stream would otherwise block another.",
    default: false,
    ifYes:
      "Nothing more to write now: the user starts streams with `/start-stream` from main.",
  },
};
