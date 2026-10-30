import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop } from "./shop";

describe("Shop whisky page", () => {
  it("returns undefined for unknown and draft Whiskies", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "draft",
            name: "Draft",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            published: false,
            distillery: "Draft",
            country: "Шотландия",
          },
          {
            id: "live",
            name: "Live",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "Live",
            country: "Шотландия",
          },
        ],
        primarySkus: [
          { whiskyId: "draft", priceEur: 40, quantity: 1 },
          { whiskyId: "live", priceEur: 55, quantity: 2 },
        ],
      }),
    });

    expect(await shop.whisky("missing")).toBeUndefined();
    expect(await shop.whisky("draft")).toBeUndefined();
  });

  it("maps a complete published Whisky with editorial blocks", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "full",
            name: "Fixture Complete",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "Complete Distillery",
            country: "Шотландия",
            region: "Speyside",
            abv: 46,
            ageYears: 12,
            nonChillFiltered: true,
            naturalColour: true,
            houseScore: 9.3,
            description: "Full story.",
            houseVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            photoUrls: [
              "/bottles/glenallachie-12.svg",
              "/bottles/buffalo-trace.svg",
            ],
            photoCaptions: ["Фронтален", "Кутия"],
          },
        ],
        primarySkus: [{ whiskyId: "full", priceEur: 55.2, quantity: 3 }],
        skus: [
          {
            id: "sample",
            whiskyId: "full",
            priceEur: 14.5,
            quantity: 5,
            volumeMl: 50,
          },
        ],
        whiskyPages: [
          {
            whiskyId: "full",
            awards: [
              {
                title: "Златен медал",
                organisation: "San Francisco WSC",
                year: 2023,
                category: "Single Malt",
              },
            ],
            tastings: [
              {
                authorFirstName: "Иван",
                authorLastName: "Петров",
                text: "Отличен малц.",
                score: 9,
                verifiedPurchase: true,
              },
            ],
            pairings: [
              {
                eyebrow: "Шоколад",
                title: "Крафт шоколад",
                body: "Баланс.",
                photoUrl: "/bottles/glenallachie-12.svg",
                sortOrder: 0,
              },
            ],
            relatedSet: {
              title: "Шери Трилогия",
              description: "3 x 50ml",
              priceEur: 18.25,
              photoUrl: "/bottles/glenallachie-12.svg",
            },
          },
        ],
      }),
    });

    const page = await shop.whisky("full");
    expect(page).toBeDefined();
    if (!page) {
      return;
    }

    expect(page.name).toBe("Fixture Complete");
    expect(page.country).toBe("Шотландия");
    expect(page.region).toBe("Speyside");
    expect(page.description).toBe("Full story.");
    expect(page.photos).toEqual([
      { url: "/bottles/glenallachie-12.svg", caption: "Фронтален" },
      { url: "/bottles/buffalo-trace.svg", caption: "Кутия" },
    ]);
    expect(page.houseScore).toBe(9.3);
    expect(page.abv).toBe(46);
    expect(page.ageYears).toBe(12);
    expect(page.naturalColour).toBe(true);
    expect(page.nonChillFiltered).toBe(true);
    expect(page.houseVideoUrl).toContain("youtube.com");
    expect(page.awards).toHaveLength(1);
    expect(page.tastings[0]?.authorName).toBe("Иван Петров");
    expect(page.pairings).toHaveLength(1);
    expect(page.relatedSet?.priceEur).toBe(18.25);
    expect(page.skus).toHaveLength(2);
    expect(page.defaultSkuId).toBe(page.skus.find((s) => s.isPrimary)?.id);
    expect(page.skus.find((s) => s.volumeMl === 700)?.action).toBe("buy");
  });

  it("omits optional editorial when data is absent", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "partial",
            name: "Fixture Partial",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "Partial",
            country: "Шотландия",
            abv: 40,
            tastingAverage: 8.2,
          },
        ],
        primarySkus: [{ whiskyId: "partial", priceEur: 50, quantity: 1 }],
      }),
    });

    const page = await shop.whisky("partial");
    expect(page).toBeDefined();
    if (!page) {
      return;
    }

    expect(page.description).toBeUndefined();
    expect(page.houseVideoUrl).toBeUndefined();
    expect(page.awards).toEqual([]);
    expect(page.tastings).toEqual([]);
    expect(page.pairings).toEqual([]);
    expect(page.relatedSet).toBeUndefined();
    expect(page.houseScore).toBeUndefined();
    expect(page.naturalColour).toBeUndefined();
    expect(page.nonChillFiltered).toBeUndefined();
    expect(page.abv).toBe(40);
    expect(page.ageYears).toBeUndefined();
  });

  it("marks out-of-stock SKUs as ask-us", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "ask",
            name: "Fixture Ask",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "Ask",
            country: "Шотландия",
          },
        ],
        primarySkus: [{ whiskyId: "ask", priceEur: 55, quantity: 0 }],
      }),
    });

    const page = await shop.whisky("ask");
    expect(page?.skus[0]?.action).toBe("ask-us");
  });

  it("attaches only an active Promotion to its SKU", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "glen",
            name: "GlenAllachie 12",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
          },
        ],
        primarySkus: [
          { id: "glen-700", whiskyId: "glen", priceEur: 55.2, quantity: 2 },
        ],
        skus: [
          {
            id: "glen-50",
            whiskyId: "glen",
            priceEur: 9,
            quantity: 2,
            volumeMl: 50,
          },
        ],
        promotions: [
          {
            whiskyId: "glen",
            skuId: "glen-700",
            discountedPriceEur: 49.9,
            priorPriceEur: 54,
            sortOrder: 1,
          },
          {
            whiskyId: "glen",
            skuId: "glen-50",
            discountedPriceEur: 7,
            priorPriceEur: 9,
            endsAt: new Date("2020-01-01T00:00:00.000Z"),
            sortOrder: 2,
          },
        ],
      }),
      clock: { now: () => new Date("2026-10-30T12:00:00.000Z") },
    });

    const page = await shop.whisky("glen");

    expect(page?.skus.map((sku) => [sku.id, sku.promotion])).toEqual([
      ["glen-700", { discountedPriceEur: 49.9, priorPriceEur: 54 }],
      ["glen-50", undefined],
    ]);
  });
});
