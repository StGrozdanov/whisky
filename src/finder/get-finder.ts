import { headers } from "next/headers";
import { getShop } from "@/shop/get-shop";
import { createFinder, type Finder } from "./finder";
import { finderSettingsFromEnv } from "./finder-settings";
import {
  type FinderFixtureName,
  fixtureOpenRouterFetch,
  isFinderFixtureName,
} from "./fixture-research";
import {
  createOpenRouterResearcher,
  type FinderResearcher,
} from "./openrouter-researcher";

/**
 * Returns the Finder for the current request. Nothing is memoised between
 * runs: settings are read and research is performed afresh every time.
 * When `FINDER_FIXTURE` is set (integration tests), OpenRouter is replaced by
 * canned replies and never contacted; header `x-finder-fixture` overrides the
 * fixture name for a single request.
 */
export async function getFinder(): Promise<Finder> {
  const [shop, researcher] = await Promise.all([getShop(), getResearcher()]);

  return createFinder({
    shop,
    researcher,
    onFailure(cause, error) {
      console.error(`Finder run failed (${cause})`, error);
    },
  });
}

async function getResearcher(): Promise<FinderResearcher> {
  const fixtureFromEnv = process.env.FINDER_FIXTURE;
  if (fixtureFromEnv) {
    return createOpenRouterResearcher({
      apiKey: "fixture-key",
      model: "fixture/model",
      fetch: fixtureOpenRouterFetch(await resolveFixtureName(fixtureFromEnv)),
    });
  }

  return createOpenRouterResearcher({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: finderSettingsFromEnv(process.env).model,
  });
}

async function resolveFixtureName(
  fallback: string,
): Promise<FinderFixtureName> {
  const headerStore = await headers();
  const fromHeader = headerStore.get("x-finder-fixture");
  if (fromHeader && isFinderFixtureName(fromHeader)) {
    return fromHeader;
  }

  if (isFinderFixtureName(fallback)) {
    return fallback;
  }

  throw new Error(
    `Unknown FINDER_FIXTURE "${fallback}". Expected ranked, empty, invalid-ids, http-error, or malformed.`,
  );
}
