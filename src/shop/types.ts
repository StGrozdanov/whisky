export const ORIGINS = ["Irish", "Scotch", "Bourbon", "Japanese"] as const;
export type Origin = (typeof ORIGINS)[number];

export type HomeWhisky = {
  name: string;
  photoUrl: string;
  origin: Origin;
  abv: number | undefined;
  nonChillFiltered: boolean | undefined;
};

export type HousePickNote = {
  authorName: string;
  authorRole: string | undefined;
  score: number | undefined;
  quote: string;
};

export type HousePick = {
  whisky: HomeWhisky;
  story: string;
  monthLabel: string | undefined;
  youtubeUrl: string | undefined;
  note: HousePickNote | undefined;
  displayPriceEur: number | undefined;
};

export type HomePage = {
  housePick: HousePick | undefined;
  whiskies: HomeWhisky[];
};

export type StoredWhisky = {
  id: string;
  name: string;
  photoUrl: string;
  origin: Origin;
  abv: number | undefined;
  nonChillFiltered: boolean | undefined;
};

export type StoredHousePick = {
  whiskyId: string;
  story: string;
  monthLabel: string | undefined;
  youtubeUrl: string | undefined;
  noteAuthorName: string | undefined;
  noteAuthorRole: string | undefined;
  noteScore: number | undefined;
  noteQuote: string | undefined;
  displayPriceEur: number | undefined;
};

export type HomeStore = {
  allWhiskies(): Promise<StoredWhisky[]>;
  currentHousePick(): Promise<StoredHousePick | undefined>;
};
