import Link from "next/link";
import { Icon } from "@/components/icon";
import type { CataloguePage, CatalogueQuery } from "@/shop/types";
import { catalogueHasActiveFilters } from "../parse-catalogue-query";
import { CatalogueFilters } from "./catalogue-filters";
import { CataloguePagination } from "./catalogue-pagination";
import { CatalogueWhiskyCard } from "./catalogue-whisky-card";

type CatalogueViewProps = {
  catalogue: CataloguePage;
  query: CatalogueQuery;
};

export function CatalogueView({ catalogue, query }: CatalogueViewProps) {
  const hasFilters = catalogueHasActiveFilters(query);
  const isEmpty = catalogue.totalCount === 0;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[140px]" />
      <div className="pointer-events-none absolute top-[400px] right-10 h-[400px] w-[400px] rounded-full bg-secondary-container/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-gutter-mobile py-space-xl md:px-gutter">
        <nav
          aria-label="Пътека"
          className="mb-space-md flex items-center gap-2 text-body-sm text-on-surface-variant"
        >
          <Link className="cursor-pointer hover:text-primary" href="/">
            Начало
          </Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface">Селекция</span>
        </nav>

        <div className="mb-space-lg flex flex-col gap-space-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-headline text-headline-lg text-on-surface">
              Селекция
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Куриран каталог от публикувани уискита, подредени по азбучен ред.
            </p>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Показани:{" "}
            <span className="font-semibold text-on-surface">
              {catalogue.totalCount}
            </span>{" "}
            уискита
            {catalogue.pageCount > 0
              ? ` (Стр. ${catalogue.page} от ${catalogue.pageCount})`
              : ""}
          </p>
        </div>

        <CatalogueFilters query={query} />

        <div className="mt-space-md flex items-center gap-2 text-body-sm text-on-surface-variant">
          <Icon className="text-secondary" fontSize={18} name="sort_by_alpha" />
          <span>Подредени по азбучен ред (A — Z)</span>
        </div>

        {isEmpty ? (
          <CatalogueEmptyState hasFilters={hasFilters} />
        ) : (
          <>
            <div className="mt-space-lg grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
              {catalogue.items.map((card) => (
                <CatalogueWhiskyCard card={card} key={card.id} />
              ))}
            </div>
            <CataloguePagination catalogue={catalogue} query={query} />
          </>
        )}
      </div>
    </div>
  );
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
        Скоро тук ще се появят нови уискита. Можете да се върнете към началото
        или да се обадите на магазина.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-space-sm">
        <Link
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-space-xl py-3 text-label-md font-bold text-on-primary uppercase tracking-wider transition-colors hover:bg-primary-fixed"
          href="/"
        >
          Към началото
        </Link>
        <a
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant px-space-xl py-3 text-label-md font-bold text-on-surface uppercase tracking-wider transition-colors hover:border-secondary"
          href="tel:0888888888"
        >
          <Icon fontSize={18} name="phone" />
          Обадете се
        </a>
      </div>
    </div>
  );
}
