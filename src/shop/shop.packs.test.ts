import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop } from "./shop";

const lineup = [
  { name: "1. GlenAllachie 12", detail: "Шери • Speyside", sortOrder: 1 },
  { name: "2. Laphroaig 10", detail: "Торф • Islay", sortOrder: 2 },
];

describe("Shop Discovery Packs", () => {
  it("sells each Pack by its own quantity, not its lineup", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        discoveryPacks: [
          {
            id: "sold-out",
            title: "Изчерпан сет",
            photoUrl: "/bottles/glenallachie-12.svg",
            priceEur: 24,
            quantity: 0,
            sortOrder: 2,
            lineup,
          },
          {
            id: "in-stock",
            title: "Шери срещу Торф",
            photoUrl: "/bottles/glenallachie-12.svg",
            priceEur: 21.5,
            quantity: 4,
            sortOrder: 1,
            lineup,
          },
        ],
      }),
    });

    expect(await shop.discoveryPacks()).toEqual([
      {
        id: "in-stock",
        title: "Шери срещу Торф",
        photoUrl: "/bottles/glenallachie-12.svg",
        priceEur: 21.5,
        action: "buy",
        lineup: [
          { name: "1. GlenAllachie 12", detail: "Шери • Speyside" },
          { name: "2. Laphroaig 10", detail: "Торф • Islay" },
        ],
      },
      {
        id: "sold-out",
        title: "Изчерпан сет",
        photoUrl: "/bottles/glenallachie-12.svg",
        priceEur: 24,
        action: "ask-us",
        lineup: [
          { name: "1. GlenAllachie 12", detail: "Шери • Speyside" },
          { name: "2. Laphroaig 10", detail: "Торф • Islay" },
        ],
      },
    ]);
  });

  it("returns no Packs when the Shopkeeper has none", async () => {
    const shop = createShop({ store: createInMemoryHomeStore() });

    expect(await shop.discoveryPacks()).toEqual([]);
  });
});
