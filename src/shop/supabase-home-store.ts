import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type {
  ExperienceLevel,
  Origin,
  ShopStore,
  StoredAward,
  StoredCatalogueEntry,
  StoredDiscoveryPack,
  StoredGiftSelection,
  StoredHomeNewWhisky,
  StoredHousePick,
  StoredNewsletterSubscription,
  StoredPromotion,
  StoredWaitlistEntry,
  StoredWaitlistSku,
  StoredWhisky,
  StoredWhiskyRelatedSet,
} from "./types";

type WhiskyRow = {
  id: string;
  name: string;
  photo_url: string;
  origin: Origin;
  abv: number | null;
  non_chill_filtered: boolean | null;
  published: boolean;
  distillery: string;
  country: string;
  region: string | null;
  age_years: number | null;
  experience_level: ExperienceLevel | null;
  house_score: number | null;
  tagline: string | null;
  photo_urls: string[] | null;
  photo_captions: string[] | null;
  description: string | null;
  natural_colour: boolean | null;
  house_video_url: string | null;
};

type SkuRow = {
  id: string;
  whisky_id: string;
  price_eur: number;
  quantity: number;
  is_primary: boolean;
  volume_ml: number;
};

type WhiskyAwardRow = {
  whisky_id: string;
  title: string;
  organisation: string;
  year: number;
  category: string;
  sort_order: number;
};

type WhiskyTastingRow = {
  whisky_id: string;
  author_first_name: string;
  author_last_name: string;
  body: string;
  score: number | null;
  verified_purchase: boolean;
  sort_order: number;
};

type WhiskyPairingRow = {
  whisky_id: string;
  eyebrow: string;
  title: string;
  body: string;
  photo_url: string;
  sort_order: number;
};

type WhiskyRelatedSetRow = {
  whisky_id: string;
  title: string;
  description: string;
  price_eur: number;
  photo_url: string;
};

type HousePickRow = {
  whisky_id: string;
  story: string;
  month_label: string | null;
  youtube_url: string | null;
  note_author_name: string | null;
  note_author_role: string | null;
  note_score: number | null;
  note_quote: string | null;
  display_price_eur: number | null;
};

type PromotionRow = {
  whisky_id: string;
  sku_id: string;
  featured_on_home: boolean;
  discounted_price_eur: number;
  prior_price_eur: number;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
};

type NewWhiskyRow = {
  whisky_id: string;
  display_price_eur: number;
  badge: string;
  note: string;
  sort_order: number;
};

type DiscoveryPackRow = {
  id: string;
  title: string;
  photo_url: string;
  price_eur: number;
  quantity: number;
  sort_order: number;
};

type GiftSelectionRow = {
  whisky_id: string | null;
  pack_id: string | null;
  sort_order: number;
};

type DiscoveryPackItemRow = {
  pack_id: string;
  name: string;
  detail: string;
  sort_order: number;
};

function listRows<T>(
  label: string,
  error: { message: string } | null,
  data: T[] | null,
): T[] {
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
  if (!data) {
    return [];
  }
  return data;
}

const WHISKY_SELECT =
  "id, name, photo_url, origin, abv, non_chill_filtered, published, distillery, country, region, age_years, experience_level, house_score, tagline, photo_urls, photo_captions, description, natural_colour, house_video_url";

const SHOP_CACHE_REVALIDATE_SECONDS = 30 * 60;

type CachedPromotion = {
  whiskyId: string;
  skuId: string;
  featuredOnHome: boolean;
  discountedPriceEur: number;
  priorPriceEur: number;
  startsAt: string | undefined;
  endsAt: string | undefined;
  sortOrder: number;
};

function toStoredWhisky(row: WhiskyRow): StoredWhisky {
  return {
    id: row.id,
    name: row.name,
    photoUrl: row.photo_url,
    origin: row.origin,
    abv: row.abv === null ? undefined : Number(row.abv),
    nonChillFiltered:
      row.non_chill_filtered === null ? undefined : row.non_chill_filtered,
    published: row.published,
    distillery: row.distillery,
    country: row.country,
    region: row.region ? row.region : undefined,
    ageYears: row.age_years === null ? undefined : row.age_years,
    experienceLevel: row.experience_level ? row.experience_level : undefined,
    houseScore: row.house_score === null ? undefined : Number(row.house_score),
    tastingAverage: undefined,
    tagline: row.tagline ? row.tagline : undefined,
    photoUrls:
      row.photo_urls && row.photo_urls.length > 0
        ? row.photo_urls
        : [row.photo_url],
    photoCaptions: row.photo_captions ? row.photo_captions : [],
    description: row.description ? row.description : undefined,
    naturalColour: row.natural_colour === null ? undefined : row.natural_colour,
    houseVideoUrl: row.house_video_url ? row.house_video_url : undefined,
  };
}

export function createSupabaseHomeStore(client: SupabaseClient): ShopStore {
  const loadAllWhiskies = unstable_cache(
    async (): Promise<StoredWhisky[]> => {
      const { data, error } = await client
        .from("whiskies")
        .select(WHISKY_SELECT)
        .order("created_at", { ascending: true });

      if (error) {
        throw new Error(`Failed to load Whiskies: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return (data as WhiskyRow[]).map(toStoredWhisky);
    },
    ["shop-all-whiskies"],
    { revalidate: SHOP_CACHE_REVALIDATE_SECONDS },
  );

  const loadCatalogueEntries = unstable_cache(
    async (): Promise<StoredCatalogueEntry[]> => {
      const { data: whiskyData, error: whiskyError } = await client
        .from("whiskies")
        .select(WHISKY_SELECT)
        .eq("published", true)
        .order("name", { ascending: true });

      if (whiskyError) {
        throw new Error(
          `Failed to load Catalogue Whiskies: ${whiskyError.message}`,
        );
      }

      if (!whiskyData || whiskyData.length === 0) {
        return [];
      }

      const whiskies = (whiskyData as WhiskyRow[]).map(toStoredWhisky);
      const whiskyIds = whiskies.map((whisky) => whisky.id);

      const { data: skuData, error: skuError } = await client
        .from("skus")
        .select("id, whisky_id, price_eur, quantity, is_primary, volume_ml")
        .in("whisky_id", whiskyIds);

      if (skuError) {
        throw new Error(`Failed to load SKUs: ${skuError.message}`);
      }

      const skusByWhiskyId = new Map<string, SkuRow[]>();
      if (skuData) {
        for (const row of skuData as SkuRow[]) {
          const existing = skusByWhiskyId.get(row.whisky_id);
          if (existing) {
            existing.push(row);
          } else {
            skusByWhiskyId.set(row.whisky_id, [row]);
          }
        }
      }

      const entries: StoredCatalogueEntry[] = [];
      for (const whisky of whiskies) {
        const rows = skusByWhiskyId.get(whisky.id);
        if (!rows) {
          continue;
        }
        const whiskySkus = rows.map((row) => ({
          id: row.id,
          whiskyId: whisky.id,
          priceEur: Number(row.price_eur),
          quantity: row.quantity,
          isPrimary: row.is_primary,
          volumeMl: Number(row.volume_ml),
        }));
        if (!whiskySkus.some((sku) => sku.isPrimary)) {
          continue;
        }
        entries.push({ whisky, skus: whiskySkus });
      }

      return entries;
    },
    ["shop-catalogue-entries"],
    { revalidate: SHOP_CACHE_REVALIDATE_SECONDS },
  );

  const loadCurrentHousePick = unstable_cache(
    async (): Promise<StoredHousePick | null> => {
      const { data, error } = await client
        .from("house_picks")
        .select(
          "whisky_id, story, month_label, youtube_url, note_author_name, note_author_role, note_score, note_quote, display_price_eur",
        )
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to load House pick: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      const row = data as HousePickRow;
      return {
        whiskyId: row.whisky_id,
        story: row.story,
        monthLabel: row.month_label ? row.month_label : undefined,
        youtubeUrl: row.youtube_url ? row.youtube_url : undefined,
        note: {
          authorName: row.note_author_name ? row.note_author_name : undefined,
          authorRole: row.note_author_role ? row.note_author_role : undefined,
          score: row.note_score === null ? undefined : Number(row.note_score),
          quote: row.note_quote ? row.note_quote : undefined,
        },
        displayPriceEur:
          row.display_price_eur === null
            ? undefined
            : Number(row.display_price_eur),
      };
    },
    ["shop-house-pick"],
    { revalidate: SHOP_CACHE_REVALIDATE_SECONDS },
  );

  const loadPromotions = unstable_cache(
    async (): Promise<CachedPromotion[]> => {
      const { data, error } = await client
        .from("promotions")
        .select(
          "whisky_id, sku_id, featured_on_home, discounted_price_eur, prior_price_eur, starts_at, ends_at, sort_order",
        )
        .order("sort_order", { ascending: true });

      if (error) {
        throw new Error(`Failed to load Promotions: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      const rows = data as PromotionRow[];
      return rows.map((row) => ({
        whiskyId: row.whisky_id,
        skuId: row.sku_id,
        featuredOnHome: row.featured_on_home,
        discountedPriceEur: Number(row.discounted_price_eur),
        priorPriceEur: Number(row.prior_price_eur),
        startsAt: row.starts_at ? row.starts_at : undefined,
        endsAt: row.ends_at ? row.ends_at : undefined,
        sortOrder: row.sort_order,
      }));
    },
    ["shop-promotions"],
    { revalidate: SHOP_CACHE_REVALIDATE_SECONDS },
  );

  const loadNewWhiskies = unstable_cache(
    async (): Promise<StoredHomeNewWhisky[]> => {
      const { data, error } = await client
        .from("home_new_whiskies")
        .select("whisky_id, display_price_eur, badge, note, sort_order")
        .order("sort_order", { ascending: true });

      if (error) {
        throw new Error(`Failed to load New Whiskies: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      const rows = data as NewWhiskyRow[];
      return rows.map((row) => ({
        whiskyId: row.whisky_id,
        displayPriceEur: Number(row.display_price_eur),
        badge: row.badge,
        note: row.note,
        sortOrder: row.sort_order,
      }));
    },
    ["shop-new-whiskies"],
    { revalidate: SHOP_CACHE_REVALIDATE_SECONDS },
  );

  const loadDiscoveryPacks = unstable_cache(
    async (): Promise<StoredDiscoveryPack[]> => {
      const { data: packsData, error: packsError } = await client
        .from("discovery_packs")
        .select("id, title, photo_url, price_eur, quantity, sort_order")
        .order("sort_order", { ascending: true });

      if (packsError) {
        throw new Error(
          `Failed to load Discovery Packs: ${packsError.message}`,
        );
      }

      if (!packsData || packsData.length === 0) {
        return [];
      }

      const packs = packsData as DiscoveryPackRow[];
      const packIds = packs.map((pack) => pack.id);

      const { data: itemsData, error: itemsError } = await client
        .from("discovery_pack_items")
        .select("pack_id, name, detail, sort_order")
        .in("pack_id", packIds)
        .order("sort_order", { ascending: true });

      if (itemsError) {
        throw new Error(
          `Failed to load Discovery Pack items: ${itemsError.message}`,
        );
      }

      const items = itemsData ? (itemsData as DiscoveryPackItemRow[]) : [];
      const itemsByPack = new Map<string, DiscoveryPackItemRow[]>();

      for (const item of items) {
        const existing = itemsByPack.get(item.pack_id);
        if (existing) {
          existing.push(item);
        } else {
          itemsByPack.set(item.pack_id, [item]);
        }
      }

      return packs.map((pack) => {
        const packItems = itemsByPack.get(pack.id);
        const lineup = packItems
          ? packItems.map((item) => ({
              name: item.name,
              detail: item.detail,
              sortOrder: item.sort_order,
            }))
          : [];

        return {
          id: pack.id,
          title: pack.title,
          photoUrl: pack.photo_url,
          priceEur: Number(pack.price_eur),
          quantity: pack.quantity,
          sortOrder: pack.sort_order,
          lineup,
        };
      });
    },
    ["shop-discovery-packs"],
    { revalidate: SHOP_CACHE_REVALIDATE_SECONDS },
  );

  const loadGiftSelections = unstable_cache(
    async (): Promise<StoredGiftSelection[]> => {
      const { data, error } = await client
        .from("gift_selections")
        .select("whisky_id, pack_id, sort_order")
        .order("sort_order", { ascending: true });

      const rows = listRows(
        "Failed to load Gift selections",
        error,
        data as GiftSelectionRow[] | null,
      );

      return rows.flatMap((row): StoredGiftSelection[] => {
        if (row.whisky_id) {
          return [
            {
              kind: "whisky",
              whiskyId: row.whisky_id,
              sortOrder: row.sort_order,
            },
          ];
        }
        if (row.pack_id) {
          return [
            { kind: "pack", packId: row.pack_id, sortOrder: row.sort_order },
          ];
        }
        return [];
      });
    },
    ["shop-gift-selections"],
    { revalidate: SHOP_CACHE_REVALIDATE_SECONDS },
  );

  const loadAwards = unstable_cache(
    async (): Promise<StoredAward[]> => {
      const { data, error } = await client
        .from("whisky_awards")
        .select("whisky_id, title, organisation, year, category, sort_order")
        .order("sort_order", { ascending: true });

      const rows = listRows(
        "Failed to load Awards",
        error,
        data as WhiskyAwardRow[] | null,
      );

      return rows.map((row) => ({
        whiskyId: row.whisky_id,
        title: row.title,
        organisation: row.organisation,
        year: row.year,
        category: row.category,
      }));
    },
    ["shop-awards"],
    { revalidate: SHOP_CACHE_REVALIDATE_SECONDS },
  );

  async function loadWhiskyPageExtras(whiskyId: string) {
    const [awardsResult, tastingsResult, pairingsResult, relatedResult] =
      await Promise.all([
        client
          .from("whisky_awards")
          .select("whisky_id, title, organisation, year, category, sort_order")
          .eq("whisky_id", whiskyId)
          .order("sort_order", { ascending: true }),
        client
          .from("whisky_tastings")
          .select(
            "whisky_id, author_first_name, author_last_name, body, score, verified_purchase, sort_order",
          )
          .eq("whisky_id", whiskyId)
          .eq("approved", true)
          .order("sort_order", { ascending: true }),
        client
          .from("whisky_pairings")
          .select("whisky_id, eyebrow, title, body, photo_url, sort_order")
          .eq("whisky_id", whiskyId)
          .order("sort_order", { ascending: true }),
        client
          .from("whisky_related_sets")
          .select("whisky_id, title, description, price_eur, photo_url")
          .eq("whisky_id", whiskyId)
          .maybeSingle(),
      ]);

    const awardRows = listRows(
      "Failed to load Whisky awards",
      awardsResult.error,
      awardsResult.data as WhiskyAwardRow[] | null,
    );
    const tastingRows = listRows(
      "Failed to load Whisky tastings",
      tastingsResult.error,
      tastingsResult.data as WhiskyTastingRow[] | null,
    );
    const pairingRows = listRows(
      "Failed to load Whisky pairings",
      pairingsResult.error,
      pairingsResult.data as WhiskyPairingRow[] | null,
    );
    if (relatedResult.error) {
      throw new Error(
        `Failed to load Whisky related set: ${relatedResult.error.message}`,
      );
    }

    const awards = awardRows.map((row) => ({
      title: row.title,
      organisation: row.organisation,
      year: row.year,
      category: row.category,
    }));

    const tastings = tastingRows.map((row) => ({
      authorFirstName: row.author_first_name,
      authorLastName: row.author_last_name,
      text: row.body,
      score: row.score === null ? undefined : Number(row.score),
      verifiedPurchase: row.verified_purchase,
    }));

    const pairings = pairingRows.map((row) => ({
      eyebrow: row.eyebrow,
      title: row.title,
      body: row.body,
      photoUrl: row.photo_url,
      sortOrder: row.sort_order,
    }));

    let relatedSet: StoredWhiskyRelatedSet | undefined;
    if (relatedResult.data) {
      const row = relatedResult.data as WhiskyRelatedSetRow;
      relatedSet = {
        title: row.title,
        description: row.description,
        priceEur: Number(row.price_eur),
        photoUrl: row.photo_url,
      };
    }

    return {
      whiskyId,
      awards,
      tastings,
      pairings,
      relatedSet,
    };
  }

  return {
    allWhiskies: loadAllWhiskies,
    catalogueEntries: loadCatalogueEntries,
    whiskyPageExtras: loadWhiskyPageExtras,
    async currentHousePick() {
      const pick = await loadCurrentHousePick();
      if (pick === null) {
        return undefined;
      }
      return pick;
    },
    async promotions(): Promise<StoredPromotion[]> {
      const rows = await loadPromotions();
      return rows.map((row) => ({
        whiskyId: row.whiskyId,
        skuId: row.skuId,
        featuredOnHome: row.featuredOnHome,
        discountedPriceEur: row.discountedPriceEur,
        priorPriceEur: row.priorPriceEur,
        startsAt: row.startsAt ? new Date(row.startsAt) : undefined,
        endsAt: row.endsAt ? new Date(row.endsAt) : undefined,
        sortOrder: row.sortOrder,
      }));
    },
    newWhiskies: loadNewWhiskies,
    discoveryPacks: loadDiscoveryPacks,
    giftSelections: loadGiftSelections,
    awards: loadAwards,
    ...createSupabaseEnquiryMethods(client),
  };
}

// Enquiries: Contact requests, Newsletter subscriptions, and Waitlists.
// Never cached: each call reads or writes the current rows.

type NewsletterSubscriptionRow = {
  email: string;
  consented_at: string;
  policy_version: string;
  unsubscribe_token: string;
};

type NewsletterSuppressionRow = {
  email: string;
  suppressed_at: string;
};

type WaitlistSkuRow = {
  id: string;
  whisky_id: string;
  quantity: number;
  volume_ml: number;
  whiskies: { name: string; published: boolean } | null;
};

type WaitlistEntryRow = {
  id: string;
  sku_id: string;
  email: string;
  phone: string | null;
  created_at: string;
};

const UNIQUE_VIOLATION = "23505";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function throwOnError(label: string, error: { message: string } | null) {
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

function toNewsletterSubscription(
  row: NewsletterSubscriptionRow,
): StoredNewsletterSubscription {
  return {
    email: row.email,
    consentedAt: new Date(row.consented_at),
    policyVersion: row.policy_version,
    unsubscribeToken: row.unsubscribe_token,
  };
}

function createSupabaseEnquiryMethods(
  client: SupabaseClient,
): Pick<
  ShopStore,
  | "saveContactRequest"
  | "newsletterSubscriptions"
  | "newsletterSuppressions"
  | "isNewsletterEmailSuppressed"
  | "addNewsletterSubscription"
  | "newsletterSubscriptionByToken"
  | "suppressNewsletterEmail"
  | "waitlistSku"
  | "waitlistEntries"
  | "addWaitlistEntry"
  | "removeWaitlistEntries"
> {
  return {
    async saveContactRequest(request) {
      const { error } = await client.from("contact_requests").insert({
        name: request.name,
        email: request.email,
        phone: request.phone ? request.phone : null,
        subject: request.subject,
        message: request.message,
        received_at: request.receivedAt.toISOString(),
      });
      throwOnError("Failed to save Contact request", error);
    },

    async newsletterSubscriptions() {
      const { data, error } = await client
        .from("newsletter_subscriptions")
        .select("email, consented_at, policy_version, unsubscribe_token")
        .order("consented_at", { ascending: true });
      const rows = listRows(
        "Failed to load Newsletter subscriptions",
        error,
        data as NewsletterSubscriptionRow[] | null,
      );
      return rows.map(toNewsletterSubscription);
    },

    async newsletterSuppressions() {
      const { data, error } = await client
        .from("newsletter_suppressions")
        .select("email, suppressed_at");
      const rows = listRows(
        "Failed to load Newsletter suppressions",
        error,
        data as NewsletterSuppressionRow[] | null,
      );
      return rows.map((row) => ({
        email: row.email,
        suppressedAt: new Date(row.suppressed_at),
      }));
    },

    async isNewsletterEmailSuppressed(email) {
      const { data, error } = await client
        .from("newsletter_suppressions")
        .select("email")
        .eq("email", email)
        .maybeSingle();
      throwOnError("Failed to check Newsletter suppression", error);
      return data !== null;
    },

    // Insert only: a repeat sign-up must not rotate the unsubscribe token
    // already sent in earlier emails or overwrite the first consent evidence.
    async addNewsletterSubscription(subscription) {
      const { error } = await client.from("newsletter_subscriptions").insert({
        email: subscription.email,
        consented_at: subscription.consentedAt.toISOString(),
        policy_version: subscription.policyVersion,
        unsubscribe_token: subscription.unsubscribeToken,
      });
      if (error && error.code === UNIQUE_VIOLATION) {
        return "duplicate";
      }
      throwOnError("Failed to save Newsletter subscription", error);
      return "added";
    },

    async newsletterSubscriptionByToken(unsubscribeToken) {
      if (!UUID_PATTERN.test(unsubscribeToken)) {
        return undefined;
      }
      const { data, error } = await client
        .from("newsletter_subscriptions")
        .select("email, consented_at, policy_version, unsubscribe_token")
        .eq("unsubscribe_token", unsubscribeToken)
        .maybeSingle();
      throwOnError("Failed to load Newsletter subscription", error);
      if (!data) {
        return undefined;
      }
      return toNewsletterSubscription(data as NewsletterSubscriptionRow);
    },

    // Suppress first, then drop the consent record: a partial failure still
    // keeps the address off every future send.
    async suppressNewsletterEmail(suppression) {
      const { error } = await client.from("newsletter_suppressions").upsert(
        {
          email: suppression.email,
          suppressed_at: suppression.suppressedAt.toISOString(),
        },
        { onConflict: "email" },
      );
      throwOnError("Failed to suppress Newsletter email", error);

      const { error: deleteError } = await client
        .from("newsletter_subscriptions")
        .delete()
        .eq("email", suppression.email);
      throwOnError("Failed to remove Newsletter subscription", deleteError);
    },

    async waitlistSku(skuId): Promise<StoredWaitlistSku | undefined> {
      if (!UUID_PATTERN.test(skuId)) {
        return undefined;
      }
      const { data, error } = await client
        .from("skus")
        .select("id, whisky_id, quantity, volume_ml, whiskies(name, published)")
        .eq("id", skuId)
        .maybeSingle();
      throwOnError("Failed to load Waitlist SKU", error);
      if (!data) {
        return undefined;
      }
      const row = data as unknown as WaitlistSkuRow;
      if (!row.whiskies) {
        return undefined;
      }
      return {
        skuId: row.id,
        whiskyId: row.whisky_id,
        whiskyName: row.whiskies.name,
        whiskyPublished: row.whiskies.published,
        volumeMl: Number(row.volume_ml),
        quantity: row.quantity,
      };
    },

    async waitlistEntries(skuId): Promise<StoredWaitlistEntry[]> {
      if (!UUID_PATTERN.test(skuId)) {
        return [];
      }
      const { data, error } = await client
        .from("waitlist_entries")
        .select("id, sku_id, email, phone, created_at")
        .eq("sku_id", skuId)
        .order("created_at", { ascending: true });
      const rows = listRows(
        "Failed to load Waitlist entries",
        error,
        data as WaitlistEntryRow[] | null,
      );
      return rows.map((row) => ({
        id: row.id,
        skuId: row.sku_id,
        email: row.email,
        phone: row.phone ? row.phone : undefined,
        createdAt: new Date(row.created_at),
      }));
    },

    async addWaitlistEntry(entry) {
      const { error } = await client.from("waitlist_entries").insert({
        sku_id: entry.skuId,
        email: entry.email,
        phone: entry.phone ? entry.phone : null,
        created_at: entry.createdAt.toISOString(),
      });
      if (error && error.code === UNIQUE_VIOLATION) {
        return "duplicate";
      }
      throwOnError("Failed to add Waitlist entry", error);
      return "added";
    },

    async removeWaitlistEntries(ids) {
      if (ids.length === 0) {
        return;
      }
      const { error } = await client
        .from("waitlist_entries")
        .delete()
        .in("id", ids);
      throwOnError("Failed to clear Waitlist entries", error);
    },
  };
}

export function createSupabaseClientFromEnv(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for the live Shop",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
