import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareTags, parseTag, resolveRelease, targetStatus } from './target.mjs';

const SHA = 'a'.repeat(40);
const API = 'https://api.test';

test('compareTags orders releases semantically, a release after its prereleases', () => {
  const ordered = ['v1.0.0-rc.1', 'v1.0.0-rc.2', 'v1.0.0-rc.9', 'v1.0.0-rc.10', 'v1.0.0', 'v1.0.1', 'v1.1.0', 'v2.0.0'];
  const shuffled = [...ordered].reverse();
  assert.deepEqual(shuffled.sort(compareTags), ordered);
  assert.equal(compareTags('v1.0.0', 'v1.0.0'), 0);
});

test('compareTags follows semver for mixed prerelease parts', () => {
  assert.ok(compareTags('v1.0.0-alpha', 'v1.0.0-alpha.1') < 0);
  assert.ok(compareTags('v1.0.0-alpha.1', 'v1.0.0-alpha.beta') < 0);
  assert.ok(compareTags('v1.0.0-beta', 'v1.0.0-rc.1') < 0);
});

test('parseTag rejects anything that is not v<major>.<minor>.<patch>[-prerelease]', () => {
  for (const tag of ['1.0.0', 'v1.0', 'v1.0.0-', 'v1.0.0-rc..1', 'main', 'v01.0.0x']) assert.equal(parseTag(tag), null, tag);
  assert.deepEqual(parseTag('v1.2.3-rc.4'), { major: 1, minor: 2, patch: 3, pre: ['rc', '4'] });
});

test('compareTags throws naming an unparseable tag', () => {
  assert.throws(() => compareTags('v1.0.0', 'main'), /main isn't a version tag/);
});

test('targetStatus is current, upgrade or downgrade against the record', () => {
  const to = { ref: 'v1.0.0-rc.2', sha: SHA };
  assert.equal(targetStatus({ ref: 'v1.0.0-rc.2', sha: SHA }, to), 'current');
  assert.equal(targetStatus({ ref: 'v1.0.0-rc.1', sha: SHA }, to), 'upgrade');
  assert.equal(targetStatus({ ref: 'v1.0.0', sha: SHA }, to), 'downgrade');
});

test('targetStatus is no-record without a record or with a ref that is not a version tag', () => {
  const to = { ref: 'v1.0.0', sha: SHA };
  assert.equal(targetStatus(null, to), 'no-record');
  assert.equal(targetStatus({ ref: 'pre-open-source', sha: SHA }, to), 'no-record');
});

// A stub fetch answering from a map of URL to { status, body, headers }; anything else is a 404. `throws` simulates a network error.
function stubFetch(routes, { throws } = {}) {
  const calls = [];
  const fetch = async (url, options) => {
    calls.push({ url, accept: options?.headers?.accept });
    if (throws) throw Object.assign(new TypeError('fetch failed'), { cause: { code: throws } });
    const route = routes[url] ?? { status: 404, body: '{}' };
    const status = route.status ?? 200;
    const body = typeof route.body === 'string' ? route.body : JSON.stringify(route.body);
    return new Response(body, { status, headers: route.headers ?? {} });
  };
  return { fetch, calls };
}

const release = (tag, extra = {}) => ({ body: { tag_name: tag, draft: false, ...extra } });
const commit = (sha = SHA) => ({ body: sha });

test('resolveRelease with no tag resolves the latest stable release and its commit SHA', async () => {
  const { fetch, calls } = stubFetch({
    [`${API}/repos/zacbraddy/ang/releases/latest`]: release('v1.1.0'),
    [`${API}/repos/zacbraddy/ang/commits/v1.1.0`]: commit(),
  });
  assert.deepEqual(await resolveRelease(fetch, undefined, API), { ref: 'v1.1.0', sha: SHA });
  assert.equal(calls[1].accept, 'application/vnd.github.sha');
});

test('resolveRelease with a tag resolves that published release', async () => {
  const { fetch } = stubFetch({
    [`${API}/repos/zacbraddy/ang/releases/tags/v1.0.0-rc.2`]: release('v1.0.0-rc.2', { prerelease: true }),
    [`${API}/repos/zacbraddy/ang/commits/v1.0.0-rc.2`]: commit(`${SHA}\n`),
  });
  assert.deepEqual(await resolveRelease(fetch, 'v1.0.0-rc.2', API), { ref: 'v1.0.0-rc.2', sha: SHA });
});

test('resolveRelease with no tag and no stable release says to name a tag', async () => {
  const { fetch } = stubFetch({});
  await assert.rejects(resolveRelease(fetch, undefined, API), /no stable Ang release yet[\s\S]*\/upgrade-ang v1\.0\.0-rc\.2/);
});

test('resolveRelease rejects a missing or draft tag as not a published release', async () => {
  const draft = stubFetch({ [`${API}/repos/zacbraddy/ang/releases/tags/v9.0.0`]: release('v9.0.0', { draft: true }) });
  await assert.rejects(resolveRelease(draft.fetch, 'v9.0.0', API), /v9\.0\.0 isn't a published Ang release/);
  await assert.rejects(resolveRelease(stubFetch({}).fetch, 'v9.9.9', API), /v9\.9\.9 isn't a published Ang release/);
});

test('resolveRelease names an exhausted rate limit', async () => {
  const limited = { status: 403, body: '{}', headers: { 'x-ratelimit-remaining': '0' } };
  const { fetch } = stubFetch({ [`${API}/repos/zacbraddy/ang/releases/latest`]: limited });
  await assert.rejects(resolveRelease(fetch, undefined, API), /rate limit[\s\S]*Wait for it to reset/);
});

test('resolveRelease names a network error with its code', async () => {
  const { fetch } = stubFetch({}, { throws: 'ENOTFOUND' });
  await assert.rejects(resolveRelease(fetch, 'v1.0.0', API), /Couldn't reach GitHub to look up v1\.0\.0: a network problem \(ENOTFOUND\)[\s\S]*proxy or VPN/);
});

test('resolveRelease names any other non-OK answer with its status', async () => {
  const { fetch } = stubFetch({ [`${API}/repos/zacbraddy/ang/releases/latest`]: { status: 502, body: 'bad gateway' } });
  await assert.rejects(resolveRelease(fetch, undefined, API), /GitHub answered 502 while looking up the latest release[\s\S]*githubstatus/);
});

test('resolveRelease rejects a commit lookup that is not a 40-hex SHA', async () => {
  const { fetch } = stubFetch({
    [`${API}/repos/zacbraddy/ang/releases/tags/v1.0.0`]: release('v1.0.0'),
    [`${API}/repos/zacbraddy/ang/commits/v1.0.0`]: commit('nope'),
  });
  await assert.rejects(resolveRelease(fetch, 'v1.0.0', API), /didn't return a commit SHA for v1\.0\.0/);
});
