# Whisky page design reference

Visual source of truth for published Whisky detail pages (`/whiskies/[id]`): [whisky.html](./whisky.html).

Shared tokens and component language remain in [DESIGN.md](./DESIGN.md). App chrome uses the live header and footer from the Next.js shell.

## How coding agents should use this

- Match the **layout section for section** in `whisky.html`: breadcrumbs, gallery with thumbnails, specs, awards, SKU selector cards, purchase panel (stepper + cart + buy now), House video, pairings grid, and related-set strip.
- Product behavior follows GitHub issue #15 and `CONTEXT.md`. **Layout follows the mock literally** for this ticket (including pairings, related set, quantity stepper, favorite heart, and both purchase buttons); wire actions only as far as the spec allows until later tickets (cart #21, favorites #20).
- Do not hotlink Stitch / Google image URLs in the app; use local `/bottles/*` assets.
- Approved **Tastings** from Members are not in the HTML mock; render them below the House video block when data exists.
- Draft or unknown Whiskies are not-found; no invented editorial copy when optional data is missing.

## Entry points (this ticket)

- Catalogue product cards and Home **Нови уискита** / **Промоции** cards link to `/whiskies/[id]`.
- Search continues to open the filtered Catalogue; it does not navigate to the Whisky page.
