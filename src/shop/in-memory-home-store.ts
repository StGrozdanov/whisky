import type {
  ExperienceLevel,
  Origin,
  ShopStore,
  StoredCatalogueEntry,
  StoredDiscoveryPack,
  StoredDiscoveryPackItem,
  StoredHomeNewWhisky,
  StoredHomePromotion,
  StoredHousePick,
  StoredSku,
  StoredWhisky,
} from "./types";

type SeedWhisky = {
  id: string;
  name: string;
  photoUrl: string;
  origin: Origin;
  abv?: number;
  nonChillFiltered?: boolean;
  published?: boolean;
  distillery?: string;
  country?: string;
  region?: string;
  ageYears?: number;
  experienceLevel?: ExperienceLevel;
  houseScore?: number;
  tastingAverage?: number;
  tagline?: string;
  photoUrls?: string[];
};

type SeedSku = {
  id?: string;
  whiskyId: string;
  priceEur: number;
  quantity: number;
  isPrimary?: boolean;
};

type SeedHousePick = {
  whiskyId: string;
  story: string;
  monthLabel?: string;
  youtubeUrl?: string;
  note?: StoredHousePick["note"];
  displayPriceEur?: number;
};

type SeedPromotion = {
  whiskyId: string;
  discountedPriceEur: number;
  priorPriceEur: number;
  startsAt?: Date;
  endsAt?: Date;
  sortOrder: number;
};

type SeedNewWhisky = {
  whiskyId: string;
  displayPriceEur: number;
  badge: string;
  note: string;
  sortOrder: number;
};

type SeedDiscoveryPackItem = {
  name: string;
  detail: string;
  sortOrder: number;
};

type SeedDiscoveryPack = {
  id: string;
  title: string;
  photoUrl: string;
  priceEur: number;
  sortOrder: number;
  lineup: SeedDiscoveryPackItem[];
};

function toStoredSku(sku: SeedSku, primaryByDefault: boolean): StoredSku {
  const isPrimary =
    sku.isPrimary !== undefined ? sku.isPrimary : primaryByDefault;
  const id = sku.id ? sku.id : `${sku.whiskyId}:${sku.priceEur}:${isPrimary}`;

  return {
    id,
    whiskyId: sku.whiskyId,
    priceEur: sku.priceEur,
    quantity: sku.quantity,
    isPrimary,
  };
}

export function createInMemoryHomeStore(seed?: {
  whiskies?: SeedWhisky[];
  primarySkus?: SeedSku[];
  skus?: SeedSku[];
  housePick?: SeedHousePick;
  promotions?: SeedPromotion[];
  newWhiskies?: SeedNewWhisky[];
  discoveryPacks?: SeedDiscoveryPack[];
}): ShopStore {
  const whiskies: StoredWhisky[] = seed?.whiskies
    ? seed.whiskies.map((whisky) => ({
        id: whisky.id,
        name: whisky.name,
        photoUrl: whisky.photoUrl,
        origin: whisky.origin,
        abv: whisky.abv,
        nonChillFiltered: whisky.nonChillFiltered,
        published: whisky.published !== false,
        distillery: whisky.distillery ? whisky.distillery : "",
        country: whisky.country ? whisky.country : "",
        region: whisky.region,
        ageYears: whisky.ageYears,
        experienceLevel: whisky.experienceLevel,
        houseScore: whisky.houseScore,
        tastingAverage: whisky.tastingAverage,
        tagline: whisky.tagline,
        photoUrls:
          whisky.photoUrls && whisky.photoUrls.length > 0
            ? whisky.photoUrls
            : [whisky.photoUrl],
      }))
    : [];

  const skus: StoredSku[] = [
    ...(seed?.primarySkus
      ? seed.primarySkus.map((sku) => toStoredSku(sku, true))
      : []),
    ...(seed?.skus ? seed.skus.map((sku) => toStoredSku(sku, false)) : []),
  ];

  const housePick: StoredHousePick | undefined = seed?.housePick
    ? {
        whiskyId: seed.housePick.whiskyId,
        story: seed.housePick.story,
        monthLabel: seed.housePick.monthLabel,
        youtubeUrl: seed.housePick.youtubeUrl,
        note: seed.housePick.note,
        displayPriceEur: seed.housePick.displayPriceEur,
      }
    : undefined;
  const promotions: StoredHomePromotion[] = seed?.promotions
    ? seed.promotions.map((promotion) => ({
        whiskyId: promotion.whiskyId,
        discountedPriceEur: promotion.discountedPriceEur,
        priorPriceEur: promotion.priorPriceEur,
        startsAt: promotion.startsAt,
        endsAt: promotion.endsAt,
        sortOrder: promotion.sortOrder,
      }))
    : [];
  const newWhiskies: StoredHomeNewWhisky[] = seed?.newWhiskies
    ? seed.newWhiskies.map((entry) => ({
        whiskyId: entry.whiskyId,
        displayPriceEur: entry.displayPriceEur,
        badge: entry.badge,
        note: entry.note,
        sortOrder: entry.sortOrder,
      }))
    : [];
  const discoveryPacks: StoredDiscoveryPack[] = seed?.discoveryPacks
    ? seed.discoveryPacks.map((pack) => ({
        id: pack.id,
        title: pack.title,
        photoUrl: pack.photoUrl,
        priceEur: pack.priceEur,
        sortOrder: pack.sortOrder,
        lineup: pack.lineup.map(
          (item): StoredDiscoveryPackItem => ({
            name: item.name,
            detail: item.detail,
            sortOrder: item.sortOrder,
          }),
        ),
      }))
    : [];

  return {
    async allWhiskies() {
      return whiskies;
    },
    async catalogueEntries(): Promise<StoredCatalogueEntry[]> {
      const entries: StoredCatalogueEntry[] = [];

      for (const whisky of whiskies) {
        if (!whisky.published) {
          continue;
        }
        const whiskySkus = skus.filter((sku) => sku.whiskyId === whisky.id);
        const hasPrimary = whiskySkus.some((sku) => sku.isPrimary);
        if (!hasPrimary) {
          continue;
        }
        entries.push({ whisky, skus: whiskySkus });
      }

      return entries;
    },
    async currentHousePick() {
      return housePick;
    },
    async promotions() {
      return [...promotions].sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async newWhiskies() {
      return [...newWhiskies].sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async discoveryPacks() {
      return [...discoveryPacks]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((pack) => ({
          ...pack,
          lineup: [...pack.lineup].sort((a, b) => a.sortOrder - b.sortOrder),
        }));
    },
  };
}
