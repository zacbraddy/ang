---
title: Documentation epic C4 level 4, code
shortDescription: Every file the epic adds or changes, with its responsibility, the content page slugs per sidebar group and the README's sections
tags: [documentation, repo-structure]
---
# C4 level 4: code

## Summary
A table of files rather than a class diagram: the only code is config, one CSS file and a 6-line footer. Content pages live in one folder per sidebar group, and the sidebar autogenerates from those folders, so adding a page needs no config edit. Slugs are set here so the content stories can link to each other before every page exists. Pages link with relative routes (`../../commands/funnel/`), never `/ang/…` (k18).

## Files
| Path | State | Responsibility |
|---|---|---|
| `README.md` | changed | Whistle-stop tour, sections below |
| `docs/package.json`, `docs/package-lock.json` | new | Exact pins: `astro`, `@astrojs/starlight`, `astro-mermaid`, `starlight-llms-txt`, `@fontsource/geist`, `@fontsource/geist-mono`. Scripts: `build`, `dev` |
| `docs/astro.config.mjs` | new | `site: 'https://zacbraddy.github.io'`, `base: '/ang'`; integrations `[mermaid(), starlight({ plugins: [starlightLlmsTxt()], … })]`; sidebar of 5 `autogenerate` groups plus Home; `customCss`; `components.Footer` |
| `docs/src/content.config.ts` | new | The `docs` collection with Starlight's loader and schema (copied from the spike) |
| `docs/src/styles/theme.css` | new | Spike palette (d6) plus `--sl-font`, `--sl-font-mono` and Expressive Code's `--ec-*` font variables set to Geist / Geist Mono (d7); imports the Fontsource CSS |
| `docs/src/components/Footer.astro` | new | Starlight's default footer plus the attribution line (copied from the spike) |
| `docs/src/content/docs/**` | new | Pages, below |
| `docs/.gitignore` | new | `node_modules/`, `dist/`, `.astro/` |
| `.github/workflows/deploy-docs.yml` | new | The spike's `deploy.yml`: on push to `main` touching `docs/**` and on manual dispatch; `withastro/action` with `path: docs`, then `actions/deploy-pages` |

## Content pages
| Sidebar group | Folder | Slugs |
|---|---|---|
| Home | `docs/src/content/docs/` | `index.mdx` (splash template; `.mdx` for LinkCards, d8) |
| Start here | `start-here/` | `quick-start`, `alongside-your-framework`, `first-loop`, `uninstalling` |
| Concepts | `concepts/` | `funnel`, `context-library`, `evidence-standard`, `triggers`, `streams-and-mail`, `bending-ang` |
| Commands | `commands/` | `funnel`, `library-upkeep`, `setup`, `streams`, `bending` (one `##` heading per command, so each gets an anchor, d5) |
| Reference | `reference/` | `agents`, `ang-context-manager`, `config` |
| Why Ang | `why-ang/` | `first-principles`, `credits` |

Order within a group comes from each page's `sidebar.order` frontmatter. That is 20 pages in all.

## README sections
| Section | Holds |
|---|---|
| Title and one-liner | Centred title with the tagline, then what Ang is in a sentence |
| Quick start | Install one-liner, Node 26+, the WSL note (k13, k20), then `/bootstrap-repo`; `/tailor-ang` only as the way to tweak tailoring later, since bootstrap runs it |
| How it works | The funnel, the context library, starter-not-loaf, streams, and Orca as an optional integration (k3) |
| The funnel | One row per stage, told from the reader's side: stage, the question I'm asking, what I do, the command I run, what Ang gives me (d2). Execution gets a row per command |
| Bending Ang | Why bending matters, then `/raise-workflow-improvement` and `/improve-workflow` |
| So much more | The features left to the site, which Ang helps users discover as they work; leads into Docs |
| Docs | Link to `https://zacbraddy.github.io/ang/` |
| Credits and licence | Developed by Zac Braddy, sponsored by We Right Code; MIT |

## Related
- [Components](3-components.md)
- [Information architecture](../information-architecture.md)
- [README content cut](../origins/repo-readme/shaping-content/content-cut.md)
