import { unquote } from '../util.mjs';

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

export function parseFrontmatter(text) {
  const match = text.match(FM_RE);
  if (!match) return null;
  const fm = {};
  let listKey = null;
  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && listKey) {
      fm[listKey].push(unquote(listItem[1]));
      continue;
    }
    const keyValue = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!keyValue) continue;
    const [, key, value] = keyValue;
    listKey = null;
    if (value === '') {
      fm[key] = [];
      listKey = key;
    } else if (value.startsWith('[')) {
      fm[key] = value.replace(/^\[|\]$/g, '').split(',').map(unquote).filter(Boolean);
    } else {
      fm[key] = unquote(value);
    }
  }
  return fm;
}

export function setFrontmatterTags(text, tags) {
  const match = text.match(FM_RE);
  if (!match) return text;
  const block = match[1].replace(/^tags:.*(?:\r?\n[ \t]*-[ \t]+.*)*/m, `tags: [${tags.join(', ')}]`);
  return text.replace(match[1], block);
}
