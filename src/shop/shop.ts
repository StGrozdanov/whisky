import type {
  CatalogueCard,
  CataloguePage,
  CatalogueQuery,
  Clock,
  HomeDiscoveryPack,
  HomeNewWhisky,
  HomePage,
  HomePromotion,
  HomeWhisky,
  HousePick,
  HousePickNote,
  PriceTier,
  ShopStore,
  StoredCatalogueEntry,
  StoredDiscoveryPack,
  StoredHomeNewWhisky,
  StoredHomePromotion,
  StoredHousePick,
  StoredWhisky,
} from "./types";

type ShopDeps = {
  store: ShopStore;
  clock?: Clock;
};

const wallClock: Clock = {
  now() {
    return new Date();
  },
};

const CATALOGUE_PAGE_SIZE = 24;

export function createShop(deps: ShopDeps) {
  const clock = deps.clock ? deps.clock : wallClock;

  return {
    async home(): Promise<HomePage> {
      const [
        storedWhiskies,
        storedPick,
        storedPromotions,
        storedNewWhiskies,
        storedDiscoveryPacks,
      ] = await Promise.all([
        deps.store.allWhiskies(),
        deps.store.currentHousePick(),
        deps.store.promotions(),
        deps.store.newWhiskies(),
        deps.store.discoveryPacks(),
      ]);
      const whiskyById = new Map(
        storedWhiskies
          .filter((whisky) => whisky.published)
          .map((whisky) => [whisky.id, whisky]),
      );
      const now = clock.now();

      return {
        housePick: toHousePick(storedPick, whiskyById),
        promotions: toPromotions(storedPromotions, whiskyById, now),
        newWhiskies: toNewWhiskies(storedNewWhiskies, whiskyById),
        discoveryPacks: toDiscoveryPacks(storedDiscoveryPacks),
      };
    },

    async catalogue(query: CatalogueQuery): Promise<CataloguePage> {
      const entries = await deps.store.catalogueEntries();
      const filtered = entries.filter((entry) =>
        matchesCatalogue(entry, query),
      );
      filtered.sort((a, b) => a.whisky.name.localeCompare(b.whisky.name, "en"));

      const totalCount = filtered.length;
      const pageCount =
        totalCount === 0 ? 0 : Math.ceil(totalCount / CATALOGUE_PAGE_SIZE);
      const requestedPage = query.page && query.page > 0 ? query.page : 1;
      const page =
        pageCount === 0
          ? 1
          : requestedPage > pageCount
            ? pageCount
            : requestedPage;
      const start = (page - 1) * CATALOGUE_PAGE_SIZE;
      const whiskies = filtered
        .slice(start, start + CATALOGUE_PAGE_SIZE)
        .map(toCatalogueCard);

      return { whiskies, totalCount, page, pageCount };
    },
  };
}

export type Shop = ReturnType<typeof createShop>;

function matchesCatalogue(
  entry: StoredCatalogueEntry,
  query: CatalogueQuery,
): boolean {
  const whisky = entry.whisky;
  const primary = primarySku(entry);

  if (query.origin && whisky.origin !== query.origin) {
    return false;
  }

  if (query.priceTier && priceTierFor(primary.priceEur) !== query.priceTier) {
    return false;
  }

  if (query.age === "declared" && whisky.ageYears === undefined) {
    return false;
  }
  if (query.age === "nas" && whisky.ageYears !== undefined) {
    return false;
  }

  if (query.minScore !== undefined) {
    const score = displayedScore(whisky);
    if (score === undefined || score < query.minScore) {
      return false;
    }
  }

  if (query.experience && whisky.experienceLevel !== query.experience) {
    return false;
  }

  return true;
}

function toCatalogueCard(entry: StoredCatalogueEntry): CatalogueCard {
  const whisky = entry.whisky;
  const primary = primarySku(entry);
  const offer = catalogueOffer(entry);

  return {
    id: whisky.id,
    name: whisky.name,
    photoUrl: cataloguePhoto(whisky),
    origin: whisky.origin,
    abv: whisky.abv,
    ageYears: whisky.ageYears,
    experienceLevel: whisky.experienceLevel,
    displayedScore: displayedScore(whisky),
    tagline: whisky.tagline,
    priceEur: offer.priceEur,
    priceTier: priceTierFor(primary.priceEur),
    action: offer.action,
  };
}

function primarySku(entry: StoredCatalogueEntry) {
  const primary = entry.skus.find((sku) => sku.isPrimary);
  if (!primary) {
    return entry.skus[0];
  }
  return primary;
}

function catalogueOffer(entry: StoredCatalogueEntry): {
  priceEur: number;
  action: CatalogueCard["action"];
} {
  const inStock = entry.skus
    .filter((sku) => sku.quantity > 0)
    .sort((left, right) => left.id.localeCompare(right.id));
  if (inStock.length > 0) {
    const primaryInStock = inStock.find((sku) => sku.isPrimary);
    const chosen = primaryInStock ? primaryInStock : inStock[0];
    return { priceEur: chosen.priceEur, action: "buy" };
  }

  return { priceEur: primarySku(entry).priceEur, action: "ask-us" };
}

function displayedScore(whisky: StoredWhisky): number | undefined {
  if (whisky.houseScore !== undefined) {
    return whisky.houseScore;
  }
  return whisky.tastingAverage;
}

function cataloguePhoto(whisky: StoredWhisky): string {
  if (whisky.photoUrls.length > 0) {
    return whisky.photoUrls[0];
  }
  return whisky.photoUrl;
}

function priceTierFor(priceEur: number): PriceTier {
  if (priceEur <= 50) {
    return "ENTRY";
  }
  if (priceEur <= 90) {
    return "CORE";
  }
  if (priceEur <= 140) {
    return "SIGNATURE";
  }
  return "PREMIUM";
}

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
