import { describe, expect, it } from "vitest";
import { FINDER_STEPS, parseFinderAnswers } from "./answers";

describe("Finder answers", () => {
  it("asks Smoke, Intensity, Sweetness, Fruit profile, then optional Price tier", () => {
    expect(FINDER_STEPS.map((step) => step.key)).toEqual([
      "smoke",
      "intensity",
      "sweetness",
      "fruit",
      "priceTier",
    ]);
    expect(FINDER_STEPS.map((step) => step.optional)).toEqual([
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  it("uses the glossary's Bulgarian choices", () => {
    const labels = Object.fromEntries(
      FINDER_STEPS.map((step) => [
        step.key,
        step.options.map((option) => option.label),
      ]),
    );

    expect(labels.smoke).toEqual(["без", "средно", "силно"]);
    expect(labels.intensity).toEqual(["меко", "балансирано", "смело и плътно"]);
    expect(labels.sweetness).toEqual([
      "сладко",
      "балансирано",
      "сухо и пикантно",
    ]);
    expect(labels.fruit).toEqual([
      "тъмни плодове (стафиди, смокини, синя слива)",
      "светли плодове (зелена ябълка, круша, цитрус)",
      "баланс между двете",
    ]);
  });

  it("parses a complete set of answers and keeps only known fields", () => {
    expect(
      parseFinderAnswers({
        smoke: "strong",
        intensity: "bold",
        sweetness: "dry-spicy",
        fruit: "dark",
        priceTier: "SIGNATURE",
        email: "someone@example.com",
      }),
    ).toEqual({
      smoke: "strong",
      intensity: "bold",
      sweetness: "dry-spicy",
      fruit: "dark",
      priceTier: "SIGNATURE",
    });
  });

  it("treats a missing or empty Price tier as any tier", () => {
    const base = {
      smoke: "none",
      intensity: "soft",
      sweetness: "sweet",
      fruit: "balanced",
    };

    expect(parseFinderAnswers(base)).toEqual({ ...base, priceTier: undefined });
    expect(parseFinderAnswers({ ...base, priceTier: "" })).toEqual({
      ...base,
      priceTier: undefined,
    });
  });

  it("rejects unknown or missing required answers", () => {
    expect(parseFinderAnswers(undefined)).toBeUndefined();
    expect(parseFinderAnswers("smoke")).toBeUndefined();
    expect(
      parseFinderAnswers({
        smoke: "extreme",
        intensity: "soft",
        sweetness: "sweet",
        fruit: "dark",
      }),
    ).toBeUndefined();
    expect(
      parseFinderAnswers({
        smoke: "none",
        intensity: "soft",
        sweetness: "sweet",
      }),
    ).toBeUndefined();
    expect(
      parseFinderAnswers({
        smoke: "none",
        intensity: "soft",
        sweetness: "sweet",
        fruit: "dark",
        priceTier: "LUXURY",
      }),
    ).toBeUndefined();
  });
});
