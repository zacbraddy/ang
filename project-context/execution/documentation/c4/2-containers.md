---
title: Documentation epic C4 level 2, containers
shortDescription: The README, the docs/ Starlight project and the deploy workflow in the repo, and the static pages, search index and llms.txt files they produce
tags: [documentation, repo-structure]
---
# C4 level 2: containers

## Summary
In the repo, the epic changes `README.md` and adds two containers: the `docs/` Starlight project and the `deploy-docs.yml` workflow. The `src/` shipped files and `project-context/` are read as sources and stay unchanged. The build produces three served containers on Pages: the HTML pages, the Pagefind search index and the `llms*.txt` files. A "container" here is a separately deployed or loaded unit, matching the [10k containers](/project-context/10k/technical/architecture/2-containers.md).

## Diagram
```mermaid
C4Container
  title Documentation epic: containers
  Person(reader, "Evaluator or Ang user")
  Person_Ext(agent, "Coding agent")
  Person(zac, "Zac")
  System_Ext(npm, "npm registry")

  Container_Boundary(repo, "Ang repo [changed]") {
    Container(readme, "README.md [changed]", "Markdown", "Whistle-stop tour: 4 concepts, 13 commands, install one-liner, link to the site")
    Container(docs, "docs/ [new]", "Astro 7 + Starlight, own package.json and lockfile", "Site config, theme, footer override, about 20 content pages")
    Container(workflow, "deploy-docs.yml [new]", "GitHub Actions YAML", "Build job (withastro/action, path docs) and deploy job (deploy-pages)")
    Container(src, "src/ [existing]", "Markdown + Node ESM", "The shipped Ang; source for page claims")
    ContainerDb(library, "project-context/ [existing]", "Markdown + JSON", "10k docs read as sources for page claims")
  }

  Container_Boundary(pagesb, "GitHub Pages: zacbraddy.github.io/ang/ [new]") {
    Container(html, "Pages [new]", "Static HTML, CSS, Geist fonts", "Splash home plus the sidebar groups; light/dark follows the system")
    Container(search, "Search index [new]", "Pagefind, client-side JS", "Built by Starlight at build time")
    Container(llms, "llms.txt files [new]", "Plain text", "llms.txt, llms-full.txt, llms-small.txt from starlight-llms-txt")
  }

  Rel(zac, readme, "Edits")
  Rel(zac, docs, "Edits pages")
  Rel(docs, src, "Pages cite and are checked against")
  Rel(readme, html, "Links to")
  Rel(workflow, docs, "Builds on push to main touching docs/**")
  Rel(workflow, npm, "Installs pinned deps")
  Rel(workflow, html, "Deploys")
  Rel(workflow, search, "Deploys")
  Rel(workflow, llms, "Deploys")
  Rel(reader, readme, "Reads on GitHub")
  Rel(reader, html, "Reads, searches")
  Rel(html, search, "Queries in the browser")
  Rel(agent, llms, "Fetches")
```

## Containers
| Container | State | Notes |
|---|---|---|
| `README.md` | changed | Ships first and alone (d1). Links to the site from day one |
| `docs/` | new | Outside `src/`, so the installer never copies it. Nothing at the repo root depends on it (candidate ADR 1) |
| `deploy-docs.yml` | new | Sits beside the install epic's `release.yml` and open-source-hygiene's CI. A failed build blocks the deploy |
| `src/` | existing | Read, never edited: docs defects become recorded work (candidate ADR 3) |
| `project-context/` | existing | Read only. README badges are open-source-hygiene's to add with its CI (d12, k17) |
| Pages, search index, llms.txt files | new | All built from `docs/` in one `astro build`; u6 checks they work under the `/ang/` base |

## Related
- [Context](1-context.md)
- [Components](3-components.md)
- [10k containers](/project-context/10k/technical/architecture/2-containers.md)
