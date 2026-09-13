import { createShop, type Shop } from "./shop";
import {
  createSupabaseClientFromEnv,
  createSupabaseHomeStore,
} from "./supabase-home-store";

let shop: Shop | undefined;

export function getShop(): Shop {
  if (shop) {
    return shop;
  }

  shop = createShop({
    store: createSupabaseHomeStore(createSupabaseClientFromEnv()),
  });
  return shop;
}
