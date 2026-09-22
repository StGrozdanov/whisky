## Agent skills

### Issue tracker

Issues and specs live in this repo's GitHub Issues; skills use the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: `CONTEXT.md` at the repo root and ADRs in `docs/adr/`. See `docs/agents/domain.md`.

### Testing

Unit (Vitest helpers), integration (Playwright + fixtures, no DB), and e2e (Playwright against live nonprod) stay in separate folders and data sources. See `docs/agents/testing.md`.
