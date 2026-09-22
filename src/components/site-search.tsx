"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  buildCatalogueHref,
  searchHitHref,
} from "@/app/catalogue/parse-catalogue-query";
import { searchCatalogue } from "@/app/search-catalogue";
import { Icon } from "@/components/icon";
import {
  SEARCH_HIT_KINDS,
  type SearchHit,
  type SearchHitKind,
} from "@/shop/types";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

const KIND_LABELS: Record<SearchHitKind, string> = {
  whisky: "Уиски",
  distillery: "Дестилерия",
  country: "Държава",
  region: "Регион",
};

export function SiteSearch() {
  const router = useRouter();
  const listboxId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[] | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setHits(undefined);
      setOpen(false);
      setFailed(false);
      setActiveIndex(-1);
      return;
    }

    let cancelled = false;
    setHits(undefined);
    setOpen(false);
    setFailed(false);
    setActiveIndex(-1);

    const timer = window.setTimeout(() => {
      searchCatalogue(trimmed)
        .then((next) => {
          if (cancelled) {
            return;
          }
          setHits(next);
          setFailed(false);
          setOpen(true);
        })
        .catch(() => {
          if (cancelled) {
            return;
          }
          setHits([]);
          setFailed(true);
          setOpen(true);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const root = rootRef.current;
      if (!root) {
        return;
      }
      if (event.target instanceof Node && root.contains(event.target)) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return;
    }

    if (hits && activeIndex >= 0 && activeIndex < hits.length) {
      router.push(searchHitHref(hits[activeIndex]));
      setOpen(false);
      return;
    }

    router.push(buildCatalogueHref({}, { q: trimmed }));
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!open || !hits || hits.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => {
        if (current >= hits.length - 1) {
          return 0;
        }
        return current + 1;
      });
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => {
        if (current <= 0) {
          return hits.length - 1;
        }
        return current - 1;
      });
    }
  }

  const groups = SEARCH_HIT_KINDS.map((kind) => {
    const kindHits = hits
      ? hits
          .map((hit, index) => ({ hit, index }))
          .filter((item) => item.hit.kind === kind)
      : [];
    return { kind, hits: kindHits };
  }).filter((group) => group.hits.length > 0);

  const activeId =
    activeIndex >= 0 ? `${listboxId}-hit-${activeIndex}` : undefined;

  return (
    <form className="relative w-full" onSubmit={onSubmit} ref={rootRef}>
      <Icon
        className="pointer-events-none absolute top-1/2 left-space-sm -translate-y-1/2 text-outline"
        fontSize={22}
        name="search"
      />
      <input
        aria-activedescendant={open ? activeId : undefined}
        aria-autocomplete="list"
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-label="Търсене"
        role="combobox"
        autoComplete="off"
        className="w-full rounded-lg bg-surface-container-lowest py-1.5 pr-space-sm pl-9 text-technical-data text-on-surface shadow-inner placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:outline-none"
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        onKeyDown={onKeyDown}
        placeholder="Търси уиски, дестилерия, държава..."
        type="search"
        value={query}
      />
      {open ? (
        <div
          className="absolute top-[calc(100%+4px)] z-50 max-h-80 w-full overflow-y-auto rounded-lg border border-surface-container-highest/40 bg-surface-container-lowest py-1 shadow-xl"
          id={listboxId}
          role="listbox"
          aria-label="Предложения"
        >
          {failed ? (
            <p className="px-3 py-2 text-body-sm text-on-surface" role="alert">
              Търсенето не успя. Опитайте отново.
            </p>
          ) : null}
          {!failed && groups.length === 0 ? (
            <p className="px-3 py-2 text-body-sm text-on-surface-variant">
              Няма съвпадения
            </p>
          ) : null}
          {groups.map((group) => (
            <div key={group.kind}>
              <p className="px-3 pt-2 pb-1 text-technical-data text-outline uppercase">
                {KIND_LABELS[group.kind]}
              </p>
              {group.hits.map((item) => {
                const selected = item.index === activeIndex;
                return (
                  <Link
                    aria-label={`${KIND_LABELS[item.hit.kind]}: ${item.hit.name}`}
                    aria-selected={selected}
                    className={
                      selected
                        ? "block cursor-pointer bg-surface-container-high px-3 py-2 text-body-sm break-words text-on-surface"
                        : "block cursor-pointer px-3 py-2 text-body-sm break-words text-on-surface hover:bg-surface-container"
                    }
                    href={searchHitHref(item.hit)}
                    id={`${listboxId}-hit-${item.index}`}
                    key={`${item.hit.kind}-${item.index}`}
                    onClick={() => {
                      setOpen(false);
                    }}
                    role="option"
                  >
                    {item.hit.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </form>
  );
}
