---
title: ESLint plugins for the Ang repo
shortDescription: Which ESLint presets count as sane defaults for plain Node ESM, tested against Ang's own code under a zero-warnings policy
tags: [open-source, tech-stack]
---
# ESLint plugins for the Ang repo

## Summary
The set is four packages: `@eslint/js` recommended, `eslint-plugin-n` `flat/recommended-module`, `eslint-plugin-regexp` `flat/recommended`, and `eslint-config-prettier/flat` placed last, with `globals` for Node globals. Each is widely adopted, supports ESLint 10, and found only real issues in Ang's code: none were noise. Unicorn, jsdoc, security, import and the all-in-one configs (neostandard, standard, xo) were dropped. Under the zero-warnings rule they are too noisy or too churny, or they lag ESLint 10, or they add nothing here.

## Setup
This was desk research plus a first-hand probe on 2026-11-16:
- **Probe:** ESLint 10.15.0 was installed in a scratch directory, and each candidate preset was run over Ang's 32 tracked `.mjs` files (about 2,000 lines).
- **npm data:** download counts are for the week 2026-11-09 to 2026-11-15, and versions and peer ranges come from npm registry metadata.

## Results
| Preset | Version, peer, weekly downloads | Findings on Ang | Verdict |
|---|---|---|---|
| `@eslint/js` recommended | 10.0.1, `eslint ^10`, 180M | 0 | In: the universal baseline [1,2,3] |
| `eslint-plugin-n` `flat/recommended-module` | 18.5.0 (2026-10-18), 9.9M | 5 × `import.meta.dirname` unsupported for the declared Node range, 1 × hashbang without `bin`, 3 × `no-process-exit` | In. Used by ESLint, Prettier and Inquirer.js [9,11]. Turn off `no-process-exit` (the CLI exits deliberately) and add `n/prefer-node-protocol` |
| `eslint-plugin-regexp` `flat/recommended` | 3.3.3, `>=9.38`, 4.0M | 8 errors: 2 super-linear backtracking (a ReDoS, regular-expression denial of service, risk) and 6 unused capture groups | In. Every finding was real. Used by ESLint, Prettier and Node core [8,9,10] |
| `eslint-config-prettier/flat` | 10.1.8, `>=7`, 65M | turns off `no-unexpected-multiline` | In, last in the config. Prettier's docs recommend it [6,7]. Cheap insurance, since ESLint 10 removed no formatting rules [4,5] |
| `globals` | 17.14.0, 320M | n/a | In, for `globals.node`. `node:test` needs none, because the tests import it |
| `eslint-plugin-unicorn` recommended | v80, `eslint >=10.4` | 247 errors; 61 even on `unopinionated` | Out. Prettier switches off 88 of its rules and ESLint hand-picks only 11 [8,9]. It shipped 18 majors in a year, and new majors grow the presets [13], so dependency bumps would keep breaking a zero-warnings CI |
| `eslint-plugin-jsdoc` recommended | n/a | 99 `require-jsdoc` | Out: it clashes with the engineering default of commenting only the non-obvious |
| `eslint-plugin-security` | n/a | 66 warnings, mostly false positives on file paths | Out. GitLab removed its `detect-object-injection` rule over false positives [15] |
| `eslint-plugin-import` | 2.32.0 (2025-06), peer stops at `^9` | n/a | Out: ESLint 10 support is merged but unreleased [12] |
| `eslint-plugin-import-x` | supports 10 | 0 | Out: `n/no-missing-import` already covers it, and it needs resolver setup |
| `eslint-plugin-promise` | last release 2026-04 | 0 | Out for now. Re-add it if the async code grows |
| `typescript-eslint` with `checkJs` | n/a | n/a | Out: it adds TypeScript and JSDoc types throughout |
| `neostandard`, `eslint-config-standard`, `xo` | 0.14.1 at 300k; 17.1.0 is dead (peer `^8`); `xo` bundles unicorn | n/a | Out. `neostandard` with `noStyle` reduces to this set plus promise, wrapped in a pre-1.0 package [14] |

Sketch config:
```js
import js from "@eslint/js";
import n from "eslint-plugin-n";
import regexp from "eslint-plugin-regexp";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,
  n.configs["flat/recommended-module"],
  regexp.configs["flat/recommended"],
  {
    languageOptions: { globals: globals.node },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      "n/no-process-exit": "off",
      "n/prefer-node-protocol": "error",
    },
  },
  prettier,
]);
```

## Unknown unknowns
- **`n` reads the root `package.json`** to work out which Node features are allowed (from its `engines` field). That makes the private dev-only root package double as the statement of the Node version that installers need. [project-structure](/project-context/10k/technical/project-structure.md) says Node 21 or later, but the code uses `import.meta.dirname`, which `n` flags below Node 22.16. The minimum supported Node version needs deciding.
- **Peer ranges are mixed.** Some are open-ended (`>=9.38`), so ESLint 11 could install cleanly and still break.
- **Hashbang:** `ang-context-manager.mjs` has a shebang but there's no `bin` entry. It needs either a per-file override or a decision to drop the shebang.

## Sources
1. npm downloads API, 2026-11-09 to 2026-11-15, ET 1 (evidence tier 1: a primary source).
2. npm registry metadata (versions, peers, release dates, maintainers), fetched 2026-11-16, ET 1.
3. Local probe of each preset on Ang's code, 2026-11-16, ET 1 (first-hand).
4. ESLint v10 migration guide, https://eslint.org/docs/latest/use/migrate-to-10.0.0, 2026-02, ET 1.
5. ESLint, "Deprecation of formatting rules", https://eslint.org/blog/2023/10/deprecating-formatting-rules, 2023-10-26, ET 1.
6. Prettier, "Integrating with linters", https://prettier.io/docs/integrating-with-linters, accessed 2026-11-16, ET 1 for what it recommends. Interest: these are Prettier's own docs.
7. `eslint-config-prettier` 10.1.8 README and source, 2025-07, ET 1 for what it does.
8. prettier/prettier `eslint.config.js`, main branch, accessed 2026-11-16, ET 1.
9. eslint/eslint `packages/eslint-config-eslint` (`base.js` and `nodejs.js`), main branch, accessed 2026-11-16, ET 1.
10. nodejs/node `eslint.config.mjs`, main branch, accessed 2026-11-16, ET 1.
11. ESLint configs of commander.js, Inquirer.js, changesets, fastify and undici, main branches, accessed 2026-11-16, ET 1.
12. import-js/eslint-plugin-import PR #3230 (merged 2026-10-12) and issue #3278 (open), ET 1.
13. eslint-plugin-unicorn GitHub releases v75 to v80, 2026-09 to 2026-11, ET 1 for release cadence. Interest: its README is ET 3 at best on how noisy the plugin is.
14. neostandard README, accessed 2026-11-16, ET 1 for its contents. Interest: sponsored by Platformatic.
15. GitLab issue #351399, "Remove high-FP-rate detect-object-injection", ET 2.

## Related
- [Quality tooling](../ideas-content/quality-tooling.md): the kit decision this fills in
- [Test runner](test-runner.md): the private dev-only root `package.json`
- [Project structure](/project-context/10k/technical/project-structure.md)
