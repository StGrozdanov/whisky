import { describe, expect, it } from "vitest";
import type { FinderAnswers } from "./answers";
import {
  clearFinderHistory,
  FINDER_HISTORY_KEY,
  type FinderHistoryEntry,
  readFinderHistory,
  recordFinderRun,
} from "./history";

function memoryStorage(initial?: Record<string, string>) {
  const values = new Map(Object.entries(initial ? initial : {}));
  return {
    values,
    getItem: (key: string) => {
      const value = values.get(key);
      return value === undefined ? null : value;
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

const answers: FinderAnswers = {
  smoke: "medium",
  intensity: "soft",
  sweetness: "balanced",
  fruit: "light",
  priceTier: undefined,
};

function entry(ranAt: string): FinderHistoryEntry {
  return {
    ranAt,
    answers,
    whiskies: [{ id: "glen", name: "GlenAllachie 12" }],
  };
}

describe("guest Finder history", () => {
  it("starts empty", () => {
    expect(readFinderHistory(memoryStorage())).toEqual([]);
  });

  it("records runs newest first and reads them back", () => {
    const storage = memoryStorage();

    recordFinderRun(storage, entry("2026-10-31T10:00:00.000Z"));
    recordFinderRun(storage, {
      ...entry("2026-10-31T11:00:00.000Z"),
      answers: { ...answers, priceTier: "CORE" },
    });

    const history = readFinderHistory(storage);
    expect(history.map((item) => item.ranAt)).toEqual([
      "2026-10-31T11:00:00.000Z",
      "2026-10-31T10:00:00.000Z",
    ]);
    expect(history[0].answers.priceTier).toBe("CORE");
    expect(history[1]).toEqual(entry("2026-10-31T10:00:00.000Z"));
  });

  it("keeps only the latest ten runs", () => {
    const storage = memoryStorage();
    for (let hour = 0; hour < 12; hour += 1) {
      recordFinderRun(
        storage,
        entry(`2026-10-31T${String(hour).padStart(2, "0")}:00:00.000Z`),
      );
    }

    const history = readFinderHistory(storage);
    expect(history).toHaveLength(10);
    expect(history[0].ranAt).toBe("2026-10-31T11:00:00.000Z");
  });

  it("ignores corrupt or tampered storage", () => {
    expect(
      readFinderHistory(memoryStorage({ [FINDER_HISTORY_KEY]: "{not json" })),
    ).toEqual([]);
    expect(
      readFinderHistory(
        memoryStorage({
          [FINDER_HISTORY_KEY]: JSON.stringify([
            { ranAt: "x", answers: { smoke: "volcanic" }, whiskies: [] },
            entry("2026-10-31T10:00:00.000Z"),
          ]),
        }),
      ),
    ).toEqual([entry("2026-10-31T10:00:00.000Z")]);
  });

  it("drops a stored run whose time is not a date", () => {
    expect(
      readFinderHistory(
        memoryStorage({
          [FINDER_HISTORY_KEY]: JSON.stringify([
            entry("not a date"),
            entry("2026-10-31T10:00:00.000Z"),
          ]),
        }),
      ),
    ).toEqual([entry("2026-10-31T10:00:00.000Z")]);
  });

  it("clears the history", () => {
    const storage = memoryStorage();
    recordFinderRun(storage, entry("2026-10-31T10:00:00.000Z"));

    clearFinderHistory(storage);

    expect(readFinderHistory(storage)).toEqual([]);
    expect(storage.values.has(FINDER_HISTORY_KEY)).toBe(false);
  });
});
