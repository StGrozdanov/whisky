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
  noteAuthorName?: string;
  noteAuthorRole?: string;
  noteScore?: number;
  noteQuote?: string;
  displayPriceEur?: number;
};

export function createInMemoryHomeStore(seed?: {
  whiskies?: SeedWhisky[];
  housePick?: SeedHousePick;
}): HomeStore {
  let whiskies: StoredWhisky[] = [];
  let housePick: StoredHousePick | undefined;

  if (seed) {
    if (seed.whiskies) {
      whiskies = seed.whiskies.map(normalizeWhisky);
    }
    if (seed.housePick) {
      housePick = normalizeHousePick(seed.housePick);
    }
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

function normalizeWhisky(whisky: SeedWhisky): StoredWhisky {
  return {
    id: whisky.id,
    name: whisky.name,
    photoUrl: whisky.photoUrl,
    origin: whisky.origin,
    abv: whisky.abv,
    nonChillFiltered: whisky.nonChillFiltered,
  };
}

function normalizeHousePick(pick: SeedHousePick): StoredHousePick {
  return {
    whiskyId: pick.whiskyId,
    story: pick.story,
    monthLabel: pick.monthLabel,
    youtubeUrl: pick.youtubeUrl,
    noteAuthorName: pick.noteAuthorName,
    noteAuthorRole: pick.noteAuthorRole,
    noteScore: pick.noteScore,
    noteQuote: pick.noteQuote,
    displayPriceEur: pick.displayPriceEur,
  };
}
