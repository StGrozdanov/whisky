# Catalogue design reference

Visual source of truth for the public Catalogue (`/catalogue`, nav label **Селекция**): [catalogue.html](./catalogue.html).

Shared tokens and component language remain in [DESIGN.md](./DESIGN.md). Home chrome lives in [landing.html](./landing.html).

## How coding agents should use this

- Match the **layout and card structure** in `catalogue.html`: breadcrumbs, five dropdown filters, active chips, A–Z label (not a sort control), 4-column grid, pagination, loading / empty / error treatments.
- Use the HTML **QA state switcher** (normal / skeleton / empty DB / no filter matches / error) only as a visual reference for those states. Do **not** ship the switcher in the app; implement real Next.js loading, empty, and error UI instead.
- Product behavior follows GitHub issue #13 and `CONTEXT.md`. Where the mock and the spec conflict, **layout follows the mock, behavior follows the spec**.

## Spec overrides (do not copy from the mock)

- Say **уискита**, not бутилки.
- Guests must not see Favorite hearts on cards.
- Main navigation: only wire **Селекция** for this ticket; omit other mock nav destinations until their tickets.
- Origins are Irish / Scotch / Bourbon / Japanese only — no Taiwan.
- Do not hotlink Stitch / Google image URLs; use local `/bottles/*` assets.
- Primary CTA is **Купи** or **Попитай ни** from Availability; never Sold out / On request as a customer label.
- No customer-controlled sort; keep the static A–Z label only.

## Filter controls (mock labels)

| Control | Values |
|---|---|
| Произход | Всички, Шотландия, Ирландия, САЩ, Япония |
| Ценови клас | Всички, ENTRY / CORE / SIGNATURE / PREMIUM |
| Възраст | Всички, С декларирана възраст, Без посочена възраст (NAS) |
| Оценка | Всички, Над 9.0 / 9.3 / 9.5 |
| Ниво опит | Всички, За начинаещи, За напреднали |
