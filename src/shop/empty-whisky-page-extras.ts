import type { StoredWhiskyPageExtras } from "./types";

export function emptyWhiskyPageExtras(
  whiskyId: string,
): StoredWhiskyPageExtras {
  return {
    whiskyId,
    awards: [],
    tastings: [],
    pairings: [],
    relatedSet: undefined,
  };
}
