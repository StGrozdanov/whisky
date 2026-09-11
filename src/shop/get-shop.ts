import { createInMemoryCatalogueStore } from "./in-memory-catalogue-store";
import { createShop, type Shop } from "./shop";
import type { ListWhiskyInput } from "./types";

export const catalogueSeed: ListWhiskyInput[] = [
  {
    name: "GlenAllachie 12",
    photoUrl: "/bottles/glenallachie-12.svg",
    origin: "Scotch",
    houseTasting: {
      nose: "Ванилия, мед и дъб",
      taste: "Карамел и сушени плодове",
      aftertaste: "Дълъг и топъл",
      flavourTags: ["ванилия", "мед", "карамел", "сушени плодове"],
      sweetness: "сладко",
      smoke: "без",
    },
    sku: { size: "700ml", priceEuro: 58, quantity: 4 },
  },
  {
    name: "Redbreast 12",
    photoUrl: "/bottles/redbreast-12.svg",
    origin: "Irish",
    houseTasting: {
      nose: "Плодове и подправки",
      taste: "Мед, ванилия и дъб",
      aftertaste: "Дълъг и кадифен",
      flavourTags: ["мед", "ванилия", "сушени плодове"],
      sweetness: "балансирано",
      smoke: "без",
    },
    sku: { size: "700ml", priceEuro: 62, quantity: 2 },
  },
  {
    name: "Buffalo Trace",
    photoUrl: "/bottles/buffalo-trace.svg",
    origin: "Bourbon",
    houseTasting: {
      nose: "Царевица и дъб",
      taste: "Карамел и ванилия",
      aftertaste: "Средно дълъг",
      flavourTags: ["карамел", "ванилия"],
      sweetness: "сладко",
      smoke: "без",
    },
    sku: { size: "700ml", priceEuro: 32, quantity: 6 },
  },
  {
    name: "Yamazaki Distiller's Reserve",
    photoUrl: "/bottles/yamazaki-reserve.svg",
    origin: "Japanese",
    houseTasting: {
      nose: "Цветове и цитрус",
      taste: "Ябълка и мед",
      aftertaste: "Мек и свеж",
      flavourTags: ["цитрус", "ябълка", "мед"],
      sweetness: "балансирано",
      smoke: "без",
    },
    sku: { size: "700ml", priceEuro: 95, quantity: 1 },
  },
  {
    name: "Laphroaig 10",
    photoUrl: "/bottles/laphroaig-10.svg",
    origin: "Scotch",
    houseTasting: {
      nose: "Морска сол и торф",
      taste: "Дим, йод и шоколад",
      aftertaste: "Дълъг и опушен",
      flavourTags: ["шоколад"],
      sweetness: "сухо",
      smoke: "силен",
    },
    sku: { size: "700ml", priceEuro: 48, quantity: 0 },
  },
];

let seededShop: Shop | undefined;

export function getShop(): Shop {
  if (seededShop) {
    return seededShop;
  }

  const shop = createShop({ store: createInMemoryCatalogueStore() });
  for (const whisky of catalogueSeed) {
    shop.listWhisky(whisky);
  }
  seededShop = shop;
  return shop;
}
