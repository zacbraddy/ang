---
title: Docs site visual bake-off
shortDescription: The same 3 pages built in each docs-site candidate for Zac to judge by eye, with setup, measurements and his verdict per candidate
tags: [documentation, tech-stack]
---
# Docs site visual bake-off

## Summary
Each candidate gets the same 3 pages in its own session, light and dark, so Zac can judge the looks side by side. Done so far: **Just the Docs** (2026-11-17). Zac's view: "a reasonable first outing", with some clunky design edges he'd clean up during the build. He'll compare properly once the whole field is built. Still to build: a native Pages bundled theme, Starlight and VitePress. The spike also disproved a research claim: Just the Docs *can* follow the system's dark-mode setting with no JavaScript and no flicker.

## Method
- **Shared pages** live in [`spikes/_content/`](../spikes/_content/). Each candidate copies them and only adds its own front matter and link fixes, so the words stay the same everywhere:
  - **Home**: pitch, a "what you get" table, an install snippet and a note callout.
  - **First principles**: long prose with headings, quotes and a table, trimmed from the brain dump.
  - **Commands**: wide tables, a definition list and code blocks.
- **Attribution** goes in each framework's own footer, not in the page content.
- **Library frontmatter:** `library validate` scans spike folders too, so the pages carry `title`, `shortDescription` and `tags` (frameworks ignore what they don't use), and link to each other with `.md`. Each spike also deletes its dependency folders (`vendor/`, `node_modules/`) after building, because the validator would otherwise walk into them.
- **Judging:** Zac looks over the running site and gives his view in his own words. He turned down 1–5 scores per criterion, preferring to compare the whole field at the end.
- **Measured per candidate:** whether the build works, how long it takes, lines of config and custom code, how system light/dark is handled, and screenshots in light and dark at 1440px and 390px wide.
- **Tools:** [`spikes/_tools/shoot.mjs`](../spikes/_tools/shoot.mjs) takes the screenshots. Run it through `mcr.microsoft.com/playwright:v1.55.0-noble` in Docker, because Playwright's Chromium can't run on the host (system libraries are missing). Serve each built site with `python3 -m http.server`.

## Just the Docs on the built-in Pages build (2026-11-17)
Spike: [`spikes/just-the-docs/`](../spikes/just-the-docs/README.md).

| Measure | Result (ET 1, spike) |
|---|---|
| Build | Worked first time with `github-pages` gem v233 (Jekyll 3.10) and `remote_theme: just-the-docs/just-the-docs@v0.12.0` in `ruby:3.3` Docker. About 52s cold including the image pull; 4.5s per rebuild after that |
| Config and custom code | 32 lines: an 11-line `_config.yml`, a 3-line `Gemfile`, an 8-line `head_custom.html` and a 10-line `header_custom.html` |
| Follows the system light/dark setting | Not out of the box. A second `<link>` to the theme's own `just-the-docs-dark.css` with `media="(prefers-color-scheme: dark)"` does it with **no JavaScript and no flicker** |
| Toggle | About 15 lines of JavaScript that flip that link's `media` and save the choice in the browser's local storage. It's applied in `<head>` before the page draws, so there's no flash |
| Sidebar and search | Built in; search uses lunr |
| Phone width | Hamburger nav; wide tables and code blocks scroll sideways inside their own box |
| Rough edges seen | The toggle button looks clunky in dark mode (heavy border, default button style); the definition list renders oddly right-aligned; "This site uses Just the Docs" sits under the sidebar by default |

**Zac's verdict (ET 1):** "Seems like a reasonable first outing." Some of the design is a little clunky, and he'd clean that up during the build, but on the whole it's what he'd expect from a docs site. More to say once he has the rest of the field to compare it with.

## Unknown unknowns
- The spike sites are served from the root with no base path. At `zacbraddy.github.io/ang/`, each candidate also needs its base path set (u7).
- The Home page's install snippet is a placeholder until the [install, uninstall and update idea](/project-context/ideas/install-uninstall-update/README.md) settles how Ang is installed.

## Related
- [Hub](../README.md)
- [Hosting](hosting.md)
- [Framework landscape](../ideas-content/framework-landscape.md)
