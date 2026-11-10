import crypto from 'node:crypto';
import path from 'node:path';
import { PROJECT, SLUG_RE } from '../../../scripts/ang/paths.mjs';
import { fail, today } from '../../../scripts/ang/util.mjs';
import { currentStream, loadStore, updateStore } from './store.mjs';

const inboxOf = (mail, slug) => mail.filter((m) => m.to === slug);

function findStream(store, slug) {
  const stream = store.streams.find((s) => s.slug === slug);
  if (!stream) fail(`no stream ${slug} (see: stream list)`);
  return stream;
}

function printNote(note) {
  console.log(`${note.id}  ${note.sent}  ${note.from} → ${note.to}`);
  console.log(`        ${note.text}`);
}

const streamCommands = [
  {
    noun: 'stream', verb: 'add', args: [{ name: 'slug' }, { name: 'focus', optional: true }],
    flags: [{ name: 'worktree', value: 'path', required: true }, { name: 'branch', value: 'branch' }],
    summary: 'register a stream (branch defaults to stream/<slug>); /start-stream creates the branch and worktree first',
    run({ slug, focus }, flags) {
      const branch = flags.branch ?? `stream/${slug}`;
      const worktree = path.resolve(PROJECT, flags.worktree);
      if (!SLUG_RE.test(slug)) fail('stream slugs are kebab-case');
      if (slug === 'main' || branch === 'main') fail('main is not a stream');
      updateStore(`stream add ${slug}`, (store) => {
        if (store.streams.some((s) => s.slug === slug)) fail(`stream exists: ${slug}`);
        const holder = store.streams.find((s) => s.branch === branch);
        if (holder) fail(`${branch} is already stream ${holder.slug}`);
        store.streams.push({ slug, branch, worktree, focus: focus ?? '' });
      });
      console.log(`✔ registered stream ${slug} (${branch})`);
    },
  },
  {
    noun: 'stream', verb: 'list', args: [], flags: [],
    summary: 'every stream with its branch, unread mail and focus; * marks this checkout\'s',
    run() {
      const { streams, mail } = loadStore();
      const current = currentStream(streams);
      console.log(`this checkout: ${current ?? 'unregistered'}`);
      if (!streams.length) {
        console.log('no streams');
        return;
      }
      for (const s of streams) {
        const marker = s.slug === current ? '*' : ' ';
        const unread = inboxOf(mail, s.slug).length;
        console.log(`${marker} ${s.slug}  ${s.branch}  ${unread} unread  ${s.worktree}`);
        if (s.focus) console.log(`    ${s.focus}`);
      }
    },
  },
  {
    noun: 'stream', verb: 'set', args: [{ name: 'slug' }],
    flags: [{ name: 'focus', value: 'text', required: true }],
    summary: 'change a stream\'s focus line, which other streams read before peeking or mailing',
    run({ slug }, { focus }) {
      updateStore(`stream set ${slug}`, (store) => {
        findStream(store, slug).focus = focus;
      });
      console.log(`✔ updated stream ${slug}`);
    },
  },
  {
    noun: 'stream', verb: 'remove', args: [{ name: 'slug' }], flags: [],
    summary: 'deregister a stream once its inbox is empty (use /end-stream); git keeps the history',
    run({ slug }) {
      updateStore(`stream remove ${slug}`, (store) => {
        findStream(store, slug);
        const orphans = inboxOf(store.mail, slug).length;
        if (orphans) fail(`${slug} still has ${orphans} note(s); forward or handle them first (mail list ${slug})`);
        store.streams = store.streams.filter((s) => s.slug !== slug);
      });
      console.log(`✔ removed stream ${slug}`);
    },
  },
];

const mailCommands = [
  {
    noun: 'mail', verb: 'send', args: [{ name: 'to' }, { name: 'text' }], flags: [],
    summary: 'leave a note in a stream\'s inbox, only after the user approves its text and target',
    run({ to, text }) {
      let id;
      updateStore(`mail send → ${to}`, (store) => {
        const from = currentStream(store.streams);
        if (!from) fail('this branch is not a stream; register it or send from main');
        if (to === from) fail('a stream can\'t mail itself');
        findStream(store, to);
        id = crypto.randomBytes(3).toString('hex');
        store.mail.push({ id, from, to, sent: today(), text });
      });
      console.log(`✔ sent ${id} to ${to}`);
    },
  },
  {
    noun: 'mail', verb: 'list', args: [{ name: 'stream', optional: true }], flags: [],
    summary: 'a stream\'s unread notes (default: this checkout\'s stream; on main, every note)',
    run({ stream }) {
      const { streams, mail } = loadStore();
      const current = currentStream(streams);
      const target = stream ?? (current === 'main' ? null : current);
      if (stream === undefined && current === null) fail('this branch is not a stream; name one (mail list <stream>)');
      const notes = target ? inboxOf(mail, target) : mail;
      if (!notes.length) {
        console.log(target ? `no mail for ${target}` : 'no mail');
        return;
      }
      notes.forEach(printNote);
    },
  },
  {
    noun: 'mail', verb: 'forward', args: [{ name: 'id' }, { name: 'to' }], flags: [],
    summary: 'readdress a note to another stream, keeping its sender (for /end-stream orphans)',
    run({ id, to }) {
      updateStore(`mail forward ${id} → ${to}`, (store) => {
        const note = store.mail.find((m) => m.id === id);
        if (!note) fail(`no note ${id}`);
        findStream(store, to);
        note.to = to;
      });
      console.log(`✔ forwarded ${id} to ${to}`);
    },
  },
  {
    noun: 'mail', verb: 'handle', args: [{ name: 'id' }], flags: [],
    summary: 'delete a note once the user has decided what it becomes',
    run({ id }) {
      updateStore(`mail handle ${id}`, (store) => {
        if (!store.mail.some((m) => m.id === id)) fail(`no note ${id}`);
        store.mail = store.mail.filter((m) => m.id !== id);
      });
      console.log(`✔ handled ${id}`);
    },
  },
];

export default [...streamCommands, ...mailCommands];
