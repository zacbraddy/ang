import { ITEM_STAGES } from '../paths.mjs';
import { resolveItem } from '../items/resolve.mjs';
import { mergeItem, moveItem } from '../items/move.mjs';

export default [
  {
    noun: 'item', verb: 'move', args: [{ name: 'item' }, { name: 'stage', enum: ITEM_STAGES }], flags: [],
    summary: 'move an item to a stage folder, rewrite links, log lineage, reindex',
    run({ item, stage }) {
      moveItem(resolveItem(item), stage);
    },
  },
  {
    noun: 'item', verb: 'merge', args: [{ name: 'item' }, { name: 'into' }], flags: [{ name: 'nest', value: 'dir' }],
    summary: 'fold an item into another (files, state, links, triggers); deletes the folded item',
    run({ item, into }, { nest }) {
      mergeItem(resolveItem(item), resolveItem(into), nest);
    },
  },
];
