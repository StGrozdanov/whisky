import { describe, expect, it } from "vitest";
import { DEFAULT_FINDER_MODEL, finderSettingsFromEnv } from "./finder-settings";

describe("Finder settings", () => {
  it("starts with GPT-5.6 Terra on OpenRouter", () => {
    expect(DEFAULT_FINDER_MODEL).toBe("openai/gpt-5.6-terra");
    expect(finderSettingsFromEnv({})).toEqual({
      model: "openai/gpt-5.6-terra",
    });
  });

  it("uses any model ID the Shopkeeper configures", () => {
    expect(
      finderSettingsFromEnv({ OPENROUTER_MODEL: "  vendor/new-model:beta " }),
    ).toEqual({ model: "vendor/new-model:beta" });
  });

  it("ignores a blank model ID", () => {
    expect(finderSettingsFromEnv({ OPENROUTER_MODEL: "   " })).toEqual({
      model: DEFAULT_FINDER_MODEL,
    });
  });
});
