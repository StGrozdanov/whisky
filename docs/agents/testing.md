# Testing layers

Three layers, three data sources. Do not leak concerns across them.

## Unit — Vitest (`src/**/*.test.ts`)

- **Runner:** `npm test` (CI job “Unit Tests”).
- **Scope:** Isolated functions and helpers — parsers, price formatting, Price tier, URL query parsing, YouTube id parsing, and other pure logic.
- **Data:** No browser, no database, no full page render.
- **Shop seam:** Existing Shop tests that call `createShop` with `createInMemoryHomeStore` live next to Shop and still run under `npm test`. They cover domain rules without a browser. New catalogue **UI** edge cases belong in Playwright integration, not here. Do not turn helper unit tests into full-page browser tests.

## Integration — Playwright (`integration/`)

- **Runner:** `npm run test:integration` (CI job “Integration Tests”, before nonprod deploy).
- **Scope:** Every catalogue (and similar) edge case that needs a rendered page: empty catalogue, no filter matches, Buy and Ask us, pagination, drafts hidden, retryable error page.
- **Data:** In-memory fixtures only. Never Supabase. The Next server starts with `SHOP_FIXTURE` set; `getShop` serves a fixture store. Per-test override via request header `x-shop-fixture` (`empty` | `mixed` | `error`) when fixtures are enabled.
- **Config:** `playwright.integration.config.ts` — `testDir: ./integration`.

## E2e — Playwright (`e2e/`)

- **Runner:** `npm run test:e2e` (CI job “E2E Tests”, against the shared nonprod URL after deploy).
- **Scope:** Main customer flows only: age gate, shell, Home renders (content present or omitted), Catalogue opens and a filter updates the URL.
- **Data:** Live nonprod database. No named bottles, stock levels, page counts, rail sizes, or “this tier is empty” assumptions.
- **Config:** `playwright.e2e.config.ts` — `testDir: ./e2e`.

## What must not cross layers

| Do not | Why |
| --- | --- |
| Assert seed bottle names / stock / page-2 layout in `e2e/` | Deploy gate must survive Shopkeeper edits |
| Point integration at Supabase | Edge cases need owned fixtures |
| Re-seed nonprod before every e2e run | Still couples the gate to mutable shop data |
| Put UI empty/error/Buy–Ask cases only in Vitest | Those need the rendered page (integration) |
| Put pure helper tests in Playwright | Slow and the wrong seam |

## Fixture names (`SHOP_FIXTURE` / `x-shop-fixture`)

| Name | Behaviour |
| --- | --- |
| `mixed` | Published catalogue with Buy and Ask us cards, 25 Whiskies for page 2, a draft that must stay hidden, Scotch-only so `origin=Japanese` matches nothing |
| `empty` | No published catalogue entries |
| `error` | Catalogue load throws so `catalogue/error.tsx` can render |

Unset `SHOP_FIXTURE` in production and e2e: `getShop` always uses Supabase.
