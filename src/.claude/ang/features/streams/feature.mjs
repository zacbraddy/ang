import fs from 'node:fs';
import commands from './commands.mjs';
import { currentStream, loadStore, refExists, STREAMS_BRANCH } from './store.mjs';

// Registry drift, which catches worktrees and branches deleted by hand. Warnings, because only the user can say whether a
// stream is finished: /end-stream is the fix.
function warnings() {
  const { streams, mail } = loadStore();
  const registered = new Set(streams.map((s) => s.slug));
  const goneBranches = streams.filter((s) => !refExists(`refs/heads/${s.branch}`));
  const goneWorktrees = streams.filter((s) => !fs.existsSync(s.worktree));
  const strays = mail.filter((m) => !registered.has(m.to));
  return [
    ...goneBranches.map((s) => `${STREAMS_BRANCH}: stream ${s.slug}'s branch ${s.branch} is gone (/end-stream ${s.slug})`),
    ...goneWorktrees.map((s) => `${STREAMS_BRANCH}: stream ${s.slug}'s worktree ${s.worktree} is gone`),
    ...strays.map((m) => `${STREAMS_BRANCH}: note ${m.id} is addressed to unregistered stream ${m.to} (mail forward or mail handle)`),
  ];
}

function banner() {
  const { streams, mail } = loadStore();
  const current = currentStream(streams);
  if (current === 'main') return 'on main';
  if (!current) return 'unregistered';
  const unread = mail.filter((m) => m.to === current).length;
  return unread ? `${current}, ${unread} unread mail` : current;
}

export default {
  key: 'streams',
  dir: import.meta.dirname,
  validate: () => [],
  warnings,
  banner,
  commands,
  bootstrap: {
    question: 'Will the user run several Ang sessions in parallel here, one branch per worktree (streams), with a shared registry and a user-approved mailbox between them? Worth it only when long-running work in one stream would otherwise block another.',
    default: false,
    ifYes: 'Nothing more to write now: the user starts streams with `/start-stream` from main.',
  },
};
