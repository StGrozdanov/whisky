import { describe, expect, it } from "vitest";
import {
  formatColourFiltration,
  formatDisplayedScore,
  skuAvailabilityLabel,
  skuIsInStock,
} from "./whisky-page-labels";

describe("whisky page labels", () => {
  it("shows colour and filtration when the shopkeeper set either fact, including false", () => {
    expect(formatColourFiltration(true, true)).toBe("Natural / Non-Chill");
    expect(formatColourFiltration(false, false)).toBe(
      "Coloured / Chill filtered",
    );
    expect(formatColourFiltration(false, undefined)).toBe("Coloured");
    expect(formatColourFiltration(undefined, undefined)).toBeUndefined();
  });

  it("formats a score once and maps SKU stock to one label", () => {
    expect(formatDisplayedScore(9.3)).toBe("9.3/10");
    expect(formatDisplayedScore(undefined)).toBeUndefined();
    expect(skuIsInStock("buy")).toBe(true);
    expect(skuIsInStock("ask-us")).toBe(false);
    expect(skuAvailabilityLabel("buy")).toBe("В наличност");
    expect(skuAvailabilityLabel("ask-us")).toBe("Попитай ни");
  });
});
