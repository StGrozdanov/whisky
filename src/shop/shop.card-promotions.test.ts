import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop } from "./shop";

const NOW = new Date("2026-10-30T12:00:00.000Z");

const promoted = {
  id: "promoted",
  name: "Promoted 12",
  photoUrl: "/bottles/glenallachie-12.svg",
  origin: "Scotch" as const,
};

const regular = {
  id: "regular",
  name: "Regular 10",
  photoUrl: "/bottles/glenallachie-12.svg",
  origin: "Scotch" as const,
};

const award = {
  title: "Златен медал",
  organisation: "IWSC",
  year: 2024,
  category: "Scotch Whisky",
};

function shopWithPromotion() {
  return createShop({
    store: createInMemoryHomeStore({
      whiskies: [promoted, regular],
      primarySkus: [
        { id: "promoted-700", whiskyId: "promoted", priceEur: 60, quantity: 2 },
        { id: "regular-700", whiskyId: "regular", priceEur: 45, quantity: 2 },
      ],
      promotions: [
        {
          whiskyId: "promoted",
          skuId: "promoted-700",
          featuredOnHome: false,
          discountedPriceEur: 48,
          priorPriceEur: 55,
          startsAt: new Date("2026-10-01T00:00:00.000Z"),
          endsAt: new Date("2026-11-30T22:00:00.000Z"),
          sortOrder: 1,
        },
      ],
      whiskyPages: [
        { whiskyId: "promoted", awards: [award] },
        { whiskyId: "regular", awards: [award] },
      ],
      giftSelections: [
        { kind: "whisky", whiskyId: "promoted", sortOrder: 1 },
        { kind: "whisky", whiskyId: "regular", sortOrder: 2 },
      ],
    }),
    clock: { now: () => NOW },
  });
}

const promotedCard = {
  id: "promoted",
  priceEur: 60,
  promotion: { discountedPriceEur: 48, priorPriceEur: 55, discountPercent: 13 },
};

describe("Shop Whisky cards with an active Promotion", () => {
  it("carry the Promotion on Catalogue cards", async () => {
    const page = await shopWithPromotion().catalogue({});

    expect(page.whiskies[0]).toMatchObject(promotedCard);
    expect(page.whiskies[1]).toMatchObject({ id: "regular", priceEur: 45 });
    expect(page.whiskies[1].promotion).toBeUndefined();
  });

  it("carry the Promotion on Gift page cards", async () => {
    const gifts = await shopWithPromotion().giftPageEntries();

    expect(gifts[0]).toMatchObject({ kind: "whisky", whisky: promotedCard });
  });

  it("carry the Promotion on Award page cards", async () => {
    const awarded = await shopWithPromotion().awards();

    expect(awarded[0]).toMatchObject({ whisky: promotedCard });
  });
});
