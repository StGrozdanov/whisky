import type {
  CatalogueAgeFilter,
  CatalogueQuery,
  ExperienceLevel,
  Origin,
  PriceTier,
  SearchHit,
} from "@/shop/types";
import { EXPERIENCE_LEVELS, ORIGINS, PRICE_TIERS } from "@/shop/types";

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
  q?: string | string[];
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

  const name = textFilter(params.name);
  if (name) {
    query.name = name;
  }
  const distillery = textFilter(params.distillery);
  if (distillery) {
    query.distillery = distillery;
  }
  const country = textFilter(params.country);
  if (country) {
    query.country = country;
  }
  const region = textFilter(params.region);
  if (region) {
    query.region = region;
  }
  const q = textFilter(params.q);
  if (q) {
    query.q = q;
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
      query.name ||
      query.distillery ||
      query.country ||
      query.region ||
      query.q,
  );
}

export function searchHitHref(hit: SearchHit): string {
  if (hit.kind === "whisky") {
    return buildCatalogueHref({}, { name: hit.name });
  }
  if (hit.kind === "distillery") {
    return buildCatalogueHref({}, { distillery: hit.name });
  }
  if (hit.kind === "country") {
    return buildCatalogueHref({}, { country: hit.name });
  }
  return buildCatalogueHref({}, { region: hit.name });
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
    name: "name" in overrides ? overrides.name : query.name,
    distillery:
      "distillery" in overrides ? overrides.distillery : query.distillery,
    country: "country" in overrides ? overrides.country : query.country,
    region: "region" in overrides ? overrides.region : query.region,
    q: "q" in overrides ? overrides.q : query.q,
    page: "page" in overrides ? overrides.page : query.page,
  };

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
  if (next.name) {
    params.set("name", next.name);
  }
  if (next.distillery) {
    params.set("distillery", next.distillery);
  }
  if (next.country) {
    params.set("country", next.country);
  }
  if (next.region) {
    params.set("region", next.region);
  }
  if (next.q) {
    params.set("q", next.q);
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
