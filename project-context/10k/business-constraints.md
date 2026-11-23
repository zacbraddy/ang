---
title: Business constraints
shortDescription: Ownership, licence, maintenance stance, spend and capacity limits on Ang as an open-source project
tags: [constraints, open-source]
---
# Business constraints

## Summary
These are the hard limits on releasing and running Ang. Ownership, licence, maintenance, spend and capacity are the user's statements of intent or constraint (ET 1, evidence tier 1: a primary source), given at bootstrap on 2026-11-13. The licence is also borne out by `LICENSE`. The repo's public visibility was checked with `gh repo view` on 2026-11-13.

## Ownership and legal
- **Licence: MIT.** This is decided. WTFPL was considered and rejected as edgy for its own sake.
- **Copyright stays with Zac Braddy personally**, as `LICENSE` states, not with We Right Code. We Right Code is a personal services company that may shut down, and moving copyright later would be painful.
- Ang was developed as part of Zac's work under We Right Code. That is an attribution fact, not an ownership one.
- `github.com/zacbraddy/ang` has been public since before bootstrap (checked 2026-11-13).

## Maintenance stance
- No open-source maintainer time: no release processes, PR (pull request) reviews or issue-thread arguments beyond the bare minimum. **"Bare minimum" means the minimum for a process that is comfortable to maintain and operate**, not the least effort or fewest dependencies, so the release skill, CI job and fixture repo fit within it (Zac's call, 2026-11-18).
- **Releases:** Zac alone decides when to release and every version number, with no schedule, nudges or automatic releases. A bad release is fixed only by a patch release, never by editing or rolling back a published one. No CHANGELOG.md, commit convention, changesets, PR labels, checksums or signing. How it runs: [ADR 0007](/project-context/10k/technical/adrs/0007-how-releases-are-cut.md).
- The default answer to a feature issue or PR is "cool idea, go build it" ([first principles](/project-context/10k/product/first-principles.md), principle 4).
- PR and issue templates exist as rubber-ducking nudges, never gates: nothing blocks a PR, and chat goes to Discussions ([ADR 0012](/project-context/10k/technical/adrs/0012-contributor-templates-nudge-not-gate.md)). No CONTRIBUTORS file or SECURITY.md (private vulnerability reporting instead), and no code of conduct until a community forms.
- **"Released" means:** the published v1.0.0 release, a README and a live docs site. `v1.0.0-rc.N` pre-releases are rehearsals and don't count (Zac's call, 2026-11-18). Stars, adoption and other metrics are not goals.

## Spend and capacity
- There is no fixed spend cap. Recurring costs (a domain, hosting) are acceptable when the case for them beats free options such as GitHub Pages.
- Zac costs any paid option and sets up the accounts himself, then hands the details to agents to configure. Zac is an experienced web developer who has hosted sites before. He has never maintained an open-source project.
- Very little free time. Prefer anything with no ongoing upkeep.

## Related
| Doc | Why |
|---|---|
| [What Ang is](/project-context/10k/product/what-ang-is.md) | The product these limits apply to |
| [First principles](/project-context/10k/product/first-principles.md) | Principle 4 is why the maintenance stance works |
| [Voice and attribution](/project-context/10k/marketing/voice-and-attribution.md) | How Zac and We Right Code are credited |
| [Delivery intent](/project-context/10k/intent.md) | How the release is being delivered within these limits |
