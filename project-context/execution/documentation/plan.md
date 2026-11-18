---
title: Documentation epic plan
shortDescription: Scope, approach, sequencing, risks, tests, deliverables and candidate ADRs for the README rewrite and the Starlight docs site
tags: [documentation, open-source]
---
# Plan

## Summary
The README is rewritten first and ships on its own. Then a Starlight site goes up in a root `docs/` folder, which never ships, and deploys to GitHub Pages at `zacbraddy.github.io/ang/` from one Actions workflow. Pages are written in content batches that follow the [page map](information-architecture.md). The build is the only automated gate. Accuracy against the shipped files and Zac's voice are checked in each story's review. The epic adds one folder, one workflow and no shipped files, so Ang itself gets no heavier.

## Scope
- **README** (`README.md` at the root): the 4 concepts and 13 commands in the [content cut](origins/repo-readme/shaping-content/content-cut.md), the funnel table (d2), the install one-liner with its one-line WSL (Windows Subsystem for Linux) note (k13, k20), an "and a few more" pointer, the attribution line and a link to the site.
- **Docs site** (`docs/`): Starlight with the palette (d6), Geist typefaces (d7), the splash home (d8), Mermaid diagrams (d9), llms.txt output (d10), an attribution footer and the 20 pages in the [page map](information-architecture.md).
- **Deploy**: `.github/workflows/deploy-docs.yml`, which builds `docs/` and publishes it to Pages on pushes to `main` that touch `docs/**`.

## Out of scope
- README status badges. They need the CI (continuous integration) from the open-source-hygiene epic, which adds them in the same change as that CI (k17, d12).
- CONTRIBUTING, the code of conduct and the "fork it" section. Open-source-hygiene builds them; the README links to whichever exist when it ships.
- A custom domain (k18) and a shared base `ang.json` for teams (d11). Both are parked.
- Open Graph images, image zoom, terminal recordings, versioned docs and translations. Nothing in the brief asks for them.
- Changing how Ang behaves. The docs describe the shipped files as they are. Defects found while writing become recorded work, not fixes made in this epic.

## Approach
- **Site source lives in a root `docs/`, outside `src/`**, so the installer never copies it. It has its own `package.json` and lockfile, with exact versions pinned. Nothing at the repo root depends on it.
- **Root `docs/` is the site; `src/docs/procedures/` is shipped how-tos.** Same folder name, different jobs: page sources cite `src/docs/…` by full path so the two never blur.
- **Start from the spike, not from it as-is.** Move to the current Starlight (0.43.x) and Astro 7. Keep `theme.css` (d6) and `Footer.astro`. Drop the link-rewriting remark plugin, `@astrojs/markdown-remark` and `remark-definition-list`. Pages link with relative route links (`../../concepts/funnel/` from any page in a group folder, since every page URL ends in a slash), which work under any base path, so a later custom domain needs no link sweep (k18). Callouts use Starlight's `:::note` syntax.
- **Integrations, in this order:** `astro-mermaid` before Starlight (d9), then Starlight with `starlight-llms-txt` as a plugin (d10). Fonts come from `@fontsource/geist` and `@fontsource/geist-mono` through `customCss` (d7).
- **Sources and accuracy:** each page draws from the sources in the page map. Where the brain dump and the shipped files differ, the files win (k5). The streams page summarises `src/docs/procedures/running-ang-streams-in-orca.md` and links to it on GitHub, so the steps live in one place. Node is given as 26+ (install k13), not the 21+ in `10k/technical/project-structure.md`, which lags.
- **Voice:** Zac's voice, trimmed ([voice and attribution](/project-context/10k/marketing/voice-and-attribution.md)). The brain dump is a voice sample, not a page list (k19).

## Sequencing
Each step ends with something Zac can see.
1. **README.** Ships alone (d1). It links to `https://zacbraddy.github.io/ang/` from day one: a dead link for a few days costs less than editing the README again.
2. **Site skeleton and deploy.** Config, theme, fonts, footer, Mermaid, llms.txt, the splash home page and the workflow. Zac sets the Pages source to GitHub Actions, and the first run answers u6. Nothing else is written until the empty site is live at the real address.
3. **Start here:** Quick start (with platforms and the native Windows steps checked against the shipped files at build time), Your first loop and Uninstalling.
4. **Concepts:** the 6 pages.
5. **Commands:** the 5 grouped pages.
6. **Reference and Why Ang:** Agents, `ang-context-manager.mjs`, Config, First principles and Credits.

Steps 3–6 don't depend on each other once step 2 is live, so they can run in any order or in parallel streams.

## Risks
| Risk | Effect | Mitigation |
|---|---|---|
| u6: the deploy workflow or llms.txt links don't respect the `/ang/` base | A broken site or broken agent links | Step 2 is a walking skeleton, so this surfaces before any content is written |
| Docs drift as skills change | Pages describe behaviour Ang no longer has | Pages describe what a user sees, not a skill's internal steps; one anchor per command keeps edits local (d5). The upkeep is accepted |
| Install epic changes (one-liner, platforms, root layout) land after the README | The README and Quick start go stale | Copy the install facts at write time from the install epic's shipped files; its release preflight checks the README one-liner (install d18) |
| Starlight breaks in small steps ([upkeep](origins/docs-website/shaping-content/upkeep.md)) | 1–3 forced bumps a year | Exact pins; the site is upgraded only when the build breaks or a security fix lands; no community plugins beyond the two chosen |
| Light accent sits exactly at AA (Web Content Accessibility Guidelines contrast level AA, 4.5:1) (d6) | A tweak fails contrast | Re-check contrast on any tint change |

## Test strategy
There is almost no code here, so the pyramid is nearly flat.
- **Unit:** none. The only custom code is a 6-line footer.
- **Build gate:** `astro build` runs in the deploy workflow, and a failed build blocks the deploy. Astro and Starlight already fail on broken config and invalid frontmatter.
- **Smoke check after the first deploy (u6):** the home page, one deep page, search, the light/dark switch, `/ang/llms.txt`, and that every link in llms.txt resolves.
- **Story review:** the spike's `shoot.mjs` takes light/dark and desktop/phone screenshots of each new page. The reviewer checks every claim on a page against the shipped files it cites, and checks internal links by clicking through the built site.
- **No link-checker plugin.** `starlight-links-validator` broke on the Astro 7 upgrade ([upkeep](origins/docs-website/shaping-content/upkeep.md)), and relative links plus a review click-through cover 20 pages.

## Deliverables and who does what
| Deliverable | Agent | Zac |
|---|---|---|
| README rewrite | Drafts it from the content cut | Reviews the voice; merges |
| `docs/` site and its config | Builds it | Reviews screenshots |
| `.github/workflows/deploy-docs.yml` | Writes it | Sets the repo's Pages source to GitHub Actions (one-off, in GitHub settings) |
| 20 pages | Drafts each from its sources | Reviews the voice and cuts |

Tools and services: GitHub Pages and GitHub Actions (free), Starlight, Astro, Pagefind (built in), Fontsource, `astro-mermaid` and `starlight-llms-txt`. There are no accounts to open and nothing to pay for.

## Success measures
- The site is live at `zacbraddy.github.io/ang/`, follows the system light/dark setting, and has working search.
- Every page in the page map exists.
- A reader can install Ang and run one full funnel loop from the README alone (d2).
- Every link in `/ang/llms.txt` resolves.
- No page contradicts the shipped files at the time of review.
- The epic adds no files under `src/`, and its only new workflow is `deploy-docs.yml`.

## Candidate ADRs
1. **The docs site lives in a root `docs/` with its own dependencies and never ships.** This narrows ADR 0002 (zero-dependency library script) to what ships under `src/`. Open-source-hygiene d8 plans the same change for a dev-only root `package.json`, so the two should land as one amendment.
2. **The docs are a Starlight site on GitHub Pages, deployed by Actions, at `zacbraddy.github.io/ang/`.** Pages link with relative routes so a custom domain stays a config change (d4, k8, k18).
3. **The docs describe the shipped files.** Where Zac's memory and the files differ, the files win, and docs defects become recorded work rather than changes to Ang (k5).
4. **The site publishes llms.txt, llms-full.txt and llms-small.txt** for agents (d10).

## Related
- [Hub](README.md)
- [Information architecture](information-architecture.md)
- [C4: context](c4/1-context.md), [containers](c4/2-containers.md), [components](c4/3-components.md), [code](c4/4-code.md)
- [Design direction](design-direction.md)
- [Starlight spike](origins/docs-website/spikes/starlight/README.md)
- [Delivery intent](/project-context/10k/intent.md)
- [ADR 0002: Zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
- [Open-source hygiene](/project-context/shaping/open-source-hygiene/README.md)
