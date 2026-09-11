import Link from "next/link";
import { ORIGIN_LABELS } from "@/catalogue/origin-labels";
import {
  FLAVOUR_TAGS,
  type FlavourTag,
  ORIGINS,
  type Origin,
} from "@/shop/types";

type CatalogueFiltersProps = {
  basePath: string;
  selectedOrigin?: Origin;
  selectedFlavourTags: FlavourTag[];
};

export function CatalogueFilters({
  basePath,
  selectedOrigin,
  selectedFlavourTags,
}: CatalogueFiltersProps) {
  const hasFilters = Boolean(selectedOrigin) || selectedFlavourTags.length > 0;

  return (
    <section className="filters" aria-label="Филтри">
      <div className="filter-group">
        <h2>Произход</h2>
        <div className="chips">
          {ORIGINS.map((origin) => {
            const isActive = selectedOrigin === origin;
            const href = catalogueHref(
              basePath,
              isActive ? undefined : origin,
              selectedFlavourTags,
            );
            return (
              <Link
                key={origin}
                href={href}
                className={
                  isActive
                    ? "chip chip-active cursor-pointer"
                    : "chip cursor-pointer"
                }
                aria-pressed={isActive}
              >
                {ORIGIN_LABELS[origin]}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <h2>Вкусове</h2>
        <div className="chips">
          {FLAVOUR_TAGS.map((tag) => {
            const isActive = selectedFlavourTags.includes(tag);
            const nextFlavourTags = isActive
              ? selectedFlavourTags.filter((current) => current !== tag)
              : [...selectedFlavourTags, tag];
            const href = catalogueHref(
              basePath,
              selectedOrigin,
              nextFlavourTags,
            );
            return (
              <Link
                key={tag}
                href={href}
                className={
                  isActive
                    ? "chip chip-active cursor-pointer"
                    : "chip cursor-pointer"
                }
                aria-pressed={isActive}
              >
                {tag}
              </Link>
            );
          })}
        </div>
      </div>

      {hasFilters ? (
        <Link href={basePath} className="clear-filters cursor-pointer">
          Изчисти филтрите
        </Link>
      ) : null}
    </section>
  );
}

function catalogueHref(
  basePath: string,
  origin: Origin | undefined,
  flavourTags: FlavourTag[],
): string {
  const params = new URLSearchParams();
  if (origin) {
    params.set("origin", origin);
  }
  for (const tag of flavourTags) {
    params.append("flavour", tag);
  }
  const query = params.toString();
  if (query) {
    return `${basePath}?${query}`;
  }
  return basePath;
}
