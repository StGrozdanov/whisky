import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { HomeStore, Origin, StoredHousePick, StoredWhisky } from "./types";

type WhiskyRow = {
  id: string;
  name: string;
  photo_url: string;
  origin: Origin;
};

type HousePickRow = {
  whisky_id: string;
  story: string;
  month_label: string | null;
};

export function createSupabaseHomeStore(client: SupabaseClient): HomeStore {
  return {
    async allWhiskies(): Promise<StoredWhisky[]> {
      const { data, error } = await client
        .from("whiskies")
        .select("id, name, photo_url, origin")
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
      }));
    },

    async currentHousePick(): Promise<StoredHousePick | undefined> {
      const { data, error } = await client
        .from("house_picks")
        .select("whisky_id, story, month_label")
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
