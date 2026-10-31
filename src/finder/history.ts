import { type FinderAnswers, parseFinderAnswers } from "./answers";

/**
 * Guest Finder history lives in `sessionStorage` only: it ends with the
 * browser session and is never sent to or stored on the server.
 */
export const FINDER_HISTORY_KEY = "whiskyfinder.finderHistory";
const MAX_ENTRIES = 10;

export type FinderHistoryEntry = {
  ranAt: string;
  answers: FinderAnswers;
  whiskies: { id: string; name: string }[];
};

type HistoryStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function readFinderHistory(
  storage: Pick<Storage, "getItem">,
): FinderHistoryEntry[] {
  const raw = storage.getItem(FINDER_HISTORY_KEY);
  if (!raw) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.flatMap((item): FinderHistoryEntry[] => {
    const entry = toHistoryEntry(item);
    return entry ? [entry] : [];
  });
}

export function recordFinderRun(
  storage: HistoryStorage,
  entry: FinderHistoryEntry,
): FinderHistoryEntry[] {
  const history = [entry, ...readFinderHistory(storage)].slice(0, MAX_ENTRIES);
  storage.setItem(FINDER_HISTORY_KEY, JSON.stringify(history));
  return history;
}

export function clearFinderHistory(storage: HistoryStorage): void {
  storage.removeItem(FINDER_HISTORY_KEY);
}

function toHistoryEntry(item: unknown): FinderHistoryEntry | undefined {
  if (typeof item !== "object" || item === null) {
    return undefined;
  }
  const record = item as Record<string, unknown>;
  const answers = parseFinderAnswers(record.answers);
  if (
    typeof record.ranAt !== "string" ||
    Number.isNaN(Date.parse(record.ranAt)) ||
    !answers ||
    !Array.isArray(record.whiskies)
  ) {
    return undefined;
  }

  const whiskies = record.whiskies.flatMap((whisky) => {
    if (typeof whisky !== "object" || whisky === null) {
      return [];
    }
    const { id, name } = whisky as Record<string, unknown>;
    return typeof id === "string" && typeof name === "string"
      ? [{ id, name }]
      : [];
  });

  return { ranAt: record.ranAt, answers, whiskies };
}
