import Link from "next/link";
import { Icon } from "@/components/icon";
import type { CataloguePage, CatalogueQuery } from "@/shop/types";
import { buildCatalogueHref } from "../parse-catalogue-query";

type CataloguePaginationProps = {
  catalogue: CataloguePage;
  query: CatalogueQuery;
};

export function CataloguePagination({
  catalogue,
  query,
}: CataloguePaginationProps) {
  if (catalogue.pageCount <= 1) {
    return null;
  }

  const start = (catalogue.page - 1) * 24 + 1;
  const end = Math.min(catalogue.page * 24, catalogue.totalCount);
  const prevPage = catalogue.page > 1 ? catalogue.page - 1 : undefined;
  const nextPage =
    catalogue.page < catalogue.pageCount ? catalogue.page + 1 : undefined;

  return (
    <div className="mt-space-xl flex flex-col items-center justify-between gap-space-md border-t border-surface-container-highest/40 pt-space-lg sm:flex-row">
      <p className="text-body-sm text-on-surface-variant">
        Показване на уискита {start} — {end} от общо {catalogue.totalCount}
      </p>
      <nav aria-label="Страници" className="flex items-center gap-2">
        {prevPage ? (
          <Link
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
            href={buildCatalogueHref(query, { page: prevPage })}
            aria-label="Предишна страница"
          >
            <Icon fontSize={20} name="chevron_left" />
          </Link>
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-lowest text-outline opacity-40">
            <Icon fontSize={20} name="chevron_left" />
          </span>
        )}

        {Array.from({ length: catalogue.pageCount }, (_, index) => {
          const page = index + 1;
          const isCurrent = page === catalogue.page;
          if (isCurrent) {
            return (
              <span
                aria-current="page"
                className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-primary px-3 text-label-md font-bold text-on-primary"
                key={page}
              >
                {page}
              </span>
            );
          }
          return (
            <Link
              className="flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-lg bg-surface-container px-3 text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
              href={buildCatalogueHref(query, { page })}
              key={page}
            >
              {page}
            </Link>
          );
        })}

        {nextPage ? (
          <Link
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-surface-container px-space-sm py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
            href={buildCatalogueHref(query, { page: nextPage })}
          >
            Следваща
            <Icon fontSize={18} name="chevron_right" />
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
