---
title: "Spike: starlight-changelogs on Ang's docs site"
shortDescription: Built starlight-changelogs 0.7.2 into a copy of Ang's docs against the real repo on 2026-11-23; works with one npm override, empty until v1.0.0, doubled h1 from the notes, drafts break the parse
tags: [documentation, distribution, tech-stack]
---
# Spike: starlight-changelogs on Ang's docs site

## Summary
starlight-changelogs 0.7.2 works on Ang's site, with three catches. Under npm it crashes until an `overrides` entry pins a sub-dependency's Astro to Ang's own. Ang's release notes open with an h1 (top-level heading), which doubles up on the page. And a draft release in the API response fails the whole build, if the build's token can see drafts. With only RC (release candidate) pre-releases published, the page is empty until v1.0.0. Zac is fine with that. Run on 2026-11-23 against `zacbraddy/ang`'s real releases (v1.0.0-rc.1 and rc.2).

## Setup
- A copy of `docs/` with `starlight-changelogs@0.7.2` added, a `changelogs` collection using the GitHub provider (`base: 'releases'`, `pageSize: 100`, `token: process.env.GITHUB_TOKEN`) and a sidebar link via `makeChangelogsSidebarLinks`. The changed files are in [the spike folder](../spikes/starlight-changelogs/README.md).
- Built with `astro build`, using Zac's `gh` token in place of CI's `GITHUB_TOKEN` (CI: continuous integration). The token comes from an env var, which is the same shape CI would use.

## Results
| Measure | Result |
|---|---|
| Builds on Starlight 0.43.1 / Astro 7.4.12 | **Only with an npm override.** A plain `npm i` crashes at config load: `z.url is not a function`. |
| One page, newest first | Yes. `pageSize: 100` gives one list page, and rc.2 lists above rc.1. |
| Token wiring | Works from `process.env.GITHUB_TOKEN`. Not yet run in CI. |
| RC-only repo today | Builds. `/releases/` shows the title and an empty "Find a version" box, and the build logs a harmless "collection changelogs … is empty" warning. A "Releases" sidebar link appears. |
| Doubled h1 | **Yes.** With pre-releases forced through, the list page has three h1s: "Releases" plus each note's `# 🚀 Ang …` line. The notes' own `##` sections sit level with the plugin's `##` version headings. |
| Draft releases | **The build fails if the token can see a draft.** Drafts come back with `published_at: null`, and the plugin's response schema (`z.iso.datetime()`, not nullable) rejects the whole list before the draft filter runs. Reproduced against the schema directly. Ang had no draft on the day, so this wasn't seen end to end. |

### The npm crash
`@ascorbic/loader-utils@1.0.2` (the plugin's dependency, latest version) declares the peer `astro: ^4.14.0 || ^5.0.0-beta.0`. npm sees that Ang's Astro 7 doesn't satisfy it and installs a private Astro 5.18.2 under the plugin. The plugin's `astro/zod` imports then resolve to Astro 5's older zod, which crashes. The sites that run it on Astro 7 likely use pnpm, which only warns about unmet peers; this wasn't checked. The fix that worked:

```json
"overrides": { "@ascorbic/loader-utils": { "astro": "$astro" } }
```

It's one more thing to remember on upgrades, but it's inert once loader-utils widens its peer range.

### Where the doubled h1 comes from
`release.yml` titles each GitHub release with its tag (`--title "$TAG"`). The plugin uses that title as the version heading and its URL slug (`/releases/version/v1-0-0/`). The theme line (`# 🚀 Ang v1.0.0-rc.1: …`) is in the body. `process` only rewrites titles, so the plugin can't strip it. The fix belongs in the notes template (`releases/notes/README.md`): no `#` line, and sections as `###` so they nest under the version heading. How the theme line survives is a wording choice for Zac.

### Pages generated
For each release: the list page, a per-version page and a "since this version" compare page. With pre-releases forced through, two RCs made five pages. No option turns the extras off. They're harmless.

## Unknown unknowns
- Whether CI's `GITHUB_TOKEN` (`contents: read`) sees draft releases. GitHub lists drafts only to callers with push access, so it probably doesn't, but this is untested. If it does, any docs build that runs between a release's tag push and Zac publishing it fails.

## Related
- [How other docs sites build it](how-others-build-it.md)
- [Spike files](../spikes/starlight-changelogs/README.md)
- [Item hub](../README.md)
- [ADR 0007: how releases are cut](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md)
