import type {
  HomeStore,
  Origin,
  StoredDiscoveryPack,
  StoredDiscoveryPackItem,
  StoredHomeNewWhisky,
  StoredHomePromotion,
  StoredHousePick,
  StoredWhisky,
} from "./types";

type SeedWhisky = {
  id: string;
  name: string;
  photoUrl: string;
  origin: Origin;
  abv?: number;
  nonChillFiltered?: boolean;
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

export function createInMemoryHomeStore(seed?: {
  whiskies?: SeedWhisky[];
  housePick?: SeedHousePick;
  promotions?: SeedPromotion[];
  newWhiskies?: SeedNewWhisky[];
  discoveryPacks?: SeedDiscoveryPack[];
}): HomeStore {
  const whiskies: StoredWhisky[] = seed?.whiskies
    ? seed.whiskies.map((whisky) => ({
        id: whisky.id,
        name: whisky.name,
        photoUrl: whisky.photoUrl,
        origin: whisky.origin,
        abv: whisky.abv,
        nonChillFiltered: whisky.nonChillFiltered,
      }))
    : [];
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
