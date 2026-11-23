import { unquote } from "../util.mjs";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;
const LIST_ITEM_RE = /^\s*-\s+(\S.*)?$/;
const KEY_VALUE_RE = /^([a-z][\w-]*):\s*(\S.*)?$/i;

function parseInlineList(value) {
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map(unquote)
    .filter(Boolean);
}

export function parseFrontmatter(text) {
  const match = text.match(FRONTMATTER_RE);

  if (!match) {
    return null;
  }

  const frontmatter = {};
  let openListKey = null;

  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(LIST_ITEM_RE);

    if (listItem && openListKey) {
      frontmatter[openListKey].push(unquote(listItem[1] ?? ""));
      continue;
    }

    const keyValue = line.match(KEY_VALUE_RE);

    if (!keyValue) {
      continue;
    }

    const [, key, value = ""] = keyValue;

    openListKey = null;

    if (value === "") {
      frontmatter[key] = [];
      openListKey = key;
    } else if (value.startsWith("[")) {
      frontmatter[key] = parseInlineList(value);
    } else {
      frontmatter[key] = unquote(value);
    }
  }

  return frontmatter;
}

export function setFrontmatterTags(text, tags) {
  const match = text.match(FRONTMATTER_RE);

  if (!match) {
    return text;
  }

  const tagsLineAndAnyListItems = /^tags:.*(?:\r?\n[ \t]*-[ \t].*)*/m;
  const block = match[1].replace(
    tagsLineAndAnyListItems,
    `tags: [${tags.join(", ")}]`,
  );

  return text.replace(match[1], block);
}
