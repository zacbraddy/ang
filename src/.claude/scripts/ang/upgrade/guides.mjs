const SECTIONS = [
  ['Moves', 'moves'],
  ['Migrations', 'migrations'],
  ['Retired', 'retired'],
  ['Notes for the merge', 'notes'],
];

// An entry is a `- ` line plus any indented lines after it, so a drafted guide can wrap.
function entries(heading, lines) {
  const items = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.startsWith('- ')) items.push(line.slice(2).trim());
    else if (/^\s/.test(line) && items.length) items[items.length - 1] += `\n${line.trim()}`;
    else throw new Error(`${heading}: expected a "- " entry, got "${line}"`);
  }
  if (!items.length) throw new Error(`${heading} has no entries; write "- None" when there's nothing to say`);
  return items.length === 1 && items[0] === 'None' ? [] : items;
}

function parseMove(entry) {
  const match = entry.match(/^`([^`]+)`\s*->\s*`([^`]+)`(?::\s*([\s\S]*))?$/);
  if (!match) throw new Error(`Moves entry must be shaped \`from\` -> \`to\`: "${entry}"`);
  return { from: match[1], to: match[2], note: match[3]?.trim() ?? '' };
}

export function parseGuide(markdown) {
  const lines = markdown.split(/\r?\n/);
  const at = (pattern) => lines.findIndex((l) => pattern.test(l));

  const titleAt = at(/^# Upgrade guide /);
  if (titleAt === -1) throw new Error('missing title line "# Upgrade guide vX.Y.Z"');
  const version = lines[titleAt].slice('# Upgrade guide '.length).trim();
  const fromAt = at(/^from:/);
  if (fromAt === -1) throw new Error('missing "from:" line');
  const fromValue = lines[fromAt].slice('from:'.length).trim();
  if (!fromValue) throw new Error('empty "from:" line; write the previous tag, or "none" for the first release');

  const headings = lines.flatMap((l, i) => (l.startsWith('## ') ? [{ name: l.slice(3).trim(), i }] : []));
  for (const [name] of SECTIONS) {
    const count = headings.filter((h) => h.name === name).length;
    if (count === 0) throw new Error(`missing "## ${name}" heading`);
    if (count > 1) throw new Error(`"## ${name}" heading appears twice`);
  }
  const names = headings.map((h) => h.name);
  const expected = SECTIONS.map(([name]) => name);
  if (names.join('\n') !== expected.join('\n')) throw new Error(`headings must be, in order: ${expected.join(', ')}`);

  const guide = { version, from: fromValue === 'none' ? null : fromValue };
  for (const [index, [name, key]] of SECTIONS.entries()) {
    const body = lines.slice(headings[index].i + 1, headings[index + 1]?.i ?? lines.length);
    guide[key] = entries(name, body);
  }
  guide.moves = guide.moves.map(parseMove);
  return guide;
}

// Walks from the target back to the installed tag, then returns the guides oldest first. The installed tag's own guide
// is never fetched: its changes are already in the project.
export async function chainGuides(fetchGuide, installedTag, targetTag) {
  const chain = [];
  const walked = new Set();
  let tag = targetTag;
  while (tag !== installedTag) {
    if (tag === null) throw new Error(`broken chain: the guides from ${targetTag} back to the first release never reach ${installedTag}`);
    if (walked.has(tag)) throw new Error(`broken chain: from: lines loop back to ${tag} between ${installedTag} and ${targetTag}`);
    walked.add(tag);
    const guide = parseGuide(await fetchGuide(tag));
    if (guide.version !== tag) throw new Error(`the guide fetched as ${tag} is titled ${guide.version}`);
    chain.push(guide);
    tag = guide.from;
  }
  return chain.reverse();
}

// Every guide is read at the target tag, not its own, so a guide fixed in a later release is the one that's used.
export function githubGuideFetcher(targetTag, base = process.env.ANG_GITHUB_RAW ?? 'https://raw.githubusercontent.com') {
  return async (tag) => {
    const url = `${base}/zacbraddy/ang/${targetTag}/releases/upgrades/${tag}.md`;
    let response;
    try {
      response = await fetch(url);
    } catch (error) {
      throw new Error(`network error fetching ${url}: ${error.cause?.message ?? error.message}`);
    }
    if (response.status === 404) throw new Error(`no upgrade guide for ${tag} at ${targetTag} (${url})`);
    if (!response.ok) throw new Error(`fetching ${url} returned ${response.status}`);
    return response.text();
  };
}
