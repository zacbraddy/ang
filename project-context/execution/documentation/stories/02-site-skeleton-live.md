---
title: Site skeleton live on GitHub Pages
shortDescription: A styled Starlight site with the splash home page, deployed by Actions and live at zacbraddy.github.io/ang/, answering u6
tags: [documentation, tech-stack, open-source]
status: draft
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

## Related
- [Plan: Approach, Risks and Test strategy](../plan.md)
- [Design direction](../design-direction.md)
- [C4 containers](../c4/2-containers.md)
