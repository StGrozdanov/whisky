"use server";

import { getShop } from "@/shop/get-shop";
import type { SearchHit } from "@/shop/types";

export async function searchCatalogue(query: string): Promise<SearchHit[]> {
  const shop = await getShop();
  return shop.search(query);
}
