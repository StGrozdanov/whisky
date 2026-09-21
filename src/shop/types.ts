const ORIGINS = ["Irish", "Scotch", "Bourbon", "Japanese"] as const;
export type Origin = (typeof ORIGINS)[number];

export type HomeWhisky = {
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

export type HomeStore = {
  allWhiskies(): Promise<StoredWhisky[]>;
  currentHousePick(): Promise<StoredHousePick | undefined>;
  promotions(): Promise<StoredHomePromotion[]>;
  newWhiskies(): Promise<StoredHomeNewWhisky[]>;
  discoveryPacks(): Promise<StoredDiscoveryPack[]>;
};

export type Clock = {
  now(): Date;
};
