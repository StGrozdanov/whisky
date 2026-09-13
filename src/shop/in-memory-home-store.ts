import type { HomeStore, StoredHousePick, StoredWhisky } from "./types";

export function createInMemoryHomeStore(seed?: {
  whiskies?: StoredWhisky[];
  housePick?: StoredHousePick;
}): HomeStore {
  let whiskies: StoredWhisky[] = [];
  let housePick: StoredHousePick | undefined;

  if (seed) {
    if (seed.whiskies) {
      whiskies = seed.whiskies;
    }
    housePick = seed.housePick;
  }

  return {
    async allWhiskies() {
      return whiskies;
    },
    async currentHousePick() {
      return housePick;
    },
  };
}
