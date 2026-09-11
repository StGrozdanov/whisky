import type { CatalogueStore, ListedWhisky } from "./types";

export function createInMemoryCatalogueStore(): CatalogueStore {
  const whiskies: ListedWhisky[] = [];

  return {
    save(whisky) {
      whiskies.push(whisky);
    },
    all() {
      return [...whiskies];
    },
  };
}
