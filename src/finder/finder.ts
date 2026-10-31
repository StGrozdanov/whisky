import type { Shop } from "@/shop/shop";
import type { CatalogueCard, FinderCandidate, PriceTier } from "@/shop/types";
import type { FinderAnswers } from "./answers";
import {
  FinderResearchError,
  type FinderResearcher,
  MAX_REASON_LENGTH,
  type RankedRecommendation,
  type ResearchCandidate,
} from "./openrouter-researcher";

const MAX_PER_TIER = 3;

export type FinderRecommendation = {
  whisky: CatalogueCard;
  reason: string;
};

export type FinderTierGroup = {
  tier: PriceTier;
  whiskies: FinderRecommendation[];
};

/**
 * Why a run failed. Every cause is shown to the Customer as the same honest,
 * retryable error; the cause is only for server logs and tests.
 */
type FinderFailureCause =
  | "catalogue-unavailable"
  | "not-configured"
  | "unavailable"
  | "invalid-response"
  | "no-valid-results";

export type FinderOutcome =
  | { status: "results"; groups: FinderTierGroup[] }
  | { status: "failed"; cause: FinderFailureCause };

type FinderDeps = {
  shop: Pick<Shop, "finderCandidates">;
  researcher: FinderResearcher;
  onFailure?: (cause: FinderFailureCause, error: unknown) => void;
};

export function createFinder(deps: FinderDeps) {
  function fail(cause: FinderFailureCause, error: unknown): FinderOutcome {
    deps.onFailure?.(cause, error);
    return { status: "failed", cause };
  }

  return {
    async run(answers: FinderAnswers): Promise<FinderOutcome> {
      let catalogue: FinderCandidate[];
      try {
        catalogue = await deps.shop.finderCandidates();
      } catch (error) {
        return fail("catalogue-unavailable", error);
      }

      const candidates = answers.priceTier
        ? catalogue.filter(
            (candidate) => candidate.whisky.priceTier === answers.priceTier,
          )
        : catalogue;
      if (candidates.length === 0) {
        return { status: "results", groups: [] };
      }

      let ranking: RankedRecommendation[];
      try {
        ranking = await deps.researcher.research({
          answers,
          candidates: candidates.map(toResearchCandidate),
        });
      } catch (error) {
        if (error instanceof FinderResearchError) {
          return fail(error.kind, error);
        }
        return fail("unavailable", error);
      }

      const groups = enforceCatalogueRules(ranking, candidates);
      if (ranking.length > 0 && groups.length === 0) {
        return fail(
          "no-valid-results",
          new Error("AI recommended no valid Catalogue Whisky"),
        );
      }
      return { status: "results", groups };
    },
  };
}

/**
 * The AI decides relevance; the application decides what may be shown:
 * only offered Catalogue IDs (so the chosen Price tier), once each, at most
 * three per tier, with Buy / Ask us taken from Catalogue data.
 */
function enforceCatalogueRules(
  ranking: RankedRecommendation[],
  candidates: FinderCandidate[],
): FinderTierGroup[] {
  const byId = new Map(
    candidates.map((candidate) => [candidate.whisky.id, candidate.whisky]),
  );
  const seen = new Set<string>();
  const groups: FinderTierGroup[] = [];

  for (const item of ranking) {
    const whisky = byId.get(item.whiskyId);
    if (!whisky || seen.has(whisky.id)) {
      continue;
    }
    const reason = shortReason(item.reason);
    if (!reason) {
      continue;
    }

    let group = groups.find((entry) => entry.tier === whisky.priceTier);
    if (!group) {
      group = { tier: whisky.priceTier, whiskies: [] };
      groups.push(group);
    }
    if (group.whiskies.length >= MAX_PER_TIER) {
      continue;
    }

    seen.add(whisky.id);
    group.whiskies.push({ whisky, reason });
  }

  return groups.filter((group) => group.whiskies.length > 0);
}

function shortReason(raw: string): string {
  const text = raw
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\bhttps?:\/\/\S+/gi, "")
    .replace(/\bwww\.\S+/gi, "")
    .replace(/\[\d+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= MAX_REASON_LENGTH) {
    return text;
  }
  const cut = text.slice(0, MAX_REASON_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const head = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${head.replace(/[\s,.;:]+$/, "")}…`;
}

function toResearchCandidate(candidate: FinderCandidate): ResearchCandidate {
  return {
    id: candidate.whisky.id,
    name: candidate.whisky.name,
    distillery: candidate.distillery,
    country: candidate.country,
    region: candidate.region,
    origin: candidate.whisky.origin,
    ageYears: candidate.whisky.ageYears,
    abv: candidate.whisky.abv,
    priceTier: candidate.whisky.priceTier,
  };
}

export type Finder = ReturnType<typeof createFinder>;
