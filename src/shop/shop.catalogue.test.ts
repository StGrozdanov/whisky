import { describe, expect, it } from "vitest";
import { createInMemoryCatalogueStore } from "@/shop/in-memory-catalogue-store";
import { createShop } from "@/shop/shop";
import type { ListWhiskyInput } from "@/shop/types";

function glenAllachie12(
  overrides: Partial<ListWhiskyInput> = {},
): ListWhiskyInput {
  return {
    name: "GlenAllachie 12",
    photoUrl: "https://cdn.example.com/bottles/glenallachie-12.jpg",
    origin: "Scotch",
    houseTasting: {
      nose: "Ванилия и мед",
      taste: "Карамел и сушени плодове",
      aftertaste: "Дълъг и топъл",
      flavourTags: ["ванилия", "мед", "карамел"],
      sweetness: "сладко",
      smoke: "без",
    },
    sku: {
      size: "700ml",
      priceEuro: 58,
      quantity: 4,
    },
    ...overrides,
  };
}

describe("Shop catalogue", () => {
  it("returns an empty catalogue when no Whiskies are listed", () => {
    const shop = createShop({ store: createInMemoryCatalogueStore() });

    expect(shop.catalogue()).toEqual([]);
  });

  it("lists an In-stock Whisky with photo, Origin, and the SKU Buy price", () => {
    const shop = createShop({ store: createInMemoryCatalogueStore() });

    shop.listWhisky(glenAllachie12());

    expect(shop.catalogue()).toEqual([
      {
        name: "GlenAllachie 12",
        photoUrl: "https://cdn.example.com/bottles/glenallachie-12.jpg",
        origin: "Scotch",
        priceEuro: 58,
      },
    ]);
  });

  it("still lists a quantity-zero Whisky with the Ask-us SKU price", () => {
    const shop = createShop({ store: createInMemoryCatalogueStore() });

    shop.listWhisky(
      glenAllachie12({ sku: { size: "700ml", priceEuro: 58, quantity: 0 } }),
    );

    expect(shop.catalogue()).toEqual([
      {
        name: "GlenAllachie 12",
        photoUrl: "https://cdn.example.com/bottles/glenallachie-12.jpg",
        origin: "Scotch",
        priceEuro: 58,
      },
    ]);
  });

  it("filters the Catalogue by Origin", () => {
    const shop = createShop({ store: createInMemoryCatalogueStore() });

    shop.listWhisky(glenAllachie12());
    shop.listWhisky({
      name: "Redbreast 12",
      photoUrl: "https://cdn.example.com/bottles/redbreast-12.jpg",
      origin: "Irish",
      houseTasting: {
        nose: "Плодове и подправки",
        taste: "Мед и дъб",
        aftertaste: "Дълъг",
        flavourTags: ["мед", "сушени плодове"],
        sweetness: "балансирано",
        smoke: "без",
      },
      sku: { size: "700ml", priceEuro: 62, quantity: 2 },
    });

    expect(shop.catalogue({ origin: "Irish" })).toEqual([
      {
        name: "Redbreast 12",
        photoUrl: "https://cdn.example.com/bottles/redbreast-12.jpg",
        origin: "Irish",
        priceEuro: 62,
      },
    ]);
  });

  it("filters the Catalogue by Flavour tags with OR matching", () => {
    const shop = createShop({ store: createInMemoryCatalogueStore() });

    shop.listWhisky(glenAllachie12());
    shop.listWhisky({
      name: "Yamazaki Distiller's Reserve",
      photoUrl: "https://cdn.example.com/bottles/yamazaki-reserve.jpg",
      origin: "Japanese",
      houseTasting: {
        nose: "Цветове и цитрус",
        taste: "Ябълка и мед",
        aftertaste: "Мек",
        flavourTags: ["цитрус", "ябълка", "мед"],
        sweetness: "балансирано",
        smoke: "без",
      },
      sku: { size: "700ml", priceEuro: 95, quantity: 1 },
    });
    shop.listWhisky({
      name: "Buffalo Trace",
      photoUrl: "https://cdn.example.com/bottles/buffalo-trace.jpg",
      origin: "Bourbon",
      houseTasting: {
        nose: "Царевица и дъб",
        taste: "Карамел",
        aftertaste: "Кратко",
        flavourTags: ["карамел"],
        sweetness: "сладко",
        smoke: "без",
      },
      sku: { size: "700ml", priceEuro: 32, quantity: 6 },
    });

    expect(shop.catalogue({ flavourTags: ["ванилия", "цитрус"] })).toEqual([
      {
        name: "GlenAllachie 12",
        photoUrl: "https://cdn.example.com/bottles/glenallachie-12.jpg",
        origin: "Scotch",
        priceEuro: 58,
      },
      {
        name: "Yamazaki Distiller's Reserve",
        photoUrl: "https://cdn.example.com/bottles/yamazaki-reserve.jpg",
        origin: "Japanese",
        priceEuro: 95,
      },
    ]);
  });

  it("applies Origin and Flavour-tag OR filters together", () => {
    const shop = createShop({ store: createInMemoryCatalogueStore() });

    shop.listWhisky(glenAllachie12());
    shop.listWhisky({
      name: "Laphroaig 10",
      photoUrl: "https://cdn.example.com/bottles/laphroaig-10.jpg",
      origin: "Scotch",
      houseTasting: {
        nose: "Морска сол и торф",
        taste: "Дим и йод",
        aftertaste: "Дълъг и опушен",
        flavourTags: ["шоколад"],
        sweetness: "сухо",
        smoke: "силен",
      },
      sku: { size: "700ml", priceEuro: 48, quantity: 3 },
    });
    shop.listWhisky({
      name: "Redbreast 12",
      photoUrl: "https://cdn.example.com/bottles/redbreast-12.jpg",
      origin: "Irish",
      houseTasting: {
        nose: "Плодове и подправки",
        taste: "Мед и дъб",
        aftertaste: "Дълъг",
        flavourTags: ["мед", "ванилия"],
        sweetness: "балансирано",
        smoke: "без",
      },
      sku: { size: "700ml", priceEuro: 62, quantity: 2 },
    });

    expect(
      shop.catalogue({ origin: "Scotch", flavourTags: ["ванилия", "мед"] }),
    ).toEqual([
      {
        name: "GlenAllachie 12",
        photoUrl: "https://cdn.example.com/bottles/glenallachie-12.jpg",
        origin: "Scotch",
        priceEuro: 58,
      },
    ]);
  });
});
