import { describe, expect, it } from "vitest";
import { promotionEndLabel } from "./promotion-labels";

describe("promotionEndLabel", () => {
  it("names the last day in Sofia time", () => {
    expect(promotionEndLabel(new Date("2026-11-30T21:59:00.000Z"))).toBe(
      "Валидна до 30 ноември 2026 г.",
    );
  });

  it("treats midnight Sofia time as the end of the previous day", () => {
    expect(promotionEndLabel(new Date("2026-11-30T22:00:00.000Z"))).toBe(
      "Валидна до 30 ноември 2026 г.",
    );
  });

  it("returns nothing for an open-ended Promotion", () => {
    expect(promotionEndLabel(undefined)).toBeUndefined();
  });
});
