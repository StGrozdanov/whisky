import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { HomeStore, Origin, StoredHousePick, StoredWhisky } from "./types";

type WhiskyRow = {
  id: string;
  name: string;
  photo_url: string;
  origin: Origin;
  abv: number | null;
  non_chill_filtered: boolean | null;
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

export function createSupabaseHomeStore(client: SupabaseClient): HomeStore {
  return {
    async allWhiskies(): Promise<StoredWhisky[]> {
      const { data, error } = await client
        .from("whiskies")
        .select("id, name, photo_url, origin, abv, non_chill_filtered")
        .order("created_at", { ascending: true });

      if (error) {
        throw new Error(`Failed to load Whiskies: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      const rows = data as WhiskyRow[];
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        photoUrl: row.photo_url,
        origin: row.origin,
        abv: row.abv === null ? undefined : Number(row.abv),
        nonChillFiltered:
          row.non_chill_filtered === null ? undefined : row.non_chill_filtered,
      }));
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
        noteAuthorName: row.note_author_name ? row.note_author_name : undefined,
        noteAuthorRole: row.note_author_role ? row.note_author_role : undefined,
        noteScore: row.note_score === null ? undefined : Number(row.note_score),
        noteQuote: row.note_quote ? row.note_quote : undefined,
        displayPriceEur:
          row.display_price_eur === null
            ? undefined
            : Number(row.display_price_eur),
      };
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
