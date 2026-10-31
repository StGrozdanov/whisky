import { emptyWhiskyPageExtras } from "./empty-whisky-page-extras";
import type {
  ExperienceLevel,
  Origin,
  ShopStore,
  StoredAward,
  StoredCatalogueEntry,
  StoredContactRequest,
  StoredDiscoveryPack,
  StoredDiscoveryPackItem,
  StoredGiftSelection,
  StoredHomeNewWhisky,
  StoredHousePick,
  StoredNewsletterSubscription,
  StoredNewsletterSuppression,
  StoredPromotion,
  StoredSku,
  StoredWaitlistEntry,
  StoredWhisky,
  StoredWhiskyPageExtras,
  WaitlistTarget,
} from "./types";

/** In-memory store plus test hooks the back office (#26) will own later. */
type InMemoryShopStore = ShopStore & {
  contactRequests(): StoredContactRequest[];
  setSkuQuantity(skuId: string, quantity: number): void;
  setPackQuantity(packId: string, quantity: number): void;
};

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
  photoCaptions?: string[];
  description?: string;
  naturalColour?: boolean;
  houseVideoUrl?: string;
};

type SeedSku = {
  id?: string;
  whiskyId: string;
  priceEur: number;
  quantity: number;
  isPrimary?: boolean;
  volumeMl?: number;
};

type SeedWhiskyPageExtras = {
  whiskyId: string;
  awards?: StoredWhiskyPageExtras["awards"];
  tastings?: StoredWhiskyPageExtras["tastings"];
  pairings?: StoredWhiskyPageExtras["pairings"];
  relatedSet?: StoredWhiskyPageExtras["relatedSet"];
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
  skuId?: string;
  featuredOnHome?: boolean;
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
  quantity?: number;
  sortOrder: number;
  lineup: SeedDiscoveryPackItem[];
};

function toStoredSku(sku: SeedSku, primaryByDefault: boolean): StoredSku {
  const isPrimary =
    sku.isPrimary !== undefined ? sku.isPrimary : primaryByDefault;
  const id = sku.id ? sku.id : `${sku.whiskyId}:${sku.priceEur}:${isPrimary}`;

  const volumeMl = sku.volumeMl !== undefined ? sku.volumeMl : 700;

  return {
    id,
    whiskyId: sku.whiskyId,
    priceEur: sku.priceEur,
    quantity: sku.quantity,
    isPrimary,
    volumeMl,
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
  giftSelections?: StoredGiftSelection[];
  whiskyPages?: SeedWhiskyPageExtras[];
  newsletterSubscriptions?: StoredNewsletterSubscription[];
  newsletterSuppressions?: StoredNewsletterSuppression[];
}): InMemoryShopStore {
  const whiskyPagesById = new Map<string, StoredWhiskyPageExtras>();
  if (seed?.whiskyPages) {
    for (const page of seed.whiskyPages) {
      whiskyPagesById.set(page.whiskyId, {
        whiskyId: page.whiskyId,
        awards: page.awards ? page.awards : [],
        tastings: page.tastings ? page.tastings : [],
        pairings: page.pairings
          ? page.pairings.map((pairing, index) => ({
              ...pairing,
              sortOrder:
                pairing.sortOrder !== undefined ? pairing.sortOrder : index,
            }))
          : [],
        relatedSet: page.relatedSet,
      });
    }
  }

  const whiskies: StoredWhisky[] = seed?.whiskies
    ? seed.whiskies.map((whisky) => {
        const photoUrls =
          whisky.photoUrls && whisky.photoUrls.length > 0
            ? whisky.photoUrls
            : [whisky.photoUrl];
        const photoCaptions =
          whisky.photoCaptions && whisky.photoCaptions.length > 0
            ? whisky.photoCaptions
            : [];

        return {
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
          photoUrls,
          photoCaptions,
          description: whisky.description,
          naturalColour: whisky.naturalColour,
          houseVideoUrl: whisky.houseVideoUrl,
        };
      })
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
  const promotions: StoredPromotion[] = seed?.promotions
    ? seed.promotions.map((promotion) => ({
        whiskyId: promotion.whiskyId,
        skuId: promotion.skuId
          ? promotion.skuId
          : primarySkuId(skus, promotion.whiskyId),
        featuredOnHome: promotion.featuredOnHome !== false,
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
        quantity: pack.quantity !== undefined ? pack.quantity : 0,
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
  const giftSelections: StoredGiftSelection[] = seed?.giftSelections
    ? seed.giftSelections
    : [];
  const awards: StoredAward[] = [...whiskyPagesById.values()].flatMap((page) =>
    page.awards.map((award) => ({ ...award, whiskyId: page.whiskyId })),
  );

  const contactRequests: StoredContactRequest[] = [];
  const newsletterSubscriptions = new Map<
    string,
    StoredNewsletterSubscription
  >();
  for (const subscription of seed?.newsletterSubscriptions
    ? seed.newsletterSubscriptions
    : []) {
    newsletterSubscriptions.set(subscription.email, subscription);
  }
  const newsletterSuppressions = new Map<string, StoredNewsletterSuppression>();
  for (const suppression of seed?.newsletterSuppressions
    ? seed.newsletterSuppressions
    : []) {
    newsletterSuppressions.set(suppression.email, suppression);
  }
  const waitlistEntries: StoredWaitlistEntry[] = [];
  let nextWaitlistEntryId = 1;

  return {
    async allWhiskies() {
      return whiskies;
    },
    async whiskyPageExtras(whiskyId: string) {
      const extras = whiskyPagesById.get(whiskyId);
      if (!extras) {
        return emptyWhiskyPageExtras(whiskyId);
      }
      return extras;
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
    async giftSelections() {
      return [...giftSelections].sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async awards() {
      return awards;
    },

    // Enquiries: Contact requests, Newsletter subscriptions, and Waitlists.
    async saveContactRequest(request) {
      contactRequests.push(request);
    },
    contactRequests() {
      return [...contactRequests];
    },
    async newsletterSubscriptions() {
      return [...newsletterSubscriptions.values()];
    },
    async newsletterSuppressions() {
      return [...newsletterSuppressions.values()];
    },
    async isNewsletterEmailSuppressed(email) {
      return newsletterSuppressions.has(email);
    },
    async addNewsletterSubscription(subscription) {
      if (newsletterSubscriptions.has(subscription.email)) {
        return "duplicate";
      }
      newsletterSubscriptions.set(subscription.email, subscription);
      return "added";
    },
    async newsletterSubscriptionByToken(unsubscribeToken) {
      return [...newsletterSubscriptions.values()].find(
        (subscription) => subscription.unsubscribeToken === unsubscribeToken,
      );
    },
    async suppressNewsletterEmail(suppression) {
      newsletterSuppressions.set(suppression.email, suppression);
      newsletterSubscriptions.delete(suppression.email);
    },
    async waitlistItem(target) {
      if (target.kind === "pack") {
        const pack = discoveryPacks.find((item) => item.id === target.packId);
        return pack
          ? {
              kind: "pack",
              packId: pack.id,
              title: pack.title,
              quantity: pack.quantity,
            }
          : undefined;
      }
      const sku = skus.find((item) => item.id === target.skuId);
      const whisky = sku
        ? whiskies.find((item) => item.id === sku.whiskyId)
        : undefined;
      if (!sku || !whisky) {
        return undefined;
      }
      return {
        kind: "sku",
        skuId: sku.id,
        whiskyId: whisky.id,
        whiskyName: whisky.name,
        whiskyPublished: whisky.published,
        volumeMl: sku.volumeMl,
        quantity: sku.quantity,
      };
    },
    async waitlistEntries(target) {
      return waitlistEntries.filter((entry) =>
        sameWaitlistTarget(entry.target, target),
      );
    },
    async addWaitlistEntry(entry) {
      const duplicate = waitlistEntries.some(
        (existing) =>
          sameWaitlistTarget(existing.target, entry.target) &&
          existing.email === entry.email,
      );
      if (duplicate) {
        return "duplicate";
      }
      waitlistEntries.push({
        ...entry,
        id: `waitlist-${nextWaitlistEntryId}`,
      });
      nextWaitlistEntryId += 1;
      return "added";
    },
    async claimWaitlistEntries(target) {
      const claimed = waitlistEntries.filter((entry) =>
        sameWaitlistTarget(entry.target, target),
      );
      const kept = waitlistEntries.filter(
        (entry) => !sameWaitlistTarget(entry.target, target),
      );
      waitlistEntries.splice(0, waitlistEntries.length, ...kept);
      return claimed;
    },
    setSkuQuantity(skuId, quantity) {
      const index = skus.findIndex((sku) => sku.id === skuId);
      if (index >= 0) {
        skus[index] = { ...skus[index], quantity };
      }
    },
    setPackQuantity(packId, quantity) {
      const index = discoveryPacks.findIndex((pack) => pack.id === packId);
      if (index >= 0) {
        discoveryPacks[index] = { ...discoveryPacks[index], quantity };
      }
    },
  };
}

function sameWaitlistTarget(left: WaitlistTarget, right: WaitlistTarget) {
  return left.kind === "sku"
    ? right.kind === "sku" && left.skuId === right.skuId
    : right.kind === "pack" && left.packId === right.packId;
}

function primarySkuId(skus: StoredSku[], whiskyId: string): string {
  const primary = skus.find(
    (sku) => sku.whiskyId === whiskyId && sku.isPrimary,
  );
  if (primary) {
    return primary.id;
  }
  return `${whiskyId}:no-primary-sku`;
}
