"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { Icon } from "@/components/icon";
import { SEARCH_HIT_LABELS } from "@/components/search-hit-labels";
import {
  type CatalogueQuery,
  ORIGINS,
  SEARCH_HIT_FILTER,
  SEARCH_HIT_KINDS,
} from "@/shop/types";
import { ORIGIN_LABELS } from "@/utils/origin-labels";
import {
  buildCatalogueHref,
  catalogueHasActiveFilters,
} from "../parse-catalogue-query";

type CatalogueFiltersProps = {
  query: CatalogueQuery;
};

type Chip = {
  key: string;
  label: string;
  clear: Partial<CatalogueQuery>;
};

const FILTER_SELECT_CLASS =
  "cursor-pointer rounded-lg border border-surface-container-highest/40 bg-surface-container-low px-2.5 py-1.5 text-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none";

function scoreLabel(score: number): string {
  return `Оценка: Над ${score.toFixed(1)}/10`;
}

function chipsFor(query: CatalogueQuery): Chip[] {
  const chips: Chip[] = [];

  if (query.origin) {
    chips.push({
      key: "origin",
      label: `Произход: ${ORIGIN_LABELS[query.origin]}`,
      clear: { origin: undefined, page: 1 },
    });
  }
  if (query.priceTier) {
    chips.push({
      key: "tier",
      label: `Клас: ${query.priceTier}`,
      clear: { priceTier: undefined, page: 1 },
    });
  }
  if (query.age === "declared") {
    chips.push({
      key: "age",
      label: "Възраст: С декларирана възраст",
      clear: { age: undefined, page: 1 },
    });
  }
  if (query.age === "nas") {
    chips.push({
      key: "age",
      label: "Възраст: Без посочена възраст (NAS)",
      clear: { age: undefined, page: 1 },
    });
  }
  if (query.minScore !== undefined) {
    chips.push({
      key: "score",
      label: scoreLabel(query.minScore),
      clear: { minScore: undefined, page: 1 },
    });
  }
  if (query.experience === "beginner") {
    chips.push({
      key: "experience",
      label: "Опит: За начинаещи",
      clear: { experience: undefined, page: 1 },
    });
  }
  if (query.experience === "advanced") {
    chips.push({
      key: "experience",
      label: "Опит: За напреднали",
      clear: { experience: undefined, page: 1 },
    });
  }
  for (const kind of SEARCH_HIT_KINDS) {
    const key = SEARCH_HIT_FILTER[kind];
    const value = query[key];
    if (!value) {
      continue;
    }
    const clear: Partial<CatalogueQuery> = { page: 1 };
    clear[key] = undefined;
    chips.push({
      key,
      label: `${SEARCH_HIT_LABELS[kind]}: ${value}`,
      clear,
    });
  }

  return chips;
}

export function CatalogueFilters({ query }: CatalogueFiltersProps) {
  const router = useRouter();
  const chips = chipsFor(query);
  const hasFilters = catalogueHasActiveFilters(query);

  function navigate(overrides: Partial<CatalogueQuery>) {
    router.push(buildCatalogueHref(query, { ...overrides, page: 1 }));
  }

  function onSelectChange(
    event: ChangeEvent<HTMLSelectElement>,
    key: keyof CatalogueQuery,
  ) {
    const value = event.target.value;
    if (value === "") {
      navigate({ [key]: undefined });
      return;
    }

    if (key === "minScore") {
      navigate({ minScore: Number(value) as 9.0 | 9.3 | 9.5 });
      return;
    }

    navigate({ [key]: value });
  }

  return (
    <div className="w-full space-y-space-sm rounded-xl border border-surface-container-highest/40 bg-surface-container-lowest p-space-md shadow-md">
      <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-label-sm text-outline uppercase tracking-wider">
          Произход
          <select
            className={FILTER_SELECT_CLASS}
            onChange={(event) => onSelectChange(event, "origin")}
            value={query.origin ? query.origin : ""}
          >
            <option value="">Всички</option>
            {ORIGINS.map((origin) => (
              <option key={origin} value={origin}>
                {ORIGIN_LABELS[origin]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-label-sm text-outline uppercase tracking-wider">
          Ценови клас
          <select
            className={FILTER_SELECT_CLASS}
            onChange={(event) => onSelectChange(event, "priceTier")}
            value={query.priceTier ? query.priceTier : ""}
          >
            <option value="">Всички</option>
            <option value="ENTRY">ENTRY (до 50.00 €)</option>
            <option value="CORE">CORE (над 50.00 € до 90.00 €)</option>
            <option value="SIGNATURE">
              SIGNATURE (над 90.00 € до 140.00 €)
            </option>
            <option value="PREMIUM">PREMIUM (над 140.00 €)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-label-sm text-outline uppercase tracking-wider">
          Възраст
          <select
            className={FILTER_SELECT_CLASS}
            onChange={(event) => onSelectChange(event, "age")}
            value={query.age ? query.age : ""}
          >
            <option value="">Всички</option>
            <option value="declared">С декларирана възраст</option>
            <option value="nas">Без посочена възраст (NAS)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-label-sm text-outline uppercase tracking-wider">
          Оценка
          <select
            className={FILTER_SELECT_CLASS}
            onChange={(event) => onSelectChange(event, "minScore")}
            value={query.minScore !== undefined ? String(query.minScore) : ""}
          >
            <option value="">Всички</option>
            <option value="9">С оценка (Над 9.0/10)</option>
            <option value="9.3">С оценка (Над 9.3/10)</option>
            <option value="9.5">С оценка (Над 9.5/10)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-label-sm text-outline uppercase tracking-wider">
          Ниво опит
          <select
            className={FILTER_SELECT_CLASS}
            onChange={(event) => onSelectChange(event, "experience")}
            value={query.experience ? query.experience : ""}
          >
            <option value="">Всички</option>
            <option value="beginner">За начинаещи</option>
            <option value="advanced">За напреднали</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-sm border-t border-surface-container-highest/40 pt-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-technical-data text-outline">
            Активни филтри:
          </span>
          {chips.length === 0 ? (
            <span className="text-body-sm text-on-surface-variant">
              Няма избрани (показват се всички)
            </span>
          ) : (
            chips.map((chip) => (
              <Link
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-primary/20 bg-surface-container px-2.5 py-0.5 text-technical-data text-primary transition-colors hover:bg-surface-container-high"
                href={buildCatalogueHref(query, chip.clear)}
                key={chip.key}
              >
                {chip.label}
                <Icon fontSize={14} name="close" />
              </Link>
            ))
          )}
          {hasFilters ? (
            <Link
              className="ml-2 cursor-pointer text-technical-data text-outline underline transition-colors hover:text-error"
              href="/catalogue"
            >
              Изчисти всички
            </Link>
          ) : null}
        </div>
        <div className="text-technical-data text-outline">
          <Icon
            className="mr-1 inline-block align-middle text-secondary"
            fontSize={14}
            name="sort_by_alpha"
          />
          Подредени по азбучен ред (A — Z)
        </div>
      </div>
    </div>
  );
}
