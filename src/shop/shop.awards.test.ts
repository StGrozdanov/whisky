import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop } from "./shop";

const gold = {
  title: "Златен медал",
  organisation: "San Francisco WSC",
  year: 2023,
  category: "Single Malt",
};

const silver = {
  title: "Сребърен медал",
  organisation: "IWSC",
  year: 2024,
  category: "Scotch Whisky",
};

describe("Shop Award page", () => {
  it("lists published Whiskies with one or more Awards in A–Z order", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "zeta",
            name: "Zeta 18",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
          },
          {
            id: "alpha",
            name: "Alpha 10",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
          },
          {
            id: "plain",
            name: "No Awards",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
          },
        ],
        primarySkus: [
          { whiskyId: "zeta", priceEur: 150, quantity: 0 },
          { whiskyId: "alpha", priceEur: 45, quantity: 2 },
          { whiskyId: "plain", priceEur: 45, quantity: 2 },
        ],
        whiskyPages: [
          { whiskyId: "zeta", awards: [gold, silver] },
          { whiskyId: "alpha", awards: [silver] },
        ],
      }),
    });

    const awarded = await shop.awards();

    expect(awarded.map((entry) => entry.whisky.name)).toEqual([
      "Alpha 10",
      "Zeta 18",
    ]);
    expect(awarded[1]).toMatchObject({
      whisky: { id: "zeta", action: "ask-us", priceTier: "PREMIUM" },
      awards: [gold, silver],
    });
  });

  it("never lists a draft Whisky even when it has Awards", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "draft",
            name: "Draft",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            published: false,
          },
        ],
        primarySkus: [{ whiskyId: "draft", priceEur: 45, quantity: 2 }],
        whiskyPages: [{ whiskyId: "draft", awards: [gold] }],
      }),
    });

    expect(await shop.awards()).toEqual([]);
  });
});
