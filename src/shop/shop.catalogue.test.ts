import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop } from "./shop";

describe("Shop catalogue", () => {
  it("lists only published Whiskies in A–Z name order and excludes drafts", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "draft",
            name: "Zebra Draft",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            published: false,
            distillery: "Draft",
            country: "Шотландия",
          },
          {
            id: "b",
            name: "Buffalo Trace",
            photoUrl: "/bottles/buffalo-trace.svg",
            origin: "Bourbon",
            distillery: "Buffalo Trace",
            country: "САЩ",
          },
          {
            id: "a",
            name: "Aberlour 12",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "Aberlour",
            country: "Шотландия",
          },
        ],
        primarySkus: [
          { whiskyId: "draft", priceEur: 40, quantity: 1 },
          { whiskyId: "b", priceEur: 35, quantity: 2 },
          { whiskyId: "a", priceEur: 52, quantity: 3 },
        ],
      }),
    });

    const catalogue = await shop.catalogue({});

    expect(catalogue.totalCount).toBe(2);
    expect(catalogue.whiskies.map((item) => item.name)).toEqual([
      "Aberlour 12",
      "Buffalo Trace",
    ]);
  });

  it("paginates 24 Whiskies per page", async () => {
    const whiskies = Array.from({ length: 26 }, (_, index) => {
      const n = String(index + 1).padStart(2, "0");
      return {
        id: `w-${n}`,
        name: `Whisky ${n}`,
        photoUrl: "/bottles/glenallachie-12.svg",
        origin: "Scotch" as const,
        distillery: "Distillery",
        country: "Шотландия",
      };
    });
    const primarySkus = whiskies.map((whisky) => ({
      whiskyId: whisky.id,
      priceEur: 55,
      quantity: 1,
    }));

    const shop = createShop({
      store: createInMemoryHomeStore({ whiskies, primarySkus }),
    });

    const page1 = await shop.catalogue({ page: 1 });
    const page2 = await shop.catalogue({ page: 2 });

    expect(page1.totalCount).toBe(26);
    expect(page1.page).toBe(1);
    expect(page1.pageCount).toBe(2);
    expect(page1.whiskies).toHaveLength(24);
    expect(page1.whiskies[0]?.name).toBe("Whisky 01");
    expect(page1.whiskies[23]?.name).toBe("Whisky 24");

    expect(page2.page).toBe(2);
    expect(page2.whiskies).toHaveLength(2);
    expect(page2.whiskies[0]?.name).toBe("Whisky 25");
  });

  it("filters by Origin, Price tier, Age, min House score, and Experience with AND", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "match",
            name: "Match Scotch",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "Match",
            country: "Шотландия",
            ageYears: 12,
            houseScore: 9.4,
            experienceLevel: "advanced",
          },
          {
            id: "wrong-origin",
            name: "Irish No",
            photoUrl: "/bottles/redbreast-12.svg",
            origin: "Irish",
            distillery: "Irish",
            country: "Ирландия",
            ageYears: 12,
            houseScore: 9.4,
            experienceLevel: "advanced",
          },
          {
            id: "wrong-tier",
            name: "Cheap Scotch",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "Cheap",
            country: "Шотландия",
            ageYears: 12,
            houseScore: 9.4,
            experienceLevel: "advanced",
          },
          {
            id: "nas",
            name: "NAS Scotch",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "NAS",
            country: "Шотландия",
            ageYears: undefined,
            houseScore: 9.4,
            experienceLevel: "advanced",
          },
          {
            id: "low-score",
            name: "Low Score",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "Low",
            country: "Шотландия",
            ageYears: 12,
            houseScore: 8.5,
            experienceLevel: "advanced",
          },
          {
            id: "beginner",
            name: "Beginner Scotch",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "Beginner",
            country: "Шотландия",
            ageYears: 12,
            houseScore: 9.4,
            experienceLevel: "beginner",
          },
        ],
        primarySkus: [
          { whiskyId: "match", priceEur: 55, quantity: 1 },
          { whiskyId: "wrong-origin", priceEur: 55, quantity: 1 },
          { whiskyId: "wrong-tier", priceEur: 40, quantity: 1 },
          { whiskyId: "nas", priceEur: 55, quantity: 1 },
          { whiskyId: "low-score", priceEur: 55, quantity: 1 },
          { whiskyId: "beginner", priceEur: 55, quantity: 1 },
        ],
      }),
    });

    const catalogue = await shop.catalogue({
      origin: "Scotch",
      priceTier: "CORE",
      age: "declared",
      minScore: 9.3,
      experience: "advanced",
    });

    expect(catalogue.totalCount).toBe(1);
    expect(catalogue.whiskies[0]?.name).toBe("Match Scotch");
  });

  it("sets price and Price tier from the Primary SKU and Ask us when quantity is zero", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "buy",
            name: "Buy Me",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "Buy",
            country: "Шотландия",
          },
          {
            id: "ask",
            name: "Ask Me",
            photoUrl: "/bottles/buffalo-trace.svg",
            origin: "Bourbon",
            distillery: "Ask",
            country: "САЩ",
          },
          {
            id: "entry",
            name: "Entry Whisky",
            photoUrl: "/bottles/buffalo-trace.svg",
            origin: "Bourbon",
            distillery: "Entry",
            country: "САЩ",
          },
          {
            id: "signature",
            name: "Signature Whisky",
            photoUrl: "/bottles/yamazaki-reserve.svg",
            origin: "Japanese",
            distillery: "Signature",
            country: "Япония",
          },
          {
            id: "premium",
            name: "Premium Whisky",
            photoUrl: "/bottles/yamazaki-reserve.svg",
            origin: "Japanese",
            distillery: "Premium",
            country: "Япония",
          },
        ],
        primarySkus: [
          { whiskyId: "buy", priceEur: 55.2, quantity: 3 },
          { whiskyId: "ask", priceEur: 55, quantity: 0 },
          { whiskyId: "entry", priceEur: 50, quantity: 1 },
          { whiskyId: "signature", priceEur: 90.01, quantity: 1 },
          { whiskyId: "premium", priceEur: 140.01, quantity: 1 },
        ],
      }),
    });

    const catalogue = await shop.catalogue({});
    const byName = new Map(catalogue.whiskies.map((item) => [item.name, item]));

    expect(byName.get("Buy Me")).toMatchObject({
      priceEur: 55.2,
      priceTier: "CORE",
      action: "buy",
    });
    expect(byName.get("Ask Me")).toMatchObject({
      priceEur: 55,
      priceTier: "CORE",
      action: "ask-us",
    });
    expect(byName.get("Entry Whisky")?.priceTier).toBe("ENTRY");
    expect(byName.get("Signature Whisky")?.priceTier).toBe("SIGNATURE");
    expect(byName.get("Premium Whisky")?.priceTier).toBe("PREMIUM");
  });

  it("returns an empty published catalogue and an empty filtered result separately", async () => {
    const emptyShop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "draft",
            name: "Draft Only",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            published: false,
            distillery: "Draft",
            country: "Шотландия",
          },
        ],
        primarySkus: [{ whiskyId: "draft", priceEur: 40, quantity: 1 }],
      }),
    });

    const empty = await emptyShop.catalogue({});
    expect(empty.totalCount).toBe(0);
    expect(empty.whiskies).toEqual([]);
    expect(empty.pageCount).toBe(0);

    const filteredShop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "irish",
            name: "Irish Only",
            photoUrl: "/bottles/redbreast-12.svg",
            origin: "Irish",
            distillery: "Irish",
            country: "Ирландия",
          },
        ],
        primarySkus: [{ whiskyId: "irish", priceEur: 40, quantity: 1 }],
      }),
    });

    const noMatches = await filteredShop.catalogue({ origin: "Japanese" });
    expect(noMatches.totalCount).toBe(0);
    expect(noMatches.whiskies).toEqual([]);
  });

  it("omits unpublished Whiskies from Home rails", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "live",
            name: "Live Whisky",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            published: true,
          },
          {
            id: "hidden",
            name: "Hidden Whisky",
            photoUrl: "/bottles/buffalo-trace.svg",
            origin: "Bourbon",
            published: false,
          },
        ],
        housePick: {
          whiskyId: "hidden",
          story: "Should not show",
        },
        promotions: [
          {
            whiskyId: "hidden",
            discountedPriceEur: 30,
            priorPriceEur: 40,
            sortOrder: 1,
          },
          {
            whiskyId: "live",
            discountedPriceEur: 40,
            priorPriceEur: 50,
            sortOrder: 2,
          },
        ],
      }),
    });

    const home = await shop.home();
    expect(home.housePick).toBeUndefined();
    expect(home.promotions).toHaveLength(1);
    expect(home.promotions[0]?.whisky.name).toBe("Live Whisky");
  });

  it("shows an in-stock SKU price when the Primary SKU is Ask us, and keeps the Primary tier", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "split",
            name: "Split Availability",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "Split",
            country: "Шотландия",
          },
        ],
        primarySkus: [{ whiskyId: "split", priceEur: 100, quantity: 0 }],
        skus: [
          { id: "sku-b", whiskyId: "split", priceEur: 40, quantity: 2 },
          { id: "sku-a", whiskyId: "split", priceEur: 18, quantity: 4 },
        ],
      }),
    });

    const catalogue = await shop.catalogue({});

    expect(catalogue.whiskies[0]).toMatchObject({
      priceEur: 18,
      priceTier: "SIGNATURE",
      action: "buy",
    });
  });

  it("uses House score for Displayed score, otherwise the Tasting average", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "house",
            name: "House Wins",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            distillery: "House",
            country: "Шотландия",
            houseScore: 8.0,
            tastingAverage: 9.6,
          },
          {
            id: "tastings",
            name: "Tasting Average",
            photoUrl: "/bottles/redbreast-12.svg",
            origin: "Irish",
            distillery: "Tasting",
            country: "Ирландия",
            tastingAverage: 9.4,
          },
          {
            id: "none",
            name: "No Score",
            photoUrl: "/bottles/buffalo-trace.svg",
            origin: "Bourbon",
            distillery: "None",
            country: "САЩ",
          },
        ],
        primarySkus: [
          { whiskyId: "house", priceEur: 55, quantity: 1 },
          { whiskyId: "tastings", priceEur: 55, quantity: 1 },
          { whiskyId: "none", priceEur: 55, quantity: 1 },
        ],
      }),
    });

    const all = await shop.catalogue({});
    const byName = new Map(all.whiskies.map((whisky) => [whisky.name, whisky]));
    expect(byName.get("House Wins")?.displayedScore).toBe(8.0);
    expect(byName.get("Tasting Average")?.displayedScore).toBe(9.4);
    expect(byName.get("No Score")?.displayedScore).toBeUndefined();

    const filtered = await shop.catalogue({ minScore: 9.3 });
    expect(filtered.whiskies.map((whisky) => whisky.name)).toEqual([
      "Tasting Average",
    ]);
  });

  it("uses the first photo as the Catalogue image", async () => {
    const shop = createShop({
      store: createInMemoryHomeStore({
        whiskies: [
          {
            id: "photos",
            name: "Ordered Photos",
            photoUrl: "/bottles/glenallachie-12.svg",
            photoUrls: [
              "/bottles/laphroaig-10.svg",
              "/bottles/redbreast-12.svg",
            ],
            origin: "Scotch",
            distillery: "Photos",
            country: "Шотландия",
          },
        ],
        primarySkus: [{ whiskyId: "photos", priceEur: 55, quantity: 1 }],
      }),
    });

    const catalogue = await shop.catalogue({});
    expect(catalogue.whiskies[0]?.photoUrl).toBe("/bottles/laphroaig-10.svg");
  });
});
