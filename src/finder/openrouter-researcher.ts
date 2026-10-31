import type { Origin, PriceTier } from "@/shop/types";
import { type FinderAnswers, finderOption } from "./answers";
import { APPROVED_RESEARCH_DOMAINS } from "./research-domains";

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 50_000;
const WEB_RESULTS_PER_RUN = 8;

/** Catalogue facts the AI may research. No Availability, price, or Customer data. */
export type ResearchCandidate = {
  id: string;
  name: string;
  distillery: string;
  country: string;
  region: string | undefined;
  origin: Origin;
  ageYears: number | undefined;
  abv: number | undefined;
  priceTier: PriceTier;
};

type ResearchInput = {
  answers: FinderAnswers;
  candidates: ResearchCandidate[];
};

/** One AI-ranked entry, before the application enforces the Catalogue rules. */
export type RankedRecommendation = {
  whiskyId: string;
  reason: string;
};

export type FinderResearcher = {
  research(input: ResearchInput): Promise<RankedRecommendation[]>;
};

/**
 * - `not-configured`: no OpenRouter API key on the server.
 * - `unavailable`: network failure, timeout, non-2xx, or an OpenRouter error body.
 * - `invalid-response`: the reply is not JSON or does not match the ranking schema.
 */
type FinderResearchErrorKind =
  | "not-configured"
  | "unavailable"
  | "invalid-response";

export class FinderResearchError extends Error {
  readonly kind: FinderResearchErrorKind;

  constructor(kind: FinderResearchErrorKind, message: string) {
    super(message);
    this.name = "FinderResearchError";
    this.kind = kind;
  }
}

type OpenRouterResearcherConfig = {
  apiKey: string | undefined;
  model: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
};

export function createOpenRouterResearcher(
  config: OpenRouterResearcherConfig,
): FinderResearcher {
  const fetchImpl = config.fetch ? config.fetch : fetch;
  const timeoutMs = config.timeoutMs ? config.timeoutMs : DEFAULT_TIMEOUT_MS;

  return {
    async research(input) {
      if (!config.apiKey) {
        throw new FinderResearchError(
          "not-configured",
          "OPENROUTER_API_KEY is not set",
        );
      }

      let response: Response;
      try {
        response = await fetchImpl(OPENROUTER_CHAT_URL, {
          method: "POST",
          // Every Finder run is fresh research: never reuse a cached reply.
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
            "X-OpenRouter-Cache": "false",
          },
          body: JSON.stringify(researchRequestBody(input, config.model)),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (error) {
        throw new FinderResearchError(
          "unavailable",
          `OpenRouter request failed: ${errorMessage(error)}`,
        );
      }

      if (!response.ok) {
        throw new FinderResearchError(
          "unavailable",
          `OpenRouter responded with status ${response.status}`,
        );
      }

      return parseCompletion(await readJson(response));
    },
  };
}

function researchRequestBody(input: ResearchInput, model: string) {
  return {
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt(input) },
    ],
    plugins: [
      {
        id: "web",
        engine: "exa",
        max_results: WEB_RESULTS_PER_RUN,
        include_domains: [...APPROVED_RESEARCH_DOMAINS],
      },
    ],
    provider: {
      data_collection: "deny",
      zdr: true,
    },
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "finder_recommendations",
        strict: true,
        schema: RECOMMENDATIONS_SCHEMA,
      },
    },
  };
}

const RECOMMENDATIONS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["recommendations"],
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["whiskyId", "reason"],
        properties: {
          whiskyId: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
  },
};

const SYSTEM_PROMPT = [
  "You are the Finder of Whisky Finder, a Bulgarian whisky shop.",
  "Use the web search results from approved public whisky sources to learn how each candidate Whisky currently tastes.",
  "Rank the candidates by how well they match the Customer's answers; you alone decide relevance.",
  "Only recommend candidate IDs from the list. Never invent a Whisky or an ID.",
  "Return at most three recommendations per Price tier, best match first. Return an empty list if nothing fits.",
  "Write each reason in Bulgarian as one short sentence (under 140 characters) about taste.",
  "Reasons must not contain scores, percentages, ratings, links, or source names.",
  "Reply with JSON only, matching the requested schema.",
].join("\n");

function userPrompt(input: ResearchInput): string {
  const { answers } = input;
  const preferences = [
    `Smoke: ${meaning("smoke", answers.smoke)}`,
    `Intensity: ${meaning("intensity", answers.intensity)}`,
    `Sweetness: ${meaning("sweetness", answers.sweetness)}`,
    `Fruit profile: ${meaning("fruit", answers.fruit)}`,
    `Price tier: ${answers.priceTier ? answers.priceTier : "any"}`,
  ];
  const candidates = input.candidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    distillery: candidate.distillery,
    country: candidate.country,
    region: candidate.region ? candidate.region : null,
    origin: candidate.origin,
    ageYears: candidate.ageYears !== undefined ? candidate.ageYears : null,
    abv: candidate.abv !== undefined ? candidate.abv : null,
    priceTier: candidate.priceTier,
  }));

  return [
    "Customer answers:",
    ...preferences,
    "",
    "Candidate Whiskies (JSON):",
    JSON.stringify(candidates),
  ].join("\n");
}

function meaning(
  key: "smoke" | "intensity" | "sweetness" | "fruit",
  value: string,
): string {
  const option = finderOption(key, value);
  return option ? option.meaning : value;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new FinderResearchError(
      "invalid-response",
      "OpenRouter body is not JSON",
    );
  }
}

function parseCompletion(body: unknown): RankedRecommendation[] {
  if (isRecord(body) && body.error !== undefined) {
    throw new FinderResearchError(
      "unavailable",
      "OpenRouter returned an error body",
    );
  }

  const content = completionContent(body);
  if (content === undefined) {
    throw new FinderResearchError(
      "invalid-response",
      "OpenRouter reply has no message content",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new FinderResearchError(
      "invalid-response",
      "Finder content is not JSON",
    );
  }

  const recommendations = isRecord(parsed) ? parsed.recommendations : undefined;
  if (!Array.isArray(recommendations)) {
    throw new FinderResearchError(
      "invalid-response",
      "Finder content has no recommendations list",
    );
  }

  return recommendations.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.whiskyId !== "string" ||
      typeof item.reason !== "string"
    ) {
      throw new FinderResearchError(
        "invalid-response",
        "Finder recommendation does not match the schema",
      );
    }
    return { whiskyId: item.whiskyId, reason: item.reason };
  });
}

function completionContent(body: unknown): string | undefined {
  if (!isRecord(body) || !Array.isArray(body.choices)) {
    return undefined;
  }
  const choice = body.choices[0];
  if (!isRecord(choice) || !isRecord(choice.message)) {
    return undefined;
  }
  const content = choice.message.content;
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        isRecord(part) && typeof part.text === "string" ? part.text : "",
      )
      .join("");
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
