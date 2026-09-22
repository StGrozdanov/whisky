import type {
  CatalogueAgeFilter,
  CatalogueQuery,
  ExperienceLevel,
  Origin,
  PriceTier,
  SearchHit,
} from "@/shop/types";
import {
  EXPERIENCE_LEVELS,
  ORIGINS,
  PRICE_TIERS,
  SEARCH_HIT_FILTER,
  SEARCH_HIT_KINDS,
} from "@/shop/types";

export type CatalogueSearchParams = {
  origin?: string | string[];
  tier?: string | string[];
  age?: string | string[];
  score?: string | string[];
  experience?: string | string[];
  name?: string | string[];
  distillery?: string | string[];
  country?: string | string[];
  region?: string | string[];
  page?: string | string[];
};

function singleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function textFilter(value: string | string[] | undefined): string | undefined {
  const raw = singleValue(value);
  if (!raw) {
    return undefined;
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  return trimmed;
}

function isOrigin(value: string): value is Origin {
  return (ORIGINS as readonly string[]).includes(value);
}

function isPriceTier(value: string): value is PriceTier {
  return (PRICE_TIERS as readonly string[]).includes(value);
}

function isExperience(value: string): value is ExperienceLevel {
  return (EXPERIENCE_LEVELS as readonly string[]).includes(value);
}

function isAge(value: string): value is CatalogueAgeFilter {
  return value === "declared" || value === "nas";
}

function isMinScore(value: string): value is "9" | "9.0" | "9.3" | "9.5" {
  return value === "9" || value === "9.0" || value === "9.3" || value === "9.5";
}

export function parseCatalogueQuery(
  params: CatalogueSearchParams,
): CatalogueQuery {
  const query: CatalogueQuery = {};

  const origin = singleValue(params.origin);
  if (origin && isOrigin(origin)) {
    query.origin = origin;
  }

  const tier = singleValue(params.tier);
  if (tier && isPriceTier(tier)) {
    query.priceTier = tier;
  }

  const age = singleValue(params.age);
  if (age && isAge(age)) {
    query.age = age;
  }

  const score = singleValue(params.score);
  if (score && isMinScore(score)) {
    if (score === "9" || score === "9.0") {
      query.minScore = 9.0;
    } else if (score === "9.3") {
      query.minScore = 9.3;
    } else {
      query.minScore = 9.5;
    }
  }

  const experience = singleValue(params.experience);
  if (experience && isExperience(experience)) {
    query.experience = experience;
  }

  for (const kind of SEARCH_HIT_KINDS) {
    const key = SEARCH_HIT_FILTER[kind];
    const value = textFilter(params[key]);
    if (value) {
      query[key] = value;
    }
  }

  const pageRaw = singleValue(params.page);
  if (pageRaw) {
    const page = Number.parseInt(pageRaw, 10);
    if (Number.isFinite(page) && page > 0) {
      query.page = page;
    }
  }

  return query;
}

export function catalogueHasActiveFilters(query: CatalogueQuery): boolean {
  return Boolean(
    query.origin ||
      query.priceTier ||
      query.age ||
      query.minScore !== undefined ||
      query.experience ||
      searchFilterActive(query),
  );
}

function searchFilterActive(query: CatalogueQuery): boolean {
  for (const kind of SEARCH_HIT_KINDS) {
    if (query[SEARCH_HIT_FILTER[kind]]) {
      return true;
    }
  }
  return false;
}

export function searchHitHref(hit: SearchHit): string {
  const key = SEARCH_HIT_FILTER[hit.kind];
  return buildCatalogueHref({}, { [key]: hit.name });
}

export function buildCatalogueHref(
  query: CatalogueQuery,
  overrides: Partial<CatalogueQuery> = {},
): string {
  const next: CatalogueQuery = {
    origin: "origin" in overrides ? overrides.origin : query.origin,
    priceTier: "priceTier" in overrides ? overrides.priceTier : query.priceTier,
    age: "age" in overrides ? overrides.age : query.age,
    minScore: "minScore" in overrides ? overrides.minScore : query.minScore,
    experience:
      "experience" in overrides ? overrides.experience : query.experience,
    page: "page" in overrides ? overrides.page : query.page,
  };

  for (const kind of SEARCH_HIT_KINDS) {
    const key = SEARCH_HIT_FILTER[kind];
    next[key] = key in overrides ? overrides[key] : query[key];
  }

  const params = new URLSearchParams();

  if (next.origin) {
    params.set("origin", next.origin);
  }
  if (next.priceTier) {
    params.set("tier", next.priceTier);
  }
  if (next.age) {
    params.set("age", next.age);
  }
  if (next.minScore !== undefined) {
    params.set("score", String(next.minScore));
  }
  if (next.experience) {
    params.set("experience", next.experience);
  }
  for (const kind of SEARCH_HIT_KINDS) {
    const key = SEARCH_HIT_FILTER[kind];
    const value = next[key];
    if (value) {
      params.set(key, value);
    }
  }
  if (next.page && next.page > 1) {
    params.set("page", String(next.page));
  }

  const qs = params.toString();
  if (qs.length === 0) {
    return "/catalogue";
  }
  return `/catalogue?${qs}`;
}
