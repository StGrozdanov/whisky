import type {
  HomePage,
  HomeStore,
  HomeWhisky,
  HousePick,
  HousePickNote,
  StoredHousePick,
  StoredWhisky,
} from "./types";

type ShopDeps = {
  store: HomeStore;
};

export function createShop(deps: ShopDeps) {
  return {
    async home(): Promise<HomePage> {
      const storedWhiskies = await deps.store.allWhiskies();
      const whiskies = storedWhiskies.map(toHomeWhisky);
      const storedPick = await deps.store.currentHousePick();

      if (!storedPick) {
        return { housePick: undefined, whiskies };
      }

      const featured = storedWhiskies.find(
        (whisky) => whisky.id === storedPick.whiskyId,
      );

      if (!featured) {
        return { housePick: undefined, whiskies };
      }

      const housePick: HousePick = {
        whisky: toHomeWhisky(featured),
        story: storedPick.story,
        monthLabel: storedPick.monthLabel,
        youtubeUrl: storedPick.youtubeUrl,
        note: toHousePickNote(storedPick),
        displayPriceEur: storedPick.displayPriceEur,
      };

      return { housePick, whiskies };
    },
  };
}

export type Shop = ReturnType<typeof createShop>;

function toHomeWhisky(whisky: StoredWhisky): HomeWhisky {
  return {
    name: whisky.name,
    photoUrl: whisky.photoUrl,
    origin: whisky.origin,
    abv: whisky.abv,
    nonChillFiltered: whisky.nonChillFiltered,
  };
}

function toHousePickNote(pick: StoredHousePick): HousePickNote | undefined {
  if (!pick.noteAuthorName || !pick.noteQuote) {
    return undefined;
  }

  return {
    authorName: pick.noteAuthorName,
    authorRole: pick.noteAuthorRole,
    score: pick.noteScore,
    quote: pick.noteQuote,
  };
}
