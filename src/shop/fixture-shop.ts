import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop, type Shop } from "./shop";
import type { Origin, ShopStore } from "./types";

const SHOP_FIXTURE_NAMES = ["empty", "mixed", "error"] as const;
export type ShopFixtureName = (typeof SHOP_FIXTURE_NAMES)[number];

const shops = new Map<ShopFixtureName, Shop>();

export function isShopFixtureName(value: string): value is ShopFixtureName {
  return (SHOP_FIXTURE_NAMES as readonly string[]).includes(value);
}

export function getFixtureShop(name: ShopFixtureName): Shop {
  const existing = shops.get(name);
  if (existing) {
    return existing;
  }

  const shop = createShop({ store: createFixtureStore(name) });
  shops.set(name, shop);
  return shop;
}

function createFixtureStore(name: ShopFixtureName): ShopStore {
  if (name === "empty") {
    return createInMemoryHomeStore();
  }

  if (name === "error") {
    return createErrorStore();
  }

  return createMixedStore();
}

function createErrorStore(): ShopStore {
  const empty = createInMemoryHomeStore();

  return {
    allWhiskies: () => empty.allWhiskies(),
    currentHousePick: () => empty.currentHousePick(),
    promotions: () => empty.promotions(),
    newWhiskies: () => empty.newWhiskies(),
    discoveryPacks: () => empty.discoveryPacks(),
    async catalogueEntries() {
      throw new Error("Fixture catalogue load failure");
    },
  };
}

function createMixedStore(): ShopStore {
  const pageWhiskies = Array.from({ length: 25 }, (_, index) => {
    const n = String(index + 1).padStart(2, "0");
    return {
      id: `page-${n}`,
      name: `Fixture Whisky ${n}`,
      photoUrl: "/bottles/glenallachie-12.svg",
      origin: "Scotch" as Origin,
      distillery: "Fixture Distillery",
      country: "Шотландия",
    };
  });

  return createInMemoryHomeStore({
    whiskies: [
      {
        id: "buy",
        name: "Fixture Buy Bottle",
        photoUrl: "/bottles/glenallachie-12.svg",
        origin: "Scotch",
        distillery: "Buy Distillery",
        country: "Шотландия",
        region: "Speyside",
      },
      {
        id: "ask",
        name: "Fixture Ask Bottle",
        photoUrl: "/bottles/glenallachie-12.svg",
        origin: "Scotch",
        distillery: "Ask Distillery",
        country: "Шотландия",
      },
      {
        id: "draft",
        name: "Fixture Draft Bottle",
        photoUrl: "/bottles/glenallachie-12.svg",
        origin: "Scotch",
        published: false,
        distillery: "Draft Distillery",
        country: "Шотландия",
      },
      ...pageWhiskies,
    ],
    primarySkus: [
      { whiskyId: "buy", priceEur: 55.2, quantity: 3 },
      { whiskyId: "ask", priceEur: 55, quantity: 0 },
      { whiskyId: "draft", priceEur: 40, quantity: 1 },
      ...pageWhiskies.map((whisky) => ({
        whiskyId: whisky.id,
        priceEur: 50,
        quantity: 1,
      })),
    ],
  });
}
