export const ORIGINS = ["Irish", "Scotch", "Bourbon", "Japanese"] as const;
export type Origin = (typeof ORIGINS)[number];

export const FLAVOUR_TAGS = [
  "ванилия",
  "мед",
  "карамел",
  "шоколад",
  "сушени плодове",
  "цитрус",
  "ябълка",
  "круша",
  "тропически",
] as const;
export type FlavourTag = (typeof FLAVOUR_TAGS)[number];

export const SWEETNESS_VALUES = ["сухо", "балансирано", "сладко"] as const;
export type Sweetness = (typeof SWEETNESS_VALUES)[number];

export const SMOKE_VALUES = ["без", "лек", "среден", "силен"] as const;
export type Smoke = (typeof SMOKE_VALUES)[number];

export type HouseTasting = {
  nose: string;
  taste: string;
  aftertaste: string;
  flavourTags: FlavourTag[];
  sweetness: Sweetness;
  smoke: Smoke;
};

export type SkuInput = {
  size: string;
  priceEuro: number;
  quantity: number;
};

export type ListWhiskyInput = {
  name: string;
  photoUrl: string;
  origin: Origin;
  houseTasting: HouseTasting;
  sku: SkuInput;
};

export type ListedWhisky = ListWhiskyInput;

export type CatalogueWhisky = {
  name: string;
  photoUrl: string;
  origin: Origin;
  priceEuro: number;
};

export type CatalogueFilter = {
  origin?: Origin;
  flavourTags?: FlavourTag[];
};

export type CatalogueStore = {
  save(whisky: ListedWhisky): void;
  all(): ListedWhisky[];
};
