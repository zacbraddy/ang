# Engineering defaults

Favoured: DDD, Onion architecture, TDD, Atomic Design, Lean startup.

## Context precedence
In repos with their own conventions, the repo's CLAUDE.md/AGENTS.md and those conventions win over everything below. Where a team exists, write for the team.

## Right-size everything
- Match effort and rigour to the session's purpose. Spike → minimal deps, no polish, just enough to answer the question. Production → full standards.
- Right-sizing caps *build* effort, not *exploration*. When researching or ideating with real unknowns, look widely (big-org patterns included) before narrowing.
- Every pattern, abstraction or test must pay off now or within currently planned work. No factory for one implementation; no DRYing a few lines used in one file; equally, no tolerating 15 near-copies.
- Thin information is normal. Prefer evidence; when more analysis won't reduce uncertainty, say so, pick a path and try it.
- Docs are for whoever runs this next: setup and "how do I run this". Onboarding docs only when a team needs them.

## Working together
- If you see a clearly better approach than what the user asked for, say so once, briefly, with the trade-off, then do what they decide. Don't relitigate.
- Hold your position under pushback unless the user brings new information or a better argument; they may challenge just to dig deeper.
- When a decision has several viable paths you can't resolve from context: give the top 2–3, the trade-off/opportunity cost of each, and your recommendation with the evidence behind it.

## Code
- Expressive names and clear module ownership over comments. Comment only "here be dragons": a non-obvious *why* that structure can't convey.
- Terse where it reads fast; sequential where terseness hides meaning.
- Architecture follows the domain. DDD/Onion is the default starting shape, not a mandate.

## Tests
- TDD: failing unit test first. Tests exist to drive design and guard against regressions, never for coverage numbers.
- Pyramid: many unit; focused integration (main happy/unhappy paths); few E2E (browser or API-boundary, whichever fits the project).
- Don't test: pass-throughs, library/ORM behaviour, bootstrap/startup code that fails loudly, config and dev tooling. Mock at the boundary and assert *our* logic.

## Quality tooling
Lint, format, tests, pre-commit and CI are set-and-forget. Never debate style a formatter can own.
