import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop } from "./shop";

const NOW = new Date("2026-10-30T12:00:00.000Z");

const redbreast = {
  id: "redbreast",
  name: "Redbreast 12",
  photoUrl: "/bottles/redbreast-12.svg",
  origin: "Irish" as const,
  abv: 40,
  distillery: "Midleton",
  country: "Ирландия",
};

describe("Shop promotions", () => {
  it("shows regular, discounted, and prior price for an active Promotion of an In-stock SKU", async () => {
    const endsAt = new Date("2026-11-30T22:00:00.000Z");
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [redbreast],
        primarySkus: [
          {
            id: "redbreast-700",
            whiskyId: "redbreast",
            priceEur: 52,
            quantity: 3,
          },
        ],
        promotions: [
          {
            whiskyId: "redbreast",
            skuId: "redbreast-700",
            discountedPriceEur: 42.5,
            priorPriceEur: 50,
            startsAt: new Date("2026-10-01T00:00:00.000Z"),
            endsAt,
            sortOrder: 1,
          },
        ],
      }),
      clock: { now: () => NOW },
    });

    expect(await shop.promotions()).toEqual([
      {
        whisky: {
          id: "redbreast",
          name: "Redbreast 12",
          photoUrl: "/bottles/redbreast-12.svg",
          origin: "Irish",
          abv: 40,
          nonChillFiltered: undefined,
        },
        skuId: "redbreast-700",
        volumeMl: 700,
        regularPriceEur: 52,
        discountedPriceEur: 42.5,
        priorPriceEur: 50,
        savingsEur: 7.5,
        discountPercent: 15,
        endsAt,
        action: "buy",
      },
    ]);
  });

  it("offers Ask us when the promoted SKU is not In stock", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [redbreast],
        primarySkus: [
          {
            id: "redbreast-700",
            whiskyId: "redbreast",
            priceEur: 52,
            quantity: 0,
          },
        ],
        promotions: [
          {
            whiskyId: "redbreast",
            skuId: "redbreast-700",
            discountedPriceEur: 42.5,
            priorPriceEur: 50,
            sortOrder: 1,
          },
        ],
      }),
      clock: { now: () => NOW },
    });

    const promotions = await shop.promotions();

    expect(promotions.map((promotion) => promotion.action)).toEqual(["ask-us"]);
  });

  it("lists only active Promotions, including ones not selected for Home", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          redbreast,
          { ...redbreast, id: "expired", name: "Expired" },
          { ...redbreast, id: "future", name: "Future" },
          { ...redbreast, id: "unfeatured", name: "Not on Home" },
        ],
        primarySkus: [
          { whiskyId: "redbreast", priceEur: 52, quantity: 1 },
          { whiskyId: "expired", priceEur: 52, quantity: 1 },
          { whiskyId: "future", priceEur: 52, quantity: 1 },
          { whiskyId: "unfeatured", priceEur: 52, quantity: 1 },
        ],
        promotions: [
          {
            whiskyId: "expired",
            discountedPriceEur: 40,
            priorPriceEur: 50,
            endsAt: new Date("2026-10-30T12:00:00.000Z"),
            sortOrder: 1,
          },
          {
            whiskyId: "future",
            discountedPriceEur: 40,
            priorPriceEur: 50,
            startsAt: new Date("2026-11-01T00:00:00.000Z"),
            sortOrder: 2,
          },
          {
            whiskyId: "unfeatured",
            discountedPriceEur: 40,
            priorPriceEur: 50,
            featuredOnHome: false,
            sortOrder: 3,
          },
          {
            whiskyId: "redbreast",
            discountedPriceEur: 42.5,
            priorPriceEur: 50,
            sortOrder: 4,
          },
        ],
      }),
      clock: { now: () => NOW },
    });

    const promotions = await shop.promotions();
    const home = await shop.home();

    expect(promotions.map((promotion) => promotion.whisky.name)).toEqual([
      "Not on Home",
      "Redbreast 12",
    ]);
    expect(home.promotions.map((promotion) => promotion.whisky.name)).toEqual([
      "Redbreast 12",
    ]);
  });

  it("hides a Promotion that does not reduce the SKU's regular price", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [redbreast],
        primarySkus: [{ whiskyId: "redbreast", priceEur: 45, quantity: 1 }],
        promotions: [
          {
            whiskyId: "redbreast",
            discountedPriceEur: 45,
            priorPriceEur: 50,
            sortOrder: 1,
          },
        ],
      }),
      clock: { now: () => NOW },
    });

    expect(await shop.promotions()).toEqual([]);
    expect((await shop.home()).promotions).toEqual([]);
  });

  it("hides Promotions of draft Whiskies and unknown SKUs", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          redbreast,
          { ...redbreast, id: "draft", name: "Draft", published: false },
        ],
        primarySkus: [
          { whiskyId: "redbreast", priceEur: 52, quantity: 1 },
          { whiskyId: "draft", priceEur: 52, quantity: 1 },
        ],
        promotions: [
          {
            whiskyId: "draft",
            discountedPriceEur: 40,
            priorPriceEur: 50,
            sortOrder: 1,
          },
          {
            whiskyId: "redbreast",
            skuId: "missing-sku",
            discountedPriceEur: 40,
            priorPriceEur: 50,
            sortOrder: 2,
          },
        ],
      }),
      clock: { now: () => NOW },
    });

    expect(await shop.promotions()).toEqual([]);
  });
});
