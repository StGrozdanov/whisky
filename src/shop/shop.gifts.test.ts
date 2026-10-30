import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop } from "./shop";

describe("Shop gifts", () => {
  it("lists Shopkeeper-selected Whiskies and Packs in the selected order", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "glen",
            name: "GlenAllachie 12",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "GlenAllachie",
            country: "Шотландия",
          },
          {
            id: "unselected",
            name: "Not a Gift",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
          },
        ],
        primarySkus: [
          { whiskyId: "glen", priceEur: 55.2, quantity: 2 },
          { whiskyId: "unselected", priceEur: 30, quantity: 2 },
        ],
        discoveryPacks: [
          {
            id: "pack",
            title: "Шери срещу Торф",
            photoUrl: "/bottles/glenallachie-12.svg",
            priceEur: 21.5,
            quantity: 0,
            sortOrder: 1,
            lineup: [],
          },
        ],
        giftSelections: [
          { kind: "whisky", whiskyId: "glen", sortOrder: 2 },
          { kind: "pack", packId: "pack", sortOrder: 1 },
        ],
      }),
    });

    const gifts = await shop.gifts();

    expect(gifts).toHaveLength(2);
    expect(gifts[0]).toEqual({
      kind: "pack",
      pack: {
        id: "pack",
        title: "Шери срещу Торф",
        photoUrl: "/bottles/glenallachie-12.svg",
        priceEur: 21.5,
        action: "ask-us",
        lineup: [],
      },
    });
    expect(gifts[1]).toMatchObject({
      kind: "whisky",
      whisky: {
        id: "glen",
        name: "GlenAllachie 12",
        priceEur: 55.2,
        action: "buy",
      },
    });
  });

  it("omits selections whose Whisky is a draft or whose Pack is gone", async () => {
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
        primarySkus: [{ whiskyId: "draft", priceEur: 40, quantity: 1 }],
        giftSelections: [
          { kind: "whisky", whiskyId: "draft", sortOrder: 1 },
          { kind: "pack", packId: "missing", sortOrder: 2 },
        ],
      }),
    });

    expect(await shop.gifts()).toEqual([]);
  });
});
