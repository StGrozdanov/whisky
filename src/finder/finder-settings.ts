/** OpenRouter slug for "GPT-5.6 Terra", the initial Finder model (ADR-0001). */
export const DEFAULT_FINDER_MODEL = "openai/gpt-5.6-terra";

type FinderSettings = {
  /** Any OpenRouter model ID; an incompatible model makes the Finder fail visibly. */
  model: string;
};

/**
 * Today the model ID comes from `OPENROUTER_MODEL`. When the back office
 * exists, the Shopkeeper's single settings text field replaces this source;
 * `getFinder` reads settings on every run, so a change applies to the next run.
 */
export function finderSettingsFromEnv(
  env: Record<string, string | undefined>,
): FinderSettings {
  const configured = env.OPENROUTER_MODEL?.trim();
  return { model: configured ? configured : DEFAULT_FINDER_MODEL };
}
