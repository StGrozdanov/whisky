export const ORIGINS = ["Irish", "Scotch", "Bourbon", "Japanese"] as const;
export type Origin = (typeof ORIGINS)[number];

export const PRICE_TIERS = ["ENTRY", "CORE", "SIGNATURE", "PREMIUM"] as const;
export type PriceTier = (typeof PRICE_TIERS)[number];

export const EXPERIENCE_LEVELS = ["beginner", "advanced"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

type CatalogueAction = "buy" | "ask-us";

export type CatalogueAgeFilter = "declared" | "nas";

export type CatalogueQuery = {
  origin?: Origin;
  priceTier?: PriceTier;
  age?: CatalogueAgeFilter;
  minScore?: 9.0 | 9.3 | 9.5;
  experience?: ExperienceLevel;
  name?: string;
  distillery?: string;
  country?: string;
  region?: string;
  page?: number;
};

export type CatalogueCard = {
  id: string;
  name: string;
  photoUrl: string;
  origin: Origin;
  abv: number | undefined;
  ageYears: number | undefined;
  experienceLevel: ExperienceLevel | undefined;
  displayedScore: number | undefined;
  tagline: string | undefined;
  priceEur: number;
  priceTier: PriceTier;
  action: CatalogueAction;
};

export type CataloguePage = {
  whiskies: CatalogueCard[];
  totalCount: number;
  page: number;
  pageCount: number;
};

export const SEARCH_HIT_KINDS = [
  "whisky",
  "distillery",
  "country",
  "region",
] as const;
export type SearchHitKind = (typeof SEARCH_HIT_KINDS)[number];

export type SearchHit = {
  kind: SearchHitKind;
  name: string;
};

export const SEARCH_HIT_FILTER = {
  whisky: "name",
  distillery: "distillery",
  country: "country",
  region: "region",
} as const satisfies Record<
  SearchHitKind,
  "name" | "distillery" | "country" | "region"
>;

export type HomeWhisky = {
  id: string;
  name: string;
  photoUrl: string;
  origin: Origin;
  abv: number | undefined;
  nonChillFiltered: boolean | undefined;
};

export type HousePickNote = {
  authorName: string;
  authorRole: string | undefined;
  score: number | undefined;
  quote: string;
};

export type HousePick = {
  whisky: HomeWhisky;
  story: string;
  monthLabel: string | undefined;
  youtubeUrl: string | undefined;
  note: HousePickNote | undefined;
  displayPriceEur: number | undefined;
};

export type HomePromotion = {
  whisky: HomeWhisky;
  discountedPriceEur: number;
  priorPriceEur: number;
  savingsEur: number;
  discountPercent: number;
};

export type HomeNewWhisky = {
  whisky: HomeWhisky;
  displayPriceEur: number;
  badge: string;
  note: string;
};

type HomeDiscoveryPackLineupItem = {
  name: string;
  detail: string;
};

export type HomeDiscoveryPack = {
  title: string;
  photoUrl: string;
  priceEur: number;
  lineup: HomeDiscoveryPackLineupItem[];
};

export type HomePage = {
  housePick: HousePick | undefined;
  promotions: HomePromotion[];
  newWhiskies: HomeNewWhisky[];
  discoveryPacks: HomeDiscoveryPack[];
};

export type StoredWhisky = {
  id: string;
  name: string;
  photoUrl: string;
  origin: Origin;
  abv: number | undefined;
  nonChillFiltered: boolean | undefined;
  published: boolean;
  distillery: string;
  country: string;
  region: string | undefined;
  ageYears: number | undefined;
  experienceLevel: ExperienceLevel | undefined;
  houseScore: number | undefined;
  tastingAverage: number | undefined;
  tagline: string | undefined;
  photoUrls: string[];
  photoCaptions: string[];
  description: string | undefined;
  naturalColour: boolean | undefined;
  houseVideoUrl: string | undefined;
};

export type StoredSku = {
  id: string;
  whiskyId: string;
  priceEur: number;
  quantity: number;
  isPrimary: boolean;
  volumeMl: number;
};

export type StoredWhiskyAward = {
  title: string;
  organisation: string;
  year: number;
  category: string;
};

export type StoredWhiskyTasting = {
  authorFirstName: string;
  authorLastName: string;
  text: string;
  score: number | undefined;
  verifiedPurchase: boolean;
};

export type StoredWhiskyPairing = {
  eyebrow: string;
  title: string;
  body: string;
  photoUrl: string;
  sortOrder: number;
};

export type StoredWhiskyRelatedSet = {
  title: string;
  description: string;
  priceEur: number;
  photoUrl: string;
};

export type StoredWhiskyPageExtras = {
  whiskyId: string;
  awards: StoredWhiskyAward[];
  tastings: StoredWhiskyTasting[];
  pairings: StoredWhiskyPairing[];
  relatedSet: StoredWhiskyRelatedSet | undefined;
};

export type WhiskyPhoto = {
  url: string;
  caption: string | undefined;
};

type WhiskySkuAction = "buy" | "ask-us";

export type WhiskyPageSku = {
  id: string;
  volumeMl: number;
  priceEur: number;
  action: WhiskySkuAction;
  isPrimary: boolean;
};

export type WhiskyPageAward = StoredWhiskyAward;

export type WhiskyPageTasting = {
  authorName: string;
  text: string;
  score: number | undefined;
  verifiedPurchase: boolean;
};

export type WhiskyPagePairing = {
  eyebrow: string;
  title: string;
  body: string;
  photoUrl: string;
};

export type WhiskyPageRelatedSet = StoredWhiskyRelatedSet;

export type WhiskyPage = {
  id: string;
  name: string;
  distillery: string;
  country: string;
  region: string | undefined;
  description: string | undefined;
  photos: WhiskyPhoto[];
  abv: number | undefined;
  ageYears: number | undefined;
  naturalColour: boolean | undefined;
  nonChillFiltered: boolean | undefined;
  houseScore: number | undefined;
  displayedScore: number | undefined;
  priceTier: PriceTier;
  houseVideoUrl: string | undefined;
  skus: WhiskyPageSku[];
  defaultSkuId: string;
  awards: WhiskyPageAward[];
  tastings: WhiskyPageTasting[];
  pairings: WhiskyPagePairing[];
  relatedSet: WhiskyPageRelatedSet | undefined;
};

export type StoredCatalogueEntry = {
  whisky: StoredWhisky;
  skus: StoredSku[];
};

type StoredHousePickNote = {
  authorName: string | undefined;
  authorRole: string | undefined;
  score: number | undefined;
  quote: string | undefined;
};

export type StoredHousePick = {
  whiskyId: string;
  story: string;
  monthLabel: string | undefined;
  youtubeUrl: string | undefined;
  note: StoredHousePickNote | undefined;
  displayPriceEur: number | undefined;
};

export type StoredHomePromotion = {
  whiskyId: string;
  discountedPriceEur: number;
  priorPriceEur: number;
  startsAt: Date | undefined;
  endsAt: Date | undefined;
  sortOrder: number;
};

export type StoredHomeNewWhisky = {
  whiskyId: string;
  displayPriceEur: number;
  badge: string;
  note: string;
  sortOrder: number;
};

export type StoredDiscoveryPackItem = {
  name: string;
  detail: string;
  sortOrder: number;
};

export type StoredDiscoveryPack = {
  id: string;
  title: string;
  photoUrl: string;
  priceEur: number;
  sortOrder: number;
  lineup: StoredDiscoveryPackItem[];
};

export type ShopStore = {
  allWhiskies(): Promise<StoredWhisky[]>;
  catalogueEntries(): Promise<StoredCatalogueEntry[]>;
  whiskyPageExtras(whiskyId: string): Promise<StoredWhiskyPageExtras>;
  currentHousePick(): Promise<StoredHousePick | undefined>;
  promotions(): Promise<StoredHomePromotion[]>;
  newWhiskies(): Promise<StoredHomeNewWhisky[]>;
  discoveryPacks(): Promise<StoredDiscoveryPack[]>;
};

export type Clock = {
  now(): Date;
};
