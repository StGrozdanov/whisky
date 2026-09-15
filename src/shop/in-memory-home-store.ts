import type { HomeStore, Origin, StoredHousePick, StoredWhisky } from "./types";

type SeedWhisky = {
  id: string;
  name: string;
  photoUrl: string;
  origin: Origin;
  abv?: number;
  nonChillFiltered?: boolean;
};

type SeedHousePick = {
  whiskyId: string;
  story: string;
  monthLabel?: string;
  youtubeUrl?: string;
  note?: StoredHousePick["note"];
  displayPriceEur?: number;
};

export function createInMemoryHomeStore(seed?: {
  whiskies?: SeedWhisky[];
  housePick?: SeedHousePick;
}): HomeStore {
  const whiskies: StoredWhisky[] = seed?.whiskies
    ? seed.whiskies.map((whisky) => ({
        id: whisky.id,
        name: whisky.name,
        photoUrl: whisky.photoUrl,
        origin: whisky.origin,
        abv: whisky.abv,
        nonChillFiltered: whisky.nonChillFiltered,
      }))
    : [];
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

  return {
    async allWhiskies() {
      return whiskies;
    },
    async currentHousePick() {
      return housePick;
    },
  };
}
