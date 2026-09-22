import { headers } from "next/headers";
import {
  getFixtureShop,
  isShopFixtureName,
  type ShopFixtureName,
} from "./fixture-shop";
import { createShop, type Shop } from "./shop";
import {
  createSupabaseClientFromEnv,
  createSupabaseHomeStore,
} from "./supabase-home-store";

let liveShop: Shop | undefined;

/**
 * Returns the Shop for the current request.
 * When `SHOP_FIXTURE` is set (integration tests), serves an in-memory fixture
 * store and never touches Supabase. Optional header `x-shop-fixture` overrides
 * the fixture name for a single request.
 */
export async function getShop(): Promise<Shop> {
  const fixtureFromEnv = process.env.SHOP_FIXTURE;
  if (fixtureFromEnv) {
    return getFixtureShop(await resolveFixtureName(fixtureFromEnv));
  }

  if (liveShop) {
    return liveShop;
  }

  liveShop = createShop({
    store: createSupabaseHomeStore(createSupabaseClientFromEnv()),
  });
  return liveShop;
}

async function resolveFixtureName(fallback: string): Promise<ShopFixtureName> {
  const headerStore = await headers();
  const fromHeader = headerStore.get("x-shop-fixture");
  if (fromHeader && isShopFixtureName(fromHeader)) {
    return fromHeader;
  }

  if (isShopFixtureName(fallback)) {
    return fallback;
  }

  throw new Error(
    `Unknown SHOP_FIXTURE "${fallback}". Expected empty, mixed, or error.`,
  );
}
