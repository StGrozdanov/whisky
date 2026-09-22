import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import type { CataloguePage, CatalogueQuery } from "@/shop/types";
import { catalogueHasActiveFilters } from "../parse-catalogue-query";
import { CatalogueFilters } from "./catalogue-filters";
import { CataloguePagination } from "./catalogue-pagination";
import { CatalogueResultsSkeleton } from "./catalogue-results-skeleton";
import { CatalogueWhiskyCard } from "./catalogue-whisky-card";

export function CatalogueLayout({
  query,
  count,
  children,
}: {
  query: CatalogueQuery;
  count?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[140px]" />
      <div className="pointer-events-none absolute top-[400px] right-10 h-[400px] w-[400px] rounded-full bg-secondary-container/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-gutter-mobile py-space-xl md:px-gutter">
        <div className="mb-space-md flex items-center justify-between gap-space-md">
          <nav
            aria-label="Пътека"
            className="flex items-center gap-2 text-technical-data text-on-surface-variant/70"
          >
            <Link className="cursor-pointer hover:text-primary" href="/">
              Начало
            </Link>
            <span>/</span>
            <span className="font-medium text-secondary">Селекция</span>
          </nav>
          {count}
        </div>

        <CatalogueFilters query={query} />

        {children}
      </div>
    </div>
  );
}

export function CatalogueCount({ catalogue }: { catalogue: CataloguePage }) {
  return (
    <span className="text-technical-data text-outline">
      Показани:{" "}
      <strong className="font-bold text-primary">{catalogue.totalCount}</strong>{" "}
      уискита
      {catalogue.pageCount > 0
        ? ` (Стр. ${catalogue.page} от ${catalogue.pageCount})`
        : ""}
    </span>
  );
}

export function CatalogueCountFallback() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-40 animate-pulse rounded bg-surface-container"
    />
  );
}

export function CatalogueResults({
  catalogue,
  query,
}: {
  catalogue: CataloguePage;
  query: CatalogueQuery;
}) {
  const hasFilters = catalogueHasActiveFilters(query);
  const isEmpty = catalogue.totalCount === 0;

  if (isEmpty) {
    return <CatalogueEmptyState hasFilters={hasFilters} />;
  }

  return (
    <>
      <div className="mt-space-lg grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
        {catalogue.whiskies.map((card) => (
          <CatalogueWhiskyCard card={card} key={card.id} />
        ))}
      </div>
      <CataloguePagination catalogue={catalogue} query={query} />
    </>
  );
}

export function CatalogueResultsFallback() {
  return <CatalogueResultsSkeleton />;
}

function CatalogueEmptyState({ hasFilters }: { hasFilters: boolean }) {
  if (hasFilters) {
    return (
      <div className="mt-space-xl flex flex-col items-center justify-center gap-space-md rounded-2xl bg-surface-container-low px-space-lg py-space-xl text-center">
        <Icon className="text-outline" fontSize={32} name="filter_alt_off" />
        <h2 className="font-headline text-headline-md text-on-surface">
          Няма открити уискита с избраните филтри
        </h2>
        <p className="max-w-lg text-body-md text-on-surface-variant">
          Опитайте да разширите търсенето или премахнете част от филтрите, за да
          разгледате наличните предложения.
        </p>
        <Link
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-space-xl py-3 text-label-md font-bold text-on-primary uppercase tracking-wider transition-colors hover:bg-primary-fixed"
          href="/catalogue"
        >
          <Icon fontSize={18} name="restart_alt" />
          Изчисти филтрите
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-space-xl flex flex-col items-center justify-center gap-space-md rounded-2xl bg-surface-container-low px-space-lg py-space-xl text-center">
      <Icon className="text-outline" fontSize={32} name="inventory_2" />
      <h2 className="font-headline text-headline-md text-on-surface">
        В момента каталогът се обновява
      </h2>
      <p className="max-w-lg text-body-md text-on-surface-variant">
        Скоро тук ще се появят нови уискита.
      </p>
      <Link
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-space-xl py-3 text-label-md font-bold text-on-primary uppercase tracking-wider transition-colors hover:bg-primary-fixed"
        href="/"
      >
        Към началото
      </Link>
    </div>
  );
}
