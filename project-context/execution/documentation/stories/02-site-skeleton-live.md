---
title: Site skeleton live on GitHub Pages
shortDescription: A styled Starlight site with the splash home page, deployed by Actions and live at zacbraddy.github.io/ang/, answering u6
tags: [documentation, tech-stack, open-source]
status: done
owner: both
dependsOn: []
---
# Site skeleton live on GitHub Pages

## Summary
The walking skeleton (plan Sequencing step 2). It carries the epic's main risk, u6 (unknown 6: whether the deploy and the `llms.txt` links respect the `/ang/` base), so no content page is written until the empty site is live at the real address.

## Outcome
`docs/` builds with the current Starlight (0.43.x) and Astro 7. It has the palette (d6), Geist fonts (d7), the attribution footer, Mermaid (d9), llms.txt output (d10) and the splash home page (d8). `deploy-docs.yml` publishes it to `https://zacbraddy.github.io/ang/`. The smoke check passes: the home page, search, the light/dark switch, `/ang/llms.txt`, and every link in it resolving. Zac sets the repo's Pages source to GitHub Actions.

## Rough scope
- Every file in [C4 code: Files](../c4/4-code.md#files) except `README.md` and the content pages; components and integration order per [C4 components](../c4/3-components.md).
- Start from the [Starlight spike](../origins/docs-website/spikes/starlight/README.md). Keep `theme.css` and `Footer.astro`; drop the link-rewriting remark plugin, `@astrojs/markdown-remark` and `remark-definition-list` (plan Approach).
- The sidebar has 5 `autogenerate` groups, so the content stories need no config edits.
- If the llms.txt links lack `/ang/`, bring Zac the choice between a post-build rewrite and dropping the plugin (u6 approach).
- Write candidate ADRs (architecture decision records) 1–4 from the plan. ADR 1 notes that it should land as one amendment with open-source-hygiene d8.
- Answer u6 in `state.json` with what the first deploy showed.

## Done when
- `npm run build` in `docs/` passes clean, and the deploy run on `stream/documentation` is green in Actions.
- Zac has walked the smoke check on `https://zacbraddy.github.io/ang/` and signed it off: the home page, search, the light/dark switch, `/ang/llms.txt`, and every link in it resolving.
- u6 is answered in `state.json` with what the deploy showed.
- ADR 0002 is rewritten and ADRs 0005–0007 exist.
- Before the story is committed, the temporary `stream/documentation` trigger is gone from `deploy-docs.yml`, and Zac has removed the branch from the `github-pages` environment's allowed branches.

## Acceptance criteria
- Given a push to `stream/documentation` touching `docs/**`, when the temporary trigger is in place, then the build job runs `astro build` and the deploy job publishes to `https://zacbraddy.github.io/ang/`.
- Given a failing `astro build`, when the workflow runs, then the deploy job doesn't run and the live site stays as it was.
- Given a visitor at `/ang/`, when the page loads, then they see the splash hero (title, tagline, 2 buttons), the curl one-liner in a terminal block, a short paragraph and LinkCards to Start here, Concepts and Commands (d8), all in the jade palette and Geist (d6, d7).
- Given the system theme is light or dark, when a visitor opens the site, then it follows it, and the theme switch flips it.
- Given a visitor opens search, when they type a word from the home page, then the home page is a hit and its link carries `/ang/`.
- Given an agent fetches `/ang/llms.txt`, when it follows its 2 links (`https://zacbraddy.github.io/ang/llms-small.txt` and `…/llms-full.txt`), then both resolve (d10).
- Given any page, when it renders, then the footer carries the attribution line linking Zac Braddy to https://zackerthehacker.com.
- Given a Mermaid fence in a page, when the site builds, then it renders as a diagram (d9). Check it with a throwaway fence on the home page, then delete it.
- Given the 5 group folders have no pages yet, when the site builds, then it passes and the sidebar shows Home plus 5 empty group headings, which fill as stories 03–09 add pages with no config edits.
- Given the story is committed, when `deploy-docs.yml` is read, then it triggers only on push to `main` touching `docs/**` and on `workflow_dispatch`.

## Test plan
No unit or integration tests: the only code is config, CSS and a footer (plan Test strategy, `engineering-defaults.md`).
- **Build gate:** `npm run build` locally, then `astro build` in the workflow.
- **Local check under the base:** `npm run preview` serves `dist/` under `/ang/`. Run the smoke check there first, then on the live site.
- **Screenshots:** take light and dark shots of the home page with [`shoot.mjs`](../origins/docs-website/spikes/_tools/shoot.mjs) for review. Re-check light-mode accent contrast only if a tint changed (plan Risks).
- **Live smoke check:** Zac, per the Guide below.
- **Won't test:** the plugins' own behaviour beyond the smoke check, the font files, and the GitHub actions themselves. There is no link-checker plugin (`starlight-links-validator` breaks on Astro 7).

## Implementation notes
- **Files:** every row of [C4 code: Files](../c4/4-code.md#files) except `README.md`. The only page is `docs/src/content/docs/index.mdx`. Build them in the integration order in [C4 components](../c4/3-components.md).
- **From the spike** ([`site/`](../origins/docs-website/spikes/starlight/README.md)):
  - Copy `content.config.ts`, `theme.css` and `Footer.astro`. Then add the d7 font variables and Fontsource imports to `theme.css`.
  - Keep `theme.css`'s colour values. d6's dark "accent" `#1fd8a4` is the spike's `accent-high`, the one Starlight uses for links in dark mode, so the spike already matches.
  - Keep `astro.config.mjs`'s title, description and GitHub social link. Drop `mdLinksToRoutes`, `remark-definition-list` and `@astrojs/markdown-remark`.
  - Don't copy `StageCard.astro` or the 3 sample pages.
  - Copy `deploy.yml` to `.github/workflows/deploy-docs.yml` without its line 1 comment.
- **Versions:** pin exactly, with no `^` or `~`. Use the newest Starlight 0.43.x, the Astro 7.x it peers, `starlight-llms-txt` 0.12.x, astro-mermaid 2.x (plus the `mermaid` peer it needs) and current Fontsource Geist. Commit `package-lock.json`.
- **Sidebar:** Home (`link: '/'`) plus 5 groups shaped `{ label, items: [{ autogenerate: { directory } }] }`. A bare `{ label, autogenerate }` group was removed in Starlight 0.39 and fails the build. The groups are Start here `start-here`, Concepts `concepts`, Commands `commands`, Reference `reference`, Why Ang `why-ang`. The folders can stay empty: checked on 2026-11-18 against a copy of the spike, an empty directory builds clean and renders an empty group heading.
- **Home page:** `template: splash` frontmatter with `hero` (title, tagline, actions). Starlight's built-in `Card`/`LinkCard` go below, with no Hero override (d8, [design direction](../design-direction.md)).
  - The buttons and cards point at pages that don't exist yet (`start-here/quick-start/` and the group pages). Use relative routes. They 404 until stories 03–07, which is expected.
  - Copy the install line from the README, which matches `install.sh`.
  - The voice follows [voice lessons](../voice-lessons.md).
- **Temporary trigger:** add `stream/documentation` to `on.push.branches` for this story only. Remove it before the story is handed over for commit.
  - From then on, the content stories check with `npm run dev` / `npm run preview` locally.
  - The site goes live again only when the epic merges to `main`.
- **ADRs** (`10k/technical/adrs/`, README ADR format, Standing dated today):
  - Plan candidate 1 rewrites ADR 0002 rather than adding an ADR. It narrows the zero-dependency rule to what ships under `src/`, and names root `docs/` as dev-only with its own lockfile.
    - Word it so open-source-hygiene d8's dev-only root `package.json` fits the same rule. That way the two land as one amendment, and that epic only updates Standing.
    - Update its Standing line "The repo has no package.json".
  - Candidates 2–4 become `0005-docs-starlight-on-github-pages.md`, `0006-docs-describe-shipped-files.md` and `0007-docs-publish-llms-txt.md`.
- **llms.txt:** checked on 2026-11-18 against a copy of the spike with `starlight-llms-txt` 0.12. The plugin builds its links from `site` + `base`, so `llms.txt` lists `https://zacbraddy.github.io/ang/llms-small.txt` and `…/llms-full.txt`. Page-body links inside those files keep the page's relative routes as written. That's the plugin's default, and it stays (d10).
- **u6:** what's left of it is the deploy half (Actions plus Pages publishing at `/ang/`). Answer it with `ang-context-manager.mjs state answer documentation u6 "<fact>" "<source>"`, with the Actions run URL as the source.
- **As built (2026-11-18):**
  - Pins: Starlight 0.43.1, Astro 7.4.12, `starlight-llms-txt` 0.12.0, `astro-mermaid` 2.2.0, `mermaid` 12.3.0, `@fontsource/geist` and `@fontsource/geist-mono` 5.3.0.
  - `docs/package.json` also has a `preview` script, which the test plan's local check needs.
  - No `--ec-*` font variables: Starlight already points Expressive Code at `--sl-font` and `--sl-font-mono`, so setting those two puts Geist Mono in code blocks (d7 holds).
  - The footer uses the README's attribution wording, per [voice lessons](../voice-lessons.md), not the spike's.
  - The sidebar only shows on non-splash pages, so the skeleton never displays it. A throwaway page confirmed Home plus the 5 group headings, built with the group folders absent (git doesn't keep empty folders, so that's what CI builds).
  - The Mermaid check fence stays as the home page's funnel diagram, with a line of context (Zac, 2026-11-18). This story is the only one that owns the home page, so its copy is finished here.
  - The build logs Astro's chunk-size warning (Mermaid) and Starlight's empty `i18n` and missing `404` entry notices. They're defaults, not errors.
- **Out of scope:**
  - content pages (stories 03–09)
  - a custom domain
  - CI for the rest of the repo (open-source-hygiene)
  - any file under `src/`

## Guide
1. **Before the first push:** go to the repo's Settings → Pages and set Source to **GitHub Actions**.
2. Then go to Settings → Environments → `github-pages` → Deployment branches, and add `stream/documentation`. GitHub lets only the default branch deploy here out of the box.
3. When the agent says the local build and preview pass, push `stream/documentation` and watch the Deploy docs run in Actions.
4. Walk the smoke check on `https://zacbraddy.github.io/ang/`:
   - the home page in light and dark, plus the theme switch
   - search for a home page word
   - `/ang/llms.txt`, clicking every link
   - the footer attribution
   - the throwaway Mermaid diagram
5. Tell the agent what's off. Repeat 3–4 until you're happy.
6. Remove `stream/documentation` from the `github-pages` deployment branches. The agent removes the trigger from the workflow.

**The agent prepares:** the built site, light and dark screenshots, the smoke-check list above with the exact URLs, and the Actions run link.

**Recorded afterwards:**
- u6 answered with the run URL.
- The Pages source being set to GitHub Actions goes into ADR 0005's Standing. No credentials are involved.

## Review
2026-11-18, over commit 8bd7d9b plus the staged changeset. `npm run build` passes (only the known chunk-size, `i18n` and `404` notices); `llms.txt` lists both `/ang/` links; files match [C4 code: Files](../c4/4-code.md#files) and the page routes match the C4 slugs.

**Must-fix**
1. `stream/documentation` is still an allowed deployment branch on the `github-pages` environment (`gh api …/environments/github-pages/deployment-branch-policies` returns `main` and `stream/documentation`). Done-when's last bullet needs it gone before commit. Zac's action (Guide step 6). **Fixed:** policy deleted with `gh api` on Zac's go-ahead; only `main` remains.

**Should-fix**
2. ADRs cite this epic's register keys: `0005-docs-starlight-on-github-pages.md:12` (d4, k8, k18), `0006-docs-describe-shipped-files.md:9` (k5), `0007-docs-publish-llms-txt.md:12` (k22, d10). `10k/` is current truth and outlives the epic's `state.json`, so those keys dangle after `/retro`, and they're bare abbreviations. State the facts instead. **Fixed.**

**Nit**
3. [C4 code](../c4/4-code.md) lines 15 and 18 still describe the plan, not the build: `--ec-*` font variables (not needed) and scripts `build`, `dev` (now also `preview`, plus the `mermaid` pin). **Fixed.**
4. `0005-docs-starlight-on-github-pages.md:15` calls `astro-mermaid` a plugin alongside `starlight-llms-txt`; it's an Astro integration, the other is a Starlight plugin. **Fixed.**

## Related
- [Plan: Approach, Risks and Test strategy](../plan.md)
- [Design direction](../design-direction.md)
- [C4 containers](../c4/2-containers.md)
