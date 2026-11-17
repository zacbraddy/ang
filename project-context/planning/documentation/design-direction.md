---
title: Design direction research
shortDescription: What current dev-tool docs ship for type, spacing, imagery and home-page layout, and what Starlight gives out of the box, mapped for the docs site
tags: [documentation, brand-voice]
---
# Design direction research

## Summary
Desk research on 2026-11-17 for everything except colour, which is covered in the [colour palette research](origins/docs-website/shaping-content/colour-palette.md). Measured dev-tool docs mostly agree on 16px body text, line-height 1.5–1.75, lines of 65–80 characters and 4px-based spacing. Starlight's defaults (16px, 1.75, 45rem wide, system fonts) already sit inside that range. Typefaces don't agree at all: system stack, Inter and Geist all ship on respected sites. Home pages put the install command near the top and show the product rather than decoration. Docs-first homes have no testimonials or logo walls. "AI look" markers are mostly single-source agency opinion. The options are mapped here, not ranked.

ET (evidence tier) follows the [Evidence standard](/project-context/README.md). "Measured" means computed styles read from a long paragraph on a real docs article, using headless Chromium on Linux at 1440px wide, on 2026-11-17 (ET 1). Home pages were observed through a text-only fetch on the same day, so layout is ET 1 but the pixel-level look is approximate. Disclosure: this research was written by an Anthropic model, and Anthropic's own guidance is one of the sources.

## Typography and spacing
### What sites agree on
- **Body text is 16px.** Vercel, GitHub, Radix, Deno, Biome, Astro, Tauri and Starlight render 16px, and Bun renders 16.5px. The denser outliers are Linear and Supabase at 15px, and Stripe and Tailwind at 14px (measured, ET 1). Butterick gives 15–25px for web body text (ET 1 for his guidance).
- **Line-height is generous, 1.5 to 1.87** (measured, ET 1). WCAG (Web Content Accessibility Guidelines) SC 1.4.12, the text-spacing criterion, sets no default. It requires pages to keep working when a reader forces line-height 1.5, paragraph spacing 2×, letter spacing 0.12em and word spacing 0.16em (ET 1).
- **Lines run 65–80 characters (ch).** Measured sites range from about 65ch to 79ch (ET 1). Primer says about 80 or fewer (ET 1), and Butterick says 45–90 (ET 1).
- **Spacing steps in multiples of 4px.** Radix runs 4/8/12/16/24/32/40/48/64px, and Primer and Geist both step in 4px multiples (live CSS, ET 1).
- **The free webfonts are all OFL (SIL Open Font License) and on Fontsource,** which packages fonts for self-hosting: Geist, Geist Mono, Inter, Mona Sans, Hubot Sans, Manrope, Archivo, JetBrains Mono, Martian Mono, Source Code Pro, IBM Plex Mono and Commit Mono (Fontsource API, ET 1). Inter's variable font includes its Display cut as an optical-size axis (ET 1).

### Measured values
| Site | Body | Headings | Mono | Size / line-height | Width |
|---|---|---|---|---|---|
| Vercel docs | Geist | Geist | Geist Mono | 16 / 1.7 | ≈74ch |
| Linear docs | Inter | Inter, weight 590 | Berkeley Mono (paid) | 15 / 1.6 | ≈66ch |
| GitHub Docs | Mona Sans | Mona Sans (h1), system (h2) | Mona Sans Mono (not on Fontsource) | 16 / 1.6 | ≈74ch |
| Supabase | Inter | Manrope | Source Code Pro | 15 / 1.87 | ≈71ch |
| Tailwind | Inter | Inter | IBM Plex Mono | 14 / 2.0 | ≈67ch |
| Stripe docs | System | System | System mono | 14 / 1.43 | 783px |
| Radix | Untitled Sans (paid) | Untitled Sans | Söhne Mono (paid) | 16 / 1.5 | ≈66ch |
| Astro, Tauri, Starlight | System | System | System mono | 16 / 1.75 | 45rem |
| Bun | System | Archivo, weight 800 | Martian Mono | 16.5 / 1.75 | ≈70ch |
| Deno | Inter | Inter | System mono | 16 / 1.5 | ≈77ch |
| Biome (Starlight) | Geist | Geist | JetBrains Mono | 16 / 1.75 | ≈65ch |

The paid-font licences for Radix's typefaces are **unverified**. Berkeley Mono's web licence starts at about $145 (ET 2, from a vendor search snippet).

### Starlight 0.43.1 defaults and how to change them
All from the package's own CSS (ET 1).
- **Fonts:** `--sl-font` and `--sl-font-mono` are unset, so they fall back to the system stacks.
- **Text:** body 1rem (16px), code 0.875rem (14px), line-height 1.75 (headings 1.2). Headings h1–h5 are 35/29/24/20/18px, stepping up to 42/35/29/24/18px from 50em wide.
- **Layout:** content 45rem wide, sidebar 18.75rem, nav 3.5rem tall (4rem from 50em wide).
- **Changing them:** Starlight's styles sit in CSS cascade layers, and any unlayered CSS beats them (ET 1, Starlight docs). One `:root {}` block in a `customCss` file resets the variables. For a font: install its Fontsource package, add it to `customCss` and set `--sl-font`. `--sl-font-mono` works the same way; Biome sets it, though the docs page doesn't mention it (ET 1). Code blocks come from Expressive Code, which has its own `--ec-*` font variables.

## Imagery and home-page layout
### What sites agree on
- **The install command sits near the top,** usually as a terminal-style block with tabs per OS (operating system) or package manager. Bun, uv, Biome, Vite, Astro, Deno and the Claude Code docs all do this; Tailwind and Zed don't (observed, ET 1).
- **The visual is the product, not decoration.** Sites use benchmark charts (Bun, uv, Astro), code with its output (Deno, uv, Biome, Tailwind), terminal mockups (Vite) or a UI mockup (Zed). None of the observed pages used 3D art or abstract blobs (ET 1).
- **Docs-first homes leave out social proof.** Product sites show logo walls, testimonials and stats. uv, Deno, the Claude Code docs and Zed show none (ET 1).
- **Restraint:** "clever and simple" with "no salesy BS" (Evil Martians, a 2025 study of 100 dev-tool landing pages). ET 3, because the agency sells landing-page templates, but the observations above fit it.

### Observed home pages
| Site | Hero | Install shown | Imagery | Below the fold |
|---|---|---|---|---|
| Starlight | Title, tagline, 2 buttons | No | Star graphic, light/dark logo | 4 features, users, testimonials |
| Astro | Headline, 1 button | `npm create astro` with copy | Background image, perf chart | Pillars, feature grid, sponsors |
| Bun | Headline, 2 buttons | curl one-liner, OS tabs | Animated benchmarks | Tool tabs, code, comparison, testimonials |
| uv | Name, tagline (docs page as home) | OS tabs, curl and PowerShell | Light/dark benchmark chart | Highlights, terminal examples |
| Biome | Headline, 2 buttons | Tabs for 7 package managers | Light/dark logo | Before/after code, 6 cards, sponsors |
| Vite | Headline, 2 buttons | Terminal block with tabs | Terminal mockups | Features, logos, stats, testimonials |
| Deno docs | "Get started" intro | curl and PowerShell | None | Step-by-step tutorial |
| Claude Code docs | Overview text | Tabs: curl, Homebrew, WinGet | None | Use cases, next steps |
| Tailwind | Headline, 1 button | No | Code beside its rendered result | Sponsors, live demos |
| Zed | Mission headline | Download buttons | UI mockup | 3 cards |

Not observed: Ghostty (empty fetch), Linear, Vercel, Supabase, Tauri and Vitest.

### What Starlight gives out of the box
All from Starlight's docs (ET 1).
- **Built in:**
  - **Page and hero:** the `splash` template, a wide page with no sidebars. Its hero takes a title, a tagline, an image (one file or a light/dark pair) and buttons.
  - **Components:** Card, CardGrid, LinkCard, LinkButton, Steps, Tabs, Code, FileTree, Aside, Badge and Icon.
  - **Code blocks:** shell code gets a terminal frame, a copy button by default, and `#` comment lines stripped on copy.
  - **Page extras:** edit link, last-updated date (off by default, wrong on shallow git clones), favicon, a light/dark logo and previous/next links.
- **Needs an override, a plugin or a component of our own:**
  - An install block inside the hero, because the hero has no slot for code (put a `<Code>` block below it or override `Hero`).
  - Open Graph images, the preview shown when a link is shared (community plugins `starlight-myog` or `starlight-seo`).
  - Image zoom, diagrams, and terminal recordings.

### Diagram options and upkeep
| Option | How it renders | Light/dark | Upkeep |
|---|---|---|---|
| Mermaid (`astro-mermaid` 2.1) | In the browser, so it ships JavaScript | Follows the theme switch | Must be registered before Starlight. The older `rehype-mermaid` doesn't follow the switch (Starlight issue #1829) |
| D2 (`astro-d2`) | Static SVG at build | One theme per diagram (**unverified** whether it switches) | D2 binary needed in CI unless using the experimental D2.js |
| Excalidraw or hand SVG | Static files | A light and a dark file each, or SVG themed with CSS variables | Re-export by hand after every edit; no plugin |

Terminal recordings: VHS turns a version-controlled script into a GIF or video, and asciinema needs a JavaScript player (ET 3, vendor comparisons).

## The "AI look"
- **ET 1:** Anthropic's own blog (2025-11-12) says that without guidance, models default to Inter, "purple gradients on white backgrounds", minimal animation, and predictable layouts and component patterns. Anthropic's current frontend-design skill (last changed 2026-09-03) no longer names Inter. It asks for typefaces chosen deliberately, and it lists a cream background with a high-contrast serif display face, and a monospace face for small data labels, as common AI tells.
- **Unverified:** each of these comes from a single agency, and most of those agencies sell design work:
  - Utsubo (2026-06): blue-to-purple gradients, a centred hero with interchangeable copy, three equal feature cards, decorative motion, emoji or ✨ bullets, and words like "seamless" and "elevate".
  - Noqta (2026-06): oversized border radius, glowing gradients, pulsing "New" badges.
  - Glassmorphism and bento grids are named in the brief but appeared in no source read. A statistic about Hacker News launches couldn't be traced to its source.

## Where sources disagree
- **Is Inter generic now?** Agency posts say yes (ET 3, no data). Linear, Supabase, Tailwind and Deno all ship it today (ET 1), and Anthropic's guidance has dropped it from its list.
- **System stack or a webfont?** Butterick says to avoid system fonts (ET 1 for his view). Starlight, Astro, Tauri, Stripe and GitHub's Markdown CSS all use the system stack (ET 1). A webfont gives the same look on every platform. The system stack costs no download and matches the reader's OS.
- **Serif headings:** trend pieces call a serif display face over a sans body the 2026 look (ET 3). One crawl found that 90% of top sites use sans-serif headings (ET 2, single source, **unverified**). Anthropic lists a serif display face on cream as an AI tell. None of the measured docs sites uses serif headings.
- **Density:** Geist's default body style is 14px, with 16px for "spacious views" (ET 1), yet its docs render 16px. Stripe stays at 14/1.43.
- **Monospace:** no consensus. Sites ship Geist Mono, JetBrains Mono, Martian Mono, IBM Plex Mono, Source Code Pro and paid faces.
- **Centred hero and card grids:** Evil Martians calls the centred hero and bento grids the norm (ET 3). Utsubo calls a centred hero and three equal cards a tell (unverified). Starlight's own building block for features is CardGrid.
- **Motion:** Anthropic treats minimal motion as the generic default. Evil Martians reports flashy interactions are rare, and Utsubo flags decorative motion as a tell.

## Sources
- `@astrojs/starlight` 0.43.1 package CSS and components (npm), read 2026-11-17. ET 1. Interest: vendor.
- Starlight guides and reference: [CSS & styling](https://starlight.astro.build/guides/css-and-tailwind/), [customisation](https://starlight.astro.build/guides/customization/), [frontmatter](https://starlight.astro.build/reference/frontmatter/), [configuration](https://starlight.astro.build/reference/configuration/), read 2026-11-17. ET 1.
- [Expressive Code frames](https://expressive-code.com/key-features/frames/), read 2026-11-17. ET 1.
- Computed styles measured on Vercel, Linear, GitHub Docs, Supabase, Tailwind, Stripe, Radix, Astro, Bun, Deno, Biome, Tauri and Starlight docs, 2026-11-17. ET 1.
- Home pages observed: bun.sh, docs.astral.sh/uv, biomejs.dev, vite.dev, docs.deno.com, code.claude.com/docs, tailwindcss.com, astro.build, starlight.astro.build, zed.dev, on 2026-11-17. ET 1.
- Fontsource API (`api.fontsource.org`), 2026-11-17. ET 1.
- [Geist typography](https://vercel.com/geist/typography), read 2026-11-17. ET 1. Interest: promotes its own design system.
- [Primer typography](https://primer.style/product/getting-started/foundations/typography/), undated. ET 1.
- [Practical Typography, key rules](https://practicaltypography.com/summary-of-key-rules.html), Butterick, undated. ET 1 for his opinion. Interest: sells fonts.
- [Understanding SC 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), W3C. ET 1.
- [Inter](https://rsms.me/inter/) 4.1. ET 1.
- [Improving frontend design through skills](https://claude.com/blog/improving-frontend-design-through-skills), Anthropic, 2025-11-12, and the [frontend-design skill](https://github.com/anthropics/skills), 2026-09-03. ET 1 for what they say. Interest: the writer's maker.
- [We studied 100 dev tool landing pages](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025), Evil Martians, 2025-07-08. ET 3. Interest: sells landing-page templates.
- [The "Built with AI" tell](https://www.utsubo.com/blog/built-with-ai-trust-signals-2026), Utsubo, 2026-06-23, and [AI design slop](https://noqta.tn/blog/ai-design-slop-overused-ui-patterns-fix-2026), Noqta, 2026-06-04. ET 3. Interest: design agencies.
- "AI slop" font posts and serif-trend roundups (aiskill.market, 925studios, madegooddesigns, muz.li) and a top-site crawl statistic (blog.mean.ceo), 2026. ET 3, the crawl ET 2.
- `astro-mermaid` 2.1.0 README, Starlight discussion #1259 and issue #1829, [astro-d2 docs](https://astro-d2.vercel.app/getting-started/). ET 1.
- VHS and asciinema comparisons (agentgif.com, pistack.xyz), 2026. ET 3. Interest: competing vendors.

## Related
- [Hub](README.md)
- [Colour palette research](origins/docs-website/shaping-content/colour-palette.md)
- [Site brief](origins/docs-website/ideas-content/brief.md)
- [Information architecture](information-architecture.md)
