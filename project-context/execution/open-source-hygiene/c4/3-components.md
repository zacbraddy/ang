---
title: C4 level 3, components for open-source hygiene
shortDescription: Inside the dev toolchain, the two workflows and the contributor kit; which config owns which check, and the one test glob they all share
tags: [open-source, repo-structure, tech-stack]
---
# C4 level 3: components for open-source hygiene

## Summary
Three containers have parts worth drawing: the **dev toolchain**, the **workflows** and the **contributor kit**. In the toolchain, `package.json` scripts are the only entry points. The hook, `ci.yml` and `release.yml` all call them and never call ESLint, Prettier or `node --test` directly, so the test globs and tool flags live in one file. ESLint and Prettier share one **ignore set**, so both tools see the same files. In the kit, the **issue chooser** sends chat to Discussions, so Discussions must be on before it lands (story 4 before story 5). The shipped containers change in content only, so they are not broken down here.

Status labels are those in [context](1-context.md).

## Diagram
```mermaid
C4Component
  title Open-source hygiene: components
  Person(zac, "Zac as maintainer")
  Person(contrib, "Contributor")
  System_Ext(gh, "GitHub")

  Container_Boundary(toolchain, "Dev toolchain [new]") {
    Component(npmscripts, "npm scripts", "package.json", "test, lint, format, format:check, prepare")
    Component(eslintcfg, "ESLint config", "eslint.config.mjs", "@eslint/js, n, regexp, stylistic padding, prettier-compat; zero warnings")
    Component(prettiercfg, "Prettier config", ".prettierrc.json", "Semicolons and trailing commas explicit; JS, JSON, YAML")
    Component(ignores, "Shared ignore set", ".prettierignore + ESLint ignores", "docs/, project-context/, releases/, root .claude/, markdown")
    Component(lintstaged, "lint-staged config", "package.json", "eslint --fix and prettier --write per staged glob")
    Component(husky, "Husky hook", ".husky/pre-commit", "Runs lint-staged")
    Component(nodever, "Node version", ".node-version + engines", "26, bumped each October")
  }

  Container_Boundary(workflows, "Workflows") {
    Component(cijob, "ci.yml check job [new]", "GitHub Actions", "checkout, setup-node, npm ci, lint, format:check, test")
    Component(reltest, "release.yml test step [changed]", "GitHub Actions", "setup-node from .node-version, npm test")
  }

  Container_Boundary(kit, "Contributor kit [new]") {
    Component(contributing, "CONTRIBUTING.md", "Markdown", "About 10 lines; points to the templates")
    Component(coc, "CODE_OF_CONDUCT.md", "Markdown", "About 3 lines, Ang's voice")
    Component(prtpl, "PR template", ".github/PULL_REQUEST_TEMPLATE.md", "How does this serve every Ang user?")
    Component(issuetpl, "Issue templates", ".github/ISSUE_TEMPLATE/*.md", "Open conversation first, then feature request")
    Component(chooser, "Issue chooser", ".github/ISSUE_TEMPLATE/config.yml", "Blank issues off; contact link to Discussions")
  }

  Rel(zac, husky, "git commit")
  Rel(husky, lintstaged, "Runs")
  Rel(lintstaged, eslintcfg, "eslint --fix")
  Rel(lintstaged, prettiercfg, "prettier --write")
  Rel(npmscripts, eslintcfg, "lint")
  Rel(npmscripts, prettiercfg, "format, format:check")
  Rel(eslintcfg, ignores, "Uses")
  Rel(prettiercfg, ignores, "Uses")
  Rel(gh, cijob, "push to main, pull_request")
  Rel(gh, reltest, "v* tag")
  Rel(cijob, nodever, "node-version-file")
  Rel(reltest, nodever, "node-version-file")
  Rel(cijob, npmscripts, "lint, format:check, test")
  Rel(reltest, npmscripts, "test")
  Rel(contrib, contributing, "Reads")
  Rel(contributing, prtpl, "Explains")
  Rel(contributing, issuetpl, "Explains")
  Rel(gh, chooser, "New issue page")
  Rel(chooser, issuetpl, "Offers")
```

## Components
| Component | Status | Responsibility | Decisions |
|---|---|---|---|
| npm scripts | new | The single home for every check command and the test globs | d8, k3, k13 |
| ESLint config | new | d9's set, `globals.node`, `reportUnusedDisableDirectives: "error"`, `n/no-process-exit` off, `n/prefer-node-protocol` on, d9's readability rules | d1, d9 |
| Prettier config | new | Defaults plus `semi: true` and `trailingComma: "all"` written out | d3, d17 |
| Shared ignore set | new | One list, applied to both tools. Root `.claude/` is ignored because it symlinks into `src/.claude` and would be linted twice | d1, k13 |
| lint-staged and Husky | new | Auto-fix on commit; `prepare` installs the hook on `npm ci` or `npm install` | d1 |
| Node version | new | `.node-version` and `engines` move together; both workflows read the file | d11, d20 |
| `ci.yml` check job | new | Advisory. No required checks, no branch protection | k13, d18 |
| `release.yml` test step | changed | Two one-line swaps; every other step unchanged | d13, d16, d20 |
| CONTRIBUTING, code of conduct | new | Short and in Ang's voice; Zac signs off the wording | d4, d6 |
| PR and issue templates | new | Rubber-ducking nudges toward [first principles](/project-context/10k/product/first-principles.md), not gates | d12 |
| Issue chooser | new | Needs Discussions on (story 4) for its contact link | k14 |

## Related
- [Containers](2-containers.md)
- [Code](4-code.md)
- [What the templates are for](../origins/open-source-hygiene/shaping-content/pr-template-purpose.md)
- [ESLint plugins](../origins/open-source-hygiene/shaping-content/eslint-plugins.md)
