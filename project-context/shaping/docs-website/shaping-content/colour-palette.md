---
title: Colour palette research
shortDescription: What designers in 2025–2026 rate as modern, clean tech palettes, with candidate palettes for the docs site
tags: [documentation, brand-voice]
---
# Colour palette research

## Summary
Desk research on 2026-11-17, covering colour only. The dev-tool brands that set the look (Vercel, Linear, GitHub, Supabase, Tailwind, Radix) ship the same pattern: near-neutral greys doing almost all the work, one accent colour, a dark mode that's dark grey or near-black rather than inverted, and scales built in perceptual colour spaces (spaces where equal steps look equally bright). The loudest independent critique is of the indigo-to-purple default. Both Starlight and VitePress ship a blue-violet accent by default, which may be part of why Zac finds their colours horrible. The five candidates are **Monochrome + blue** (Vercel Geist), **Off-black + periwinkle** (Linear), **GitHub-native blue** (Primer), **Cool slate + jade** (Radix, Supabase-style) and **Warm sand + orange** (Radix sand, the warm-neutral direction). They're mapped, not ranked.

ET (evidence tier) follows the [Evidence standard](/project-context/README.md). Hex values and contrast ratios come from each org's published tokens or live CSS, read on 2026-11-17. Contrast follows WCAG (Web Content Accessibility Guidelines) 2.x: AA (the usual pass level) needs 4.5:1 for body text and 3:1 for large text and UI parts.

## What designers agree on
- **Greys carry the design and the accent is used sparingly.** Geist has 10-step grey scales and assigns text, borders and backgrounds to fixed steps. Colour is for meaning (ET 1, [Geist colours](https://vercel.com/geist/colors)). Primer, Radix and Linear's live tokens follow the same split (ET 1, tokens below).
- **Dark mode is near-black or dark grey, never inverted.** Vercel uses #0a0a0a, Linear #08090a and GitHub #0d1117, which is tinted blue. Material Design recommends #121212 over pure black for eye strain and elevation (ET 1, Google's guidance for its own system).
- **Greys are tinted slightly towards the accent or a temperature.** Radix offers slate (cool), sand (warm), mauve, olive and sage, each meant to pair with matching accents. Linear's greys lean blue, and Primer's are blue-grey (ET 1). Geist is the counter-example: pure neutral greys.
- **Palettes are built in perceptual colour spaces.** Tailwind v4 moved its whole palette from RGB (red-green-blue) to OKLCH (a perceptual lightness-chroma-hue space) on 2025-01-22 (ET 1). Linear generates its themes in LCH (lightness, chroma, hue) from 3 inputs: base, accent and contrast (ET 1, Linear blog, March 2024). Geist ships P3 (wide-gamut) values (ET 1).
- **Contrast is designed into the scale.** Radix guarantees its steps 11 and 12 reach APCA (Accessible Perceptual Contrast Algorithm, a draft successor to WCAG's formula) Lc 60 and Lc 90 on step 2 of the same scale (ET 1).
- **The Tailwind indigo/purple gradient now reads as generic, the "AI-built" look.** Adam Wathan reportedly apologised in August 2025 for defaulting Tailwind UI buttons to indigo-500. The causal story (training data reproducing the default) is a hypothesis. **Unverified** beyond practitioner blogs (ET 3, several).
- **Restraint is the shared ideal ("clever and simple, not salesy").** From Evil Martians' review of 100+ dev-tool landing pages, 2025. ET 2: real sample, but written by an agency that sells dev-tool marketing.

## Candidate palettes
Values are hex. Contrast is measured against the background (bg). Hover values are each source's own token where one exists.

**1. Monochrome + blue**, grounded in Vercel Geist (live vercel.com CSS).

| Mode | bg | surface | text | muted | accent | accent hover | border |
|---|---|---|---|---|---|---|---|
| Light | #ffffff | #fafafa | #171717 | #4d4d4d | #0068d6 | #0062d1 | #ebebeb |
| Dark | #0a0a0a | #1a1a1a | #ededed | #a1a1a1 | #52a8ff | #ebf6ff | #2e2e2e |

Contrast, light: text 17.9, accent 5.3. Dark: text 16.9, accent 7.9. All pass AA.

**2. Off-black + periwinkle**, grounded in Linear (live linear.app tokens).

| Mode | bg | surface | text | muted | accent | accent hover | border |
|---|---|---|---|---|---|---|---|
| Light | #ffffff | #f9f8f9 | #282a30 | #6f6e77 | #7170ff | #8989f0 | #e9e8ea |
| Dark | #08090a | #1c1c1f | #f7f8f8 | #8a8f98 | #7170ff | #828fff | #23252a |

Contrast, light: text 14.3, accent **3.8 (fails AA for body text; large text and buttons only)**. Dark: text 18.7, accent 5.2. This is the purple family the critique above targets.

**3. GitHub-native blue**, grounded in Primer (`@primer/primitives` 11.10.0).

| Mode | bg | surface | text | muted | accent | accent hover | border |
|---|---|---|---|---|---|---|---|
| Light | #ffffff | #f6f8fa | #1f2328 | #59636e | #0969da | #0969da + underline | #d1d9e0 |
| Dark | #0d1117 | #151b23 | #f0f6fc | #9198a1 | #4493f8 | #1f6feb | #3d444d |

Contrast, light: text 15.8, accent 5.2. Dark: text 17.4, accent 6.1, hover 4.1 (below AA for text). Primer's primary buttons are green (#1f883d), not blue.

**4. Cool slate + jade**, grounded in Radix Colors 3.0.0 (slate 1/2/12/11/6, jade 11/12). Supabase's brand green (hsl 153° 60% 53%) and its Radix-based UI are the dev-tool precedent.

| Mode | bg | surface | text | muted | accent | accent hover | border |
|---|---|---|---|---|---|---|---|
| Light | #fcfcfd | #f9f9fb | #1c2024 | #60646c | #208368 | #1d3b31 | #d9d9e0 |
| Dark | #111113 | #18191b | #edeef0 | #b0b4ba | #1fd8a4 | #adf0d4 | #363a3f |

Contrast, light: text 16.0, accent 4.5 (just passes AA). Dark: text 16.2, accent 10.3.

**5. Warm sand + orange**, grounded in Radix sand plus orange 11/12, the warm-neutral direction. Anthropic's published brand uses the same idea (ivory #faf9f5, near-black #141413, clay #d97757; disclosure: this research was written by an Anthropic model).

| Mode | bg | surface | text | muted | accent | accent hover | border |
|---|---|---|---|---|---|---|---|
| Light | #fdfdfc | #f9f9f8 | #21201c | #63635e | #cc4e00 | #582d1d | #dad9d6 |
| Dark | #111110 | #191918 | #eeeeec | #b5b3ad | #ffa057 | #ffe0c2 | #3b3a37 |

Contrast, light: text 16.0, accent **4.4 (just under AA for body text)**. Dark: text 16.3, accent 9.4. Anthropic's clay is 3.0 on its light background.

**Reference, the frameworks' defaults:** Starlight 0.43.1 uses blue-violet hsl(234 90% 60%), #3d50f5, at 5.7 on light, and #b3c7ff at 10.6 on #17181c. VitePress 1.6.4 uses #3451b2 at 7.1 on white, and #a8b1ff at 8.5 on #1b1b1f. Both are blue-violet on cool greys.

## Where sources disagree
- **How dark the dark mode goes:** near-black (Vercel #0a0a0a, Linear #08090a) against Material's #121212 dark grey and GitHub's blue-tinted #0d1117. Each is the org's own choice (ET 1). No independent data shows which reads better for long docs.
- **Neutral or tinted greys:** Geist is pure grey, while Radix, Primer and Linear tint theirs. Both camps are respected, and neither has evidence the other is worse.
- **Is purple still modern?** Linear, still widely praised, ships periwinkle. The "AI purple" critique says unchosen indigo now reads as generic (ET 3). One playbook says the 2026 "AI default" has moved on to cream, serif type and sage green. That would put the warm candidate in the same trap. **Unverified**, single source.
- **Vendor trend reports:** Pantone's 2026 Colour of the Year is Cloud Dancer (PANTONE 11-4201), an off-white announced 2025-12-04 and its first white. ET 1 that Pantone chose it; ET 3 that designers use it. It loosely matches the off-white backgrounds above, but Pantone sells the trend.

## Sources
- [Geist colours](https://vercel.com/geist/colors) and live vercel.com CSS. Read 2026-11-17. ET 1 for what Vercel ships. Interest: promotes its own design system.
- [How we redesigned the Linear UI, part II](https://linear.app/now/how-we-redesigned-the-linear-ui), March 2024, and live linear.app CSS. ET 1 for what Linear ships. Interest: product marketing.
- [`@primer/primitives` 11.10.0](https://unpkg.com/@primer/primitives/dist/css/functional/themes/light.css), GitHub. ET 1.
- [Radix Colors 3.0.0](https://unpkg.com/@radix-ui/colors/) and [Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale). ET 1. Interest: WorkOS's open-source library.
- [Supabase UI themes](https://github.com/supabase/supabase/tree/master/packages/ui/build/css/themes), GitHub. ET 1.
- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4), 2025-01-22, and `tailwindcss` 4.3.5 `theme.css`. ET 1. Interest: sells Tailwind Plus.
- Starlight 0.43.1 `dist/style/props.css` and VitePress 1.6.4 `vars.css` via unpkg, read 2026-11-17. ET 1.
- [Material Design dark theme](https://m2.material.io/design/color/dark-theme), Google, undated (Material 2). ET 1 for Google's guidance.
- [Anthropic brand-guidelines skill](https://github.com/anthropics/skills). ET 1. Interest: the writer's maker.
- [We studied 100 dev tool landing pages](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025), Evil Martians, 2025. ET 2. Interest: an agency selling dev-tool design.
- [Why every AI-built website looks the same](https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p) and [Why your AI keeps building the same purple gradient website](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website), 2025. ET 3, practitioner blogs.
- [Unslop UI playbook](https://claudecodehq.com/playbooks/unslop-ui), undated. ET 3.
- [Pantone Colour of the Year 2026: Cloud Dancer](https://www.pantone.com/articles/press-releases/pantone-announces-color-of-the-year-2026-cloud-dancer), 2025-12-04. ET 1 that it was announced, ET 3 as a usage trend. Interest: sells colour standards.

## Related
- [Hub](../README.md)
- [Bake-off](bake-off.md)
