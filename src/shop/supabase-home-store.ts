import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  ExperienceLevel,
  Origin,
  ShopStore,
  StoredCatalogueEntry,
  StoredDiscoveryPack,
  StoredHomeNewWhisky,
  StoredHomePromotion,
  StoredHousePick,
  StoredWhisky,
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
};

type SkuRow = {
  whisky_id: string;
  price_eur: number;
  quantity: number;
  is_primary: boolean;
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
  sort_order: number;
};

type DiscoveryPackItemRow = {
  pack_id: string;
  name: string;
  detail: string;
  sort_order: number;
};

const WHISKY_SELECT =
  "id, name, photo_url, origin, abv, non_chill_filtered, published, distillery, country, region, age_years, experience_level, house_score, tagline, photo_urls";

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
  };
}

export function createSupabaseHomeStore(client: SupabaseClient): ShopStore {
  return {
    async allWhiskies(): Promise<StoredWhisky[]> {
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

    async catalogueEntries(): Promise<StoredCatalogueEntry[]> {
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
        .select("whisky_id, price_eur, quantity, is_primary")
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
          whiskyId: whisky.id,
          priceEur: Number(row.price_eur),
          quantity: row.quantity,
          isPrimary: row.is_primary,
        }));
        if (!whiskySkus.some((sku) => sku.isPrimary)) {
          continue;
        }
        entries.push({ whisky, skus: whiskySkus });
      }

      return entries;
    },

    async currentHousePick(): Promise<StoredHousePick | undefined> {
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
        return undefined;
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

    async promotions(): Promise<StoredHomePromotion[]> {
      const { data, error } = await client
        .from("home_promotions")
        .select(
          "whisky_id, discounted_price_eur, prior_price_eur, starts_at, ends_at, sort_order",
        )
        .order("sort_order", { ascending: true });

      if (error) {
        throw new Error(`Failed to load Home promotions: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      const rows = data as PromotionRow[];
      return rows.map((row) => ({
        whiskyId: row.whisky_id,
        discountedPriceEur: Number(row.discounted_price_eur),
        priorPriceEur: Number(row.prior_price_eur),
        startsAt: row.starts_at ? new Date(row.starts_at) : undefined,
        endsAt: row.ends_at ? new Date(row.ends_at) : undefined,
        sortOrder: row.sort_order,
      }));
    },

    async newWhiskies(): Promise<StoredHomeNewWhisky[]> {
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

    async discoveryPacks(): Promise<StoredDiscoveryPack[]> {
      const { data: packsData, error: packsError } = await client
        .from("discovery_packs")
        .select("id, title, photo_url, price_eur, sort_order")
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
          sortOrder: pack.sort_order,
          lineup,
        };
      });
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
