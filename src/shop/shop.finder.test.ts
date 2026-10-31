import { describe, expect, it } from "vitest";
import { createInMemoryHomeStore } from "./in-memory-home-store";
import { createShop } from "./shop";

describe("Shop Finder candidates", () => {
  it("lists every published Catalogue Whisky with its research facts, unpaginated", async () => {
    const many = Array.from({ length: 30 }, (_, index) => ({
      id: `w-${String(index).padStart(2, "0")}`,
      name: `Whisky ${String(index).padStart(2, "0")}`,
      photoUrl: "/bottles/glenallachie-12.svg",
      origin: "Scotch" as const,
    }));
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
            region: "Speyside",
            ageYears: 12,
            abv: 46,
          },
          {
            id: "draft",
            name: "Draft",
            photoUrl: "/bottles/glenallachie-12.svg",
            origin: "Scotch",
            published: false,
          },
          ...many,
        ],
        primarySkus: [
          { whiskyId: "glen", priceEur: 55.2, quantity: 0 },
          { whiskyId: "draft", priceEur: 30, quantity: 2 },
          ...many.map((whisky) => ({
            whiskyId: whisky.id,
            priceEur: 30,
            quantity: 1,
          })),
        ],
      }),
    });

    const candidates = await shop.finderCandidates();

    expect(candidates).toHaveLength(31);
    expect(candidates.map((candidate) => candidate.whisky.id)).not.toContain(
      "draft",
    );
    const glen = candidates.find((candidate) => candidate.whisky.id === "glen");
    expect(glen).toMatchObject({
      distillery: "GlenAllachie",
      country: "Шотландия",
      region: "Speyside",
      whisky: {
        name: "GlenAllachie 12",
        priceTier: "CORE",
        action: "ask-us",
        ageYears: 12,
        abv: 46,
      },
    });
  });
});
