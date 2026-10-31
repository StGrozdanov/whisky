# Testing layers

Three layers, three data sources. Do not leak concerns across them.

## Unit — Vitest (`src/**/*.test.ts`)

- **Runner:** `npm test` (CI job “Unit Tests”).
- **Scope:** Isolated functions and helpers — parsers, price formatting, Price tier, URL query parsing, YouTube id parsing, and other pure logic.
- **Data:** No browser, no database, no full page render.
- **Shop seam:** Existing Shop tests that call `createShop` with `createInMemoryHomeStore` live next to Shop and still run under `npm test`. They cover domain rules without a browser. New catalogue **UI** edge cases belong in Playwright integration, not here. Do not turn helper unit tests into full-page browser tests.

## Integration — Playwright (`integration/`)

- **Runner:** `npm run test:integration` (CI job “Integration Tests”, before nonprod deploy). Locally Playwright starts `next dev`, so a clean checkout needs no prior build. In CI the workflow builds first and Playwright starts `next start`.
- **Scope:** Every catalogue (and similar) edge case that needs a rendered page: empty catalogue, no filter matches, Buy and Ask us, pagination, drafts hidden, retryable error page. The same applies to Promotions, Gifts, Discovery Packs, and the Award page.
- **Enquiry forms:** Contact request, Newsletter, unsubscribe, and Ask us (Waitlist, on Whisky pages and Pack cards) validation, success, duplicate, and failure states. Server actions read `x-shop-fixture` too, so switch the header to `error` after the page loads to exercise a failed submit. Fixture shops keep state for the life of the dev server, so use a unique email per test.
- **Data:** In-memory fixtures only. Never Supabase. The Next server starts with `SHOP_FIXTURE` set; `getShop` serves a fixture store. Per-test override via request header `x-shop-fixture` (`empty` | `mixed` | `error`) when fixtures are enabled.
- **Config:** `playwright.integration.config.ts` — `testDir: ./integration`. Set `INTEGRATION_PORT` to run beside another checkout (default 3001).

## E2e — Playwright (`e2e/`)

- **Runner:** `npm run test:e2e` (CI job “E2E Tests”, against the shared nonprod URL after deploy).
- **Scope:** Main customer flows only: age gate, shell, Home renders (content present or omitted), Catalogue opens and a filter updates the URL, and each discovery page (Promotions, Gifts, Discovery Packs, Award page, Club) renders live entries or its empty state. Expired and unavailable entries are covered in integration, not e2e.
- **Enquiries:** Main navigation, footer Policy pages and About, and the Contact, Newsletter, and unsubscribe forms through their validation and unknown-token paths. Do not submit enquiries that write rows to nonprod.
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
| `mixed` | Published catalogue with Buy and Ask us cards, 25 Whiskies for page 2, a draft that must stay hidden, Scotch-only so `origin=Japanese` matches nothing. Also active (Home-selected and not), expired, and draft Promotions; an In-stock and a sold-out Discovery Pack; Gift selections including a hidden draft and a sold-out Pack; Awards on Buy, Ask us, and draft Whiskies. One Newsletter subscription with the unsubscribe token `0f1e2d3c-4b5a-4987-8776-655443322110` |
| `empty` | No published catalogue entries, Promotions, Packs, Gifts, or Awards |
| `error` | Catalogue, Discovery Pack, Gift, and Award loads throw so each route's `error.tsx` can render. Contact request, Newsletter, and Waitlist reads and writes throw so each form shows its retryable error |

Unset `SHOP_FIXTURE` in production and e2e: `getShop` always uses Supabase.

## Finder fixture names (`FINDER_FIXTURE` / `x-finder-fixture`)

Integration never calls OpenRouter. With `FINDER_FIXTURE` set, `getFinder` swaps only the network for canned OpenRouter replies, so request building, response parsing, and Catalogue enforcement still run. Whisky IDs match the `mixed` Shop fixture. Unit contract tests for the request (no cache, provider `data_collection: "deny"`, `zdr: true`, approved domains, no Customer identity), parsing, and enforcement live in `src/finder/*.test.ts`. The e2e Finder spec runs live research and accepts results, an honest empty state, or the honest retryable error.

| Name | Behaviour |
| --- | --- |
| `ranked` | Ask us above Buy in CORE; an unknown ID and the draft (dropped); four ENTRY Whiskies (trimmed to three); a reason with a URL (stripped) |
| `empty` | Valid reply with no recommendations: honest empty state |
| `invalid-ids` | Only IDs outside the published Catalogue: retryable error |
| `http-error` | OpenRouter answers 503: retryable error |
| `malformed` | Message content is not JSON: retryable error |

Unset `FINDER_FIXTURE` in production and e2e: `getFinder` calls OpenRouter with `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`.
