import fs from 'node:fs';
import path from 'node:path';
import { CONFIG_FILE, CTX } from '../../../scripts/ang/paths.mjs';
import { read, rel } from '../../../scripts/ang/util.mjs';
import { parseFrontmatter } from '../../../scripts/ang/library/frontmatter.mjs';

const INTENT_FILE = path.join(CTX, '10k', 'intent.md');

// Runs whether the feature is on or off: a doc left behind after switching off is as wrong as a missing one.
function validate(on) {
  const intentExists = fs.existsSync(INTENT_FILE);
  if (on && !intentExists) return [`${rel(CONFIG_FILE)}: intent is true but ${rel(INTENT_FILE)} is missing (write it, or set intent false)`];
  if (!on && intentExists) return [`${rel(INTENT_FILE)} exists but intent is off in ${rel(CONFIG_FILE)} (set intent true, or delete the doc)`];
  if (!intentExists) return [];
  const confirmed = parseFrontmatter(read(INTENT_FILE))?.confirmed ?? '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(confirmed)) return [];
  return [`${rel(INTENT_FILE)}: needs confirmed: YYYY-MM-DD, the date the user last confirmed it`];
}

export default {
  key: 'intent',
  dir: import.meta.dirname,
  validate,
  commands: [],
  bootstrap: {
    question: 'Does this project want a delivery intent: a `10k/intent.md` holding how the user means work to be delivered right now, and why? It pays off on product work built from shaky facts, where discovery dominates, and gets in the way on a contract working through a team\'s tickets.',
    default: false,
    ifYes: 'Draft `10k/intent.md` with the user from their own words, in the shape `.claude/ang/features/intent/conventions.md` gives, and propose it with the next batch of 10k docs.',
  },
};
