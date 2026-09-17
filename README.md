# Whisky Finder

A boutique whisky shop for the Bulgarian market ([whiskyfinder.bg](https://whiskyfinder.bg)): a short curated list, store-written tasting notes, and a **Finder** that recommends up to three whiskies based on flavour, sweetness, and smoke — with **Buy** or **Ask us** (waitlist) actions.

See [CONTEXT.md](./CONTEXT.md) for the full domain glossary — use its exact terms (Whisky vs SKU vs Pack, House tasting vs Tasting, Availability states, etc.) rather than synonyms.

## Stack

- [Next.js](https://nextjs.org) 16 / React 19 / TypeScript
- Tailwind CSS
- [Supabase](https://supabase.com) (database)
- [Biome](https://biomejs.dev) (lint/format)
- [Vitest](https://vitest.dev) (unit tests) / [Playwright](https://playwright.dev) (integration & e2e tests)
- Deployed on [Vercel](https://vercel.com)

## Getting started

```bash
npm install
npm run dev
```

Other useful scripts: `npm run type-check`, `npm run check` (Biome), `npm test` (Vitest), `npm run test:integration` / `npm run test:e2e` (Playwright).

## Workflow

This repo follows a spec-driven, agent-friendly workflow (Matt Pocock's "skills", see [skills-lock.json](./skills-lock.json) and [.agents/skills](./.agents/skills)):

1. **`to-spec`** — turn a discussion into a spec (problem, solution, user stories, implementation/testing decisions), published as a GitHub issue labelled `ready-for-agent`.
2. **`to-tickets`** — break a spec into small, vertical "tracer-bullet" tickets with explicit blocking edges, published as GitHub issues (or local files under `.scratch/`).
3. **`implement`** — do the work per ticket using TDD at pre-agreed seams, then hand off to review.
4. **`tdd`** — red → green loop: tests only at pre-agreed public seams, no implementation-coupled or tautological tests.
5. **`code-review`** — reviews the finished work.

Supporting skills: `grill-with-docs` (interrogate documentation), `ask-matt` (phase-boundary guidance).

Issues and specs live in this repo's **GitHub Issues**, managed via the `gh` CLI — see [docs/agents/issue-tracker.md](./docs/agents/issue-tracker.md) for conventions. Before exploring the codebase, agents read [CONTEXT.md](./CONTEXT.md) (and any `docs/adr/`) — see [docs/agents/domain.md](./docs/agents/domain.md).

## CI/CD

On every push to `main` ([.github/workflows/ci.yml](./.github/workflows/ci.yml)):

install → typecheck / lint / unit tests (parallel) → Supabase DB migrations → Playwright integration tests → deploy to a nonprod Vercel alias → Playwright e2e against nonprod → deploy to prod Vercel alias.

Nothing reaches production without passing e2e against a live nonprod deployment first.
