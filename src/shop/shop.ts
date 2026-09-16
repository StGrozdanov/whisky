import type {
  Clock,
  HomeDiscoveryPack,
  HomeNewWhisky,
  HomePage,
  HomePromotion,
  HomeStore,
  HomeWhisky,
  HousePick,
  HousePickNote,
  StoredDiscoveryPack,
  StoredHomeNewWhisky,
  StoredHomePromotion,
  StoredHousePick,
  StoredWhisky,
} from "./types";

type ShopDeps = {
  store: HomeStore;
  clock?: Clock;
};

const wallClock: Clock = {
  now() {
    return new Date();
  },
};

export function createShop(deps: ShopDeps) {
  const clock = deps.clock ? deps.clock : wallClock;

  return {
    async home(): Promise<HomePage> {
      const storedWhiskies = await deps.store.allWhiskies();
      const whiskyById = new Map(
        storedWhiskies.map((whisky) => [whisky.id, whisky]),
      );
      const storedPick = await deps.store.currentHousePick();
      const now = clock.now();

      return {
        housePick: toHousePick(storedPick, whiskyById),
        promotions: toPromotions(
          await deps.store.promotions(),
          whiskyById,
          now,
        ),
        newWhiskies: toNewWhiskies(await deps.store.newWhiskies(), whiskyById),
        discoveryPacks: toDiscoveryPacks(await deps.store.discoveryPacks()),
      };
    },
  };
}

export type Shop = ReturnType<typeof createShop>;

function toHousePick(
  storedPick: StoredHousePick | undefined,
  whiskyById: Map<string, StoredWhisky>,
): HousePick | undefined {
  if (!storedPick) {
    return undefined;
  }

  const featured = whiskyById.get(storedPick.whiskyId);
  if (!featured) {
    return undefined;
  }

  return {
    whisky: toHomeWhisky(featured),
    story: storedPick.story,
    monthLabel: storedPick.monthLabel,
    youtubeUrl: storedPick.youtubeUrl,
    note: toHousePickNote(storedPick.note),
    displayPriceEur: storedPick.displayPriceEur,
  };
}

function toPromotions(
  stored: StoredHomePromotion[],
  whiskyById: Map<string, StoredWhisky>,
  now: Date,
): HomePromotion[] {
  const promotions: HomePromotion[] = [];

  for (const row of stored) {
    if (!isPromotionActive(row, now)) {
      continue;
    }

    const whisky = whiskyById.get(row.whiskyId);
    if (!whisky) {
      continue;
    }

    const savingsEur = roundMoney(row.priorPriceEur - row.discountedPriceEur);
    const discountPercent = Math.round(
      ((row.priorPriceEur - row.discountedPriceEur) / row.priorPriceEur) * 100,
    );

    promotions.push({
      whisky: toHomeWhisky(whisky),
      discountedPriceEur: row.discountedPriceEur,
      priorPriceEur: row.priorPriceEur,
      savingsEur,
      discountPercent,
    });
  }

  return promotions;
}

function isPromotionActive(row: StoredHomePromotion, now: Date): boolean {
  if (row.startsAt && row.startsAt.getTime() > now.getTime()) {
    return false;
  }
  if (row.endsAt && row.endsAt.getTime() <= now.getTime()) {
    return false;
  }
  return true;
}

function toNewWhiskies(
  stored: StoredHomeNewWhisky[],
  whiskyById: Map<string, StoredWhisky>,
): HomeNewWhisky[] {
  const entries: HomeNewWhisky[] = [];

  for (const row of stored) {
    const whisky = whiskyById.get(row.whiskyId);
    if (!whisky) {
      continue;
    }

    entries.push({
      whisky: toHomeWhisky(whisky),
      displayPriceEur: row.displayPriceEur,
      badge: row.badge,
      note: row.note,
    });
  }

  return entries;
}

function toDiscoveryPacks(stored: StoredDiscoveryPack[]): HomeDiscoveryPack[] {
  return stored.map((pack) => ({
    title: pack.title,
    photoUrl: pack.photoUrl,
    priceEur: pack.priceEur,
    lineup: pack.lineup.map((item) => ({
      name: item.name,
      detail: item.detail,
    })),
  }));
}

function toHomeWhisky(whisky: StoredWhisky): HomeWhisky {
  return {
    name: whisky.name,
    photoUrl: whisky.photoUrl,
    origin: whisky.origin,
    abv: whisky.abv,
    nonChillFiltered: whisky.nonChillFiltered,
  };
}

function toHousePickNote(
  note: StoredHousePick["note"],
): HousePickNote | undefined {
  if (!note?.authorName || !note.quote) {
    return undefined;
  }

  return {
    authorName: note.authorName,
    authorRole: note.authorRole,
    score: note.score,
    quote: note.quote,
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
