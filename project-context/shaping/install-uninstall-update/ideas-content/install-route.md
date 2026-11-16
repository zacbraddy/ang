---
title: Install route landscape
shortDescription: Plugin marketplace versus copy-in tools versus copy-in with managed updates, weighed against users owning and editing their copy of Ang
tags: [distribution, open-source]
---
# Install route landscape

## Summary
Researched on 2026-11-16. A Claude Code plugin is a poor fit for Ang as it stands:
- Plugins can't ship rules or permissions.
- Edits to an installed plugin are wiped on update.
- Plugin skills get namespaced as `/ang:*`.
- A plugin can't seed `project-context/` without a hook.

Copy-in fits "users own and edit their copy". Its cost is the update story, which every copy-in framework has had to solve by detecting local edits (spec-kit, `npx skills`). Candidates for shaping are below.

## Plugins
- **What a plugin can ship:** skills, agents, hooks, MCP servers, output styles (namespaced `<plugin>:<name>`), `bin/` executables and `userConfig` (ET 1) [1][2].
- **No rules or always-on instructions.** A plugin's `CLAUDE.md` isn't loaded, and the docs say to "put them in a skill" (ET 1) [1][2].
  - The request to add plugin rules (#14200) has been open since 2025-12-16, with 114 upvotes [5].
  - Anthropic staff: "There's no plugin-level `rules/` directory yet" (ET 1) [6].
  - The users' workaround is a SessionStart hook that copies rules into `.claude/rules` (ET 1) [5][7].
- **No permissions.** Plugin `settings.json` honours only `agent` and `subagentStatusLine` (ET 2) [8]. The request to let plugins ship permissions was closed as not planned on 2026-07-10 (ET 1) [9].
- **Script paths would change.** Hooks reach plugin scripts through `${CLAUDE_PLUGIN_ROOT}` (ET 1) [1]. That variable isn't set in the Bash tool, so every skill that runs `node .claude/scripts/ang-context-manager.mjs` would need rewriting (ET 1) [1].
- **Edits don't survive updates.** Installed plugins live in `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`, and each version is a fresh copy (ET 1) [3]. A user: edits "are silently overwritten… no diff, no merge step, and no warning". Their request for an override layer was closed as not planned on 2026-06-01 (ET 1) [10].
- **No eject.** There is no official command that copies a plugin into the project (ET 1, the docs are silent) [3][4].
- **Project skills can't override plugin skills.** A project skill with the same name as a plugin skill loads alongside it, and `skillOverrides` doesn't apply to plugin skills (ET 1) [11][12].
- **Plugins that load in place, and their limits:**
  - A plugin folder committed under `.claude/skills/` loads in place, as can a local-path marketplace. Either way, edits take effect at the next session start (ET 1) [3][11].
  - It still can't carry rules or permissions, and it needs the workspace trust dialog.
  - In the desktop app it loads from the main checkout, not a worktree (ET 1) [3], which clashes with Ang's streams.
- **Update and uninstall come built in:** `claude plugin update` and `claude plugin uninstall`, with auto-update off by default for third-party marketplaces (ET 1) [1][3][4]. Pinning a `version` freezes users until the string changes (ET 1) [3].
- **Project scope only enables a plugin.** Each collaborator still installs it once per clone (ET 1) [4].
- **Cloud sessions** don't load user-installed plugins (ET 1) [3][4]. Copied-in files work there.

## Copy-in tools
- **degit** was revived: v3.6 to v3.10.1 shipped Jul–Oct 2026 with a new co-maintainer. It copies a subfolder (`user/repo/src`) and has no update story (ET 1) [14].
- **giget** (unjs) is active (v3.3.1, 2026-07). **tiged** was last pushed in 2026-06 (ET 1) [14].
- **copier** is active (v9.19.1, 2026-10). `copier update` replays the user's diff onto the new template and leaves conflict markers or `.rej` files. It needs Python, git tags and a git-tracked destination (ET 1) [15]. **cruft** has been dormant since 2024-12 (ET 1) [14].
- **Skill installers with lock files:** `gh skill` (GitHub CLI 2.90+, preview since 2026-04) and `npx skills` (Vercel). `npx skills` keeps a content hash, so it can tell when local files have changed. Both handle skills only, not hooks, settings or arbitrary folders (ET 1) [16][17].
- **shadcn** follows a "you own the code" model: `add --diff` previews upstream changes and `--overwrite` replaces local edits, so merging is manual (ET 2/3) [18].
- **Keeping `*.local.*` files out of a release:** a tarball or clone of a git ref contains only committed files, so gitignored files can't ship (ET 1, how git works). `git archive` honours `export-ignore` (ET 1) [19]. Whether GitHub's generated tarballs do is **unverified**.

## How comparable frameworks distribute
| Framework | Route | How edits and updates coexist |
|---|---|---|
| spec-kit | `specify init` / `integration upgrade` | Now keeps a hash manifest and refuses to overwrite locally modified files without `--force` (ET 1 mechanics, own docs) [20]. It got there after users reported customisations overwritten on re-init (2026-01, 2026-08) (ET 1) [21][22] |
| BMAD | `npx bmad-method install` | Users don't edit installed files; overrides go in `_bmad/custom/` (ET 1 that it exists, ET 3 that it works smoothly) [23]. The v4 installer kept `.bak` backups instead (ET 2) [24] |
| obra/superpowers | Plugin on the official marketplace | Customised through CLAUDE.md instructions, not edits. A user: "Forking them means syncing when Superpowers is updated" (ET 1) [25] |
| wshobson/agents | Marketplace, plus `gh skill` and `npx skills` | Skills only (ET 1) [26] |
| Agent OS v3 | Shell `project-install.sh` from a base install | A sync script pushes project changes back to the base (ET 1) [27] |
| claude-code-spec-workflow | `npx … --force` overwrites | Now in "limited updates" mode, last pushed 2025-09 (ET 1) [26] |

## Disconfirming evidence
- **Plugins bend further than they first seem:**
  - `userConfig` values substitute into skill and agent content.
  - A local-path marketplace or committed plugin folder can be edited in place [1][3].
  - Superpowers shows that CLAUDE.md-level overrides satisfy many users [25].
  
  None of these restores rules, permissions or edit-and-update.
- **Copy-in drifts at scale:** "a wording change to three rules took four PRs plus a sweep across every managed repo" (ET 1, a user copying rules into many repos) [5]. Copy-in projects left without updates stagnate [26]. Ang's intent expects little upstream change, so this costs less here than for a busy framework, but that is reasoning, not evidence.

## Candidate approaches for shaping
1. **Plain copy-in** (`npx degit zacbraddy/ang/src`, `giget`, or a short curl|sh around the tarball of a tag). Zero upkeep, users fully own the files, and `*.local.*` files are excluded by construction. Updates are manual.
2. **Copy-in plus a hash manifest in `ang-context-manager.mjs`.** An update overwrites only files still identical to what was installed and reports the rest (the spec-kit / `npx skills` pattern). It respects edits and adds no dependency, but it's code to build and keep.
3. **A copier template.** Three-way-merge updates come for free, but users need Python and copier, and conflict markers land in prompt Markdown.
4. **A plugin from a GitHub marketplace.** Install, update and uninstall come built in, but rules, permissions and edit-in-place are lost, and `project-context/` still needs seeding. It could be revisited if plugin rules land (#14200).

Option 1 matches the delivery intent most closely ("build the least", no maintainer). Option 2 is the natural upgrade if u4 (update) turns out to be worth having.

## Unknown unknowns
- **Plugin rules may land** (Anthropic says "yet") [6]. That would weaken the case against option 4.
- **Subagents reportedly don't inherit `.claude/rules`** (ET 2, **unverified**) [28]. If that's true it affects Ang under any route, not just this item.
- **Managed settings** can block skills-directory plugins and non-allowlisted marketplaces (ET 1) [3]. Copy-in avoids this.
- **GitHub tarballs and `export-ignore`:** whether GitHub's tarballs honour it needs a quick empirical test.

## Sources
1. Plugin manifest reference: https://code.claude.com/docs/en/plugins-reference. Fetched 2026-11-16. ET 1 (Anthropic, author of the product)
2. Add components to a plugin: https://code.claude.com/docs/en/plugins/components.md. Fetched 2026-11-16. ET 1
3. Plugin loading reference: https://code.claude.com/docs/en/plugins/loading.md. Fetched 2026-11-16. ET 1
4. Install and manage plugins: https://code.claude.com/docs/en/plugins/install.md. Fetched 2026-11-16. ET 1
5. anthropics/claude-code #14200 "Add rules support to Plugins": https://github.com/anthropics/claude-code/issues/14200. 2025-12-16, open. ET 1 (users)
6. anthropics/claude-code #72687, comment by Anthropic staff: https://github.com/anthropics/claude-code/issues/72687. 2026-07/08. ET 1
7. anthropics/claude-code #72650: https://github.com/anthropics/claude-code/issues/72650. 2026-07-01. ET 1 (user)
8. Third-party guide quoting plugin `settings.json` keys: https://agentpatterns.ai/tools/claude/plugin-main-agent-override-and-path-injection/. Undated. ET 2
9. anthropics/claude-code #65513: https://github.com/anthropics/claude-code/issues/65513. 2026-06-04, closed not planned. ET 1
10. anthropics/claude-code #55083 "Plugin user override layer": https://github.com/anthropics/claude-code/issues/55083. 2026-04-30, closed not planned. ET 1 (user)
11. Skills docs: https://code.claude.com/docs/en/skills.md. Fetched 2026-11-16. ET 1
12. anthropics/claude-code #56513: https://github.com/anthropics/claude-code/issues/56513. 2026-05-06. ET 1 (single user)
13. anthropics/claude-code #36569: https://github.com/anthropics/claude-code/issues/36569. 2026. ET 1 (single user; stale cached plugin versions)
14. npm and GitHub metadata for degit, tiged, giget, copier and cruft. Checked 2026-11-16. ET 1
15. Copier, "Updating a project": https://copier.readthedocs.io/en/stable/updating/. Undated. ET 1
16. GitHub changelog, `gh skill`: https://github.blog/changelog/2026-04-17-manage-agent-skills-with-github-cli/. 2026-04-17. ET 1 (vendor; ET 3 on ease)
17. vercel-labs/skills README: https://github.com/vercel-labs/skills. Checked 2026-11-16. ET 1 (vendor)
18. shadcn update guides: https://vercel.com/academy/shadcn-ui/updating-and-maintaining-components.md and https://21st.dev/blog/keeping-copied-components-updated. Undated. ET 2/3
19. git-archive docs: https://git-scm.com/docs/git-archive. ET 1
20. Spec Kit upgrade guide: https://github.github.com/spec-kit/upgrade.html. Undated. ET 1 mechanics, ET 3 smoothness (own docs)
21. github/spec-kit #1541 and #3990: https://github.com/github/spec-kit/issues/1541 and https://github.com/github/spec-kit/issues/3990. 2026-01-31 and 2026-08-05. ET 1 (users)
22. github/spec-kit Discussion #168: https://github.com/github/spec-kit/discussions/168. Undated. ET 1 (users, read through search snippets)
23. BMad, "Customize BMad": https://docs.bmad-method.org/customize/customize-bmad/. Undated. ET 1 mechanics, ET 3 ease (own docs)
24. BMAD v4 README (mirror): https://git.biohazardvfx.com/Nicholai/BMAD-METHOD. 2025. ET 2
25. obra/superpowers #581 and #2280: https://github.com/obra/superpowers/issues/581 and https://github.com/obra/superpowers/issues/2280. 2026-02 and 2026-09. ET 1 (maintainer and users; the maintainer has an interest in "no config needed")
26. READMEs of wshobson/agents, SuperClaude_Framework and claude-code-spec-workflow. Checked 2026-11-16. ET 1 (own READMEs)
27. buildermethods/agent-os CHANGELOG and scripts: https://github.com/buildermethods/agent-os. v3 dated 2026-01-20. ET 1 (own; ET 3 on "simpler")
28. "Subagents don't inherit .claude/rules" (#61467 mirror): https://claudeissues.com/issue/61467. 2026. ET 2 (mirror of a user report)

## Related
- [Brief](brief.md)
- [Hub](../README.md)
- [ADR 0002: zero-dependency library script](/project-context/10k/technical/adrs/0002-zero-dependency-library-script.md)
- [Delivery intent](/project-context/10k/intent.md)
