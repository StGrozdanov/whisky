import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop } from "./shop";

function shopWithSearchCatalogue() {
  return createShop({
    store: createInMemoryHomeStore({
      whiskies: [
        {
          id: "g12",
          name: "GlenAllachie 12",
          photoUrl: "/bottles/glenallachie-12.svg",
          origin: "Scotch",
          distillery: "GlenAllachie",
          country: "Шотландия",
          region: "Speyside",
          tagline: "sherry cask",
        },
        {
          id: "g18",
          name: "GlenAllachie 18",
          photoUrl: "/bottles/glenallachie-12.svg",
          origin: "Scotch",
          distillery: "GlenAllachie",
          country: "Шотландия",
          region: "Speyside",
        },
        {
          id: "buffalo",
          name: "Buffalo Trace",
          photoUrl: "/bottles/buffalo-trace.svg",
          origin: "Bourbon",
          distillery: "Buffalo Trace",
          country: "САЩ",
          region: "Kentucky",
          tagline: "sweet corn",
        },
        {
          id: "draft",
          name: "GlenDronach 12",
          photoUrl: "/bottles/glenallachie-12.svg",
          origin: "Scotch",
          published: false,
          distillery: "GlenDronach",
          country: "Шотландия",
          region: "Highlands",
        },
      ],
      primarySkus: [
        { whiskyId: "g12", priceEur: 55, quantity: 2 },
        { whiskyId: "g18", priceEur: 120, quantity: 1 },
        { whiskyId: "buffalo", priceEur: 35, quantity: 4 },
        { whiskyId: "draft", priceEur: 70, quantity: 1 },
      ],
    }),
  });
}

describe("Shop search", () => {
  it("matches published Whisky names only, and returns each full name", async () => {
    const shop = shopWithSearchCatalogue();

    const hits = await shop.search("glen");

    expect(
      hits.filter((hit) => hit.kind === "whisky").map((hit) => hit.name),
    ).toEqual(["GlenAllachie 12", "GlenAllachie 18"]);
    expect(await shop.search("sweet")).toEqual([]);
    expect(await shop.search("Scotch")).toEqual([]);
  });

  it("matches Distillery, Country, and Region names once each", async () => {
    const shop = shopWithSearchCatalogue();

    const glen = await shop.search("glen");
    expect(glen.filter((hit) => hit.kind === "distillery")).toEqual([
      { kind: "distillery", name: "GlenAllachie" },
    ]);

    const country = await shop.search("шотландия");
    expect(country.filter((hit) => hit.kind === "country")).toEqual([
      { kind: "country", name: "Шотландия" },
    ]);

    const region = await shop.search("spey");
    expect(region).toEqual([{ kind: "region", name: "Speyside" }]);
  });

  it("opens the Catalogue on an exact Whisky, Distillery, Country, or Region", async () => {
    const shop = shopWithSearchCatalogue();

    const byName = await shop.catalogue({ name: "GlenAllachie 12" });
    expect(byName.whiskies.map((item) => item.name)).toEqual([
      "GlenAllachie 12",
    ]);

    const byDistillery = await shop.catalogue({ distillery: "GlenAllachie" });
    expect(byDistillery.whiskies.map((item) => item.name)).toEqual([
      "GlenAllachie 12",
      "GlenAllachie 18",
    ]);

    const byCountry = await shop.catalogue({ country: "САЩ" });
    expect(byCountry.whiskies.map((item) => item.name)).toEqual([
      "Buffalo Trace",
    ]);

    const byRegion = await shop.catalogue({ region: "Speyside" });
    expect(byRegion.whiskies.map((item) => item.name)).toEqual([
      "GlenAllachie 12",
      "GlenAllachie 18",
    ]);
  });
});
