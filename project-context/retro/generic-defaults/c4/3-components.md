---
title: Generic defaults C4 level 3, components
shortDescription: Components inside ang-context-manager.mjs and the feature modules that the epic adds or changes, from paths and config merge to session hooks and validate
tags: [repo-structure, distribution]
---
# Generic defaults C4 level 3: components

## Summary
Only the script container has code-level components worth drawing; skills, rules and styles are prose. The change concentrates in `config.mjs`: a pure `mergeConfig` holds every merge rule and the `LOCAL_KEYS` filter, and a thin `loadConfig` does the IO for both files. `features.mjs` gains the pilot feature and `featureRule`, `session.mjs` uses it for both hooks, and `validate.mjs` surfaces merge warnings plus a gitignore check. The dispatcher, registry logic, items, state, tags and triggers are untouched.

## Diagram
```mermaid
C4Component
  title Generic defaults: components of ang-context-manager.mjs
  ContainerDb(angjson, "ang.json", "JSON")
  ContainerDb(localjson, "ang.local.json", "JSON")
  System_Ext(git, "Git")

  Container_Boundary(script, "ang-context-manager.mjs") {
    Component(dispatcher, "Dispatcher", "ang-context-manager.mjs", "EXISTING. Collects commands, passes merged config")
    Component(paths, "paths.mjs", "Module", "CHANGED. CONFIG_FILE at root; new LOCAL_FILE")
    Component(config, "config/config.mjs", "Module", "CHANGED. LOCAL_KEYS, pure mergeConfig, IO loadConfig, bannerLine wording")
    Component(featreg, "features.mjs", "Module", "CHANGED. Registers pilot; new featureRule")
    Component(session, "commands/session.mjs", "Module", "CHANGED. banner and subagent use featureRule; features marks local keys")
    Component(validate, "library/validate.mjs", "Module", "CHANGED. Prints merge warnings; warns if ang.local.json is not ignored")
    Component(registry, "registry.mjs", "Module", "CHANGED. Help text only")
  }

  Container_Boundary(features, "Feature modules") {
    Component(pilot, "pilot/feature.mjs", "Module", "NEW. check, on, banner, rule(value)")
    Component(intent, "intent/feature.mjs", "Module", "CHANGED. Messages name root ang.json; bootstrap default yes")
    Component(host, "host/feature.mjs", "Module", "EXISTING. Now a LOCAL_KEY, code unchanged")
    Component(streams, "streams/", "Module", "EXISTING. conventions.md reworded only")
  }

  Rel(dispatcher, config, "loadConfig()")
  Rel(dispatcher, session, "Dispatches")
  Rel(dispatcher, validate, "Dispatches library validate")
  Rel(config, paths, "CONFIG_FILE, LOCAL_FILE")
  Rel(config, angjson, "Reads")
  Rel(config, localjson, "Reads")
  Rel(config, featreg, "Defaults and checks per key")
  Rel(session, config, "loadConfig(), bannerLine()")
  Rel(session, featreg, "onFeatures, featureRule")
  Rel(validate, config, "loadConfig() errors and warnings")
  Rel(validate, git, "git check-ignore")
  Rel(featreg, pilot, "Imports")
  Rel(featreg, intent, "Imports")
  Rel(featreg, host, "Imports")
  Rel(featreg, streams, "Imports")
```

## Component changes
| Component | Status | Responsibility after the epic | Story |
|---|---|---|---|
| Dispatcher | existing | Unchanged: `loadConfig().config` now returns the merged config | none |
| `paths.mjs` | changed | Builds `CONFIG_FILE` (root `ang.json`) and `LOCAL_FILE` (root `ang.local.json`) | 1 |
| `config/config.mjs` | changed | Owns `LOCAL_KEYS` and every merge rule; the only reader of either config file | 1 |
| `features.mjs` | changed | Registers `pilot`; `featureRule` prefers a feature's `rule(value)` over its `rule.md` | 2 |
| `commands/session.mjs` | changed | `banner` and `subagent` print `featureRule` output; `features` marks `LOCAL_KEYS` as set by `/tailor-ang` so bootstrap skips them | 1, 2 |
| `library/validate.mjs` | changed | Prints `loadConfig` warnings; warns when `ang.local.json` exists and isn't ignored | 1 |
| `registry.mjs` | changed | Help text names both files | 1 |
| `pilot/feature.mjs` | new | Promoted from the [spike](../origins/generic-personal-defaults/spikes/pilot-feature/README.md) unchanged | 2 |
| `intent/feature.mjs` | changed | Path wording; `bootstrap.default` becomes `true` (d11) | 1 |
| `host/feature.mjs` | existing | Now listed in `LOCAL_KEYS`; no code change | 1 |
| `streams/` | existing | `conventions.md` wording only | 1 |

## Related
- [Containers](2-containers.md)
- [Code](4-code.md)
- [Config move blast radius](../config-move.md)
- [Pilot feature spike](../origins/generic-personal-defaults/spikes/pilot-feature/README.md)
