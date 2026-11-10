import fs from 'node:fs';
import { CTX, ITEM_STAGES } from '../paths.mjs';
import { buildIndex, initLibrary } from '../library/index.mjs';
import { validateLibrary } from '../library/validate.mjs';
import { printBoard } from '../items/board.mjs';

export default [
  {
    noun: 'library', verb: 'init', args: [], flags: [],
    summary: 'create the project-context/ folder structure, tags.json and indexes',
    run() {
      initLibrary();
      console.log('✔ project-context initialised');
    },
  },
  {
    noun: 'library', verb: 'index', args: [], flags: [{ name: 'quiet' }],
    summary: 'regenerate index.json files from doc frontmatter',
    run(_, { quiet }) {
      if (!fs.existsSync(CTX)) return;
      const changed = buildIndex();
      if (!quiet) console.log(`✔ ${changed} index file(s) updated`);
    },
  },
  {
    noun: 'library', verb: 'validate', args: [], flags: [],
    summary: 'check config, docs, tags, links, state.json, stories and triggers (exit 1 on errors)',
    run() {
      if (!validateLibrary()) process.exit(1);
      console.log('✔ project-context valid');
    },
  },
  {
    noun: 'board', verb: 'status', args: [{ name: 'stage', enum: ITEM_STAGES, optional: true }], flags: [],
    summary: 'items, status, next unknown, story progress and trigger counts',
    run({ stage }) {
      printBoard(stage);
    },
  },
];
