import { cache, Suspense } from "react";
import { getShop } from "@/shop/get-shop";
import type { CatalogueQuery } from "@/shop/types";
import {
  CatalogueCount,
  CatalogueCountFallback,
  CatalogueLayout,
  CatalogueResults,
  CatalogueResultsFallback,
} from "./_components/catalogue-view";
import {
  type CatalogueSearchParams,
  parseCatalogueQuery,
} from "./parse-catalogue-query";

export const dynamic = "force-dynamic";

type CataloguePageProps = {
  searchParams: Promise<CatalogueSearchParams>;
};

const loadCatalogue = cache(async (query: CatalogueQuery) => {
  const shop = await getShop();
  return shop.catalogue(query);
});

function catalogueSuspenseKey(query: CatalogueQuery): string {
  return [
    query.origin ? query.origin : "",
    query.priceTier ? query.priceTier : "",
    query.age ? query.age : "",
    query.minScore !== undefined ? String(query.minScore) : "",
    query.experience ? query.experience : "",
    query.page !== undefined ? String(query.page) : "1",
  ].join("|");
}

async function CatalogueCountSlot({ query }: { query: CatalogueQuery }) {
  const catalogue = await loadCatalogue(query);
  return <CatalogueCount catalogue={catalogue} />;
}

async function CatalogueResultsSlot({ query }: { query: CatalogueQuery }) {
  const catalogue = await loadCatalogue(query);
  return <CatalogueResults catalogue={catalogue} query={query} />;
}

export default async function CataloguePage({
  searchParams,
}: CataloguePageProps) {
  const params = await searchParams;
  const query = parseCatalogueQuery(params);
  const suspenseKey = catalogueSuspenseKey(query);

  return (
    <CatalogueLayout
      count={
        <Suspense
          fallback={<CatalogueCountFallback />}
          key={`count-${suspenseKey}`}
        >
          <CatalogueCountSlot query={query} />
        </Suspense>
      }
      query={query}
    >
      <Suspense
        fallback={<CatalogueResultsFallback />}
        key={`results-${suspenseKey}`}
      >
        <CatalogueResultsSlot query={query} />
      </Suspense>
    </CatalogueLayout>
  );
}
