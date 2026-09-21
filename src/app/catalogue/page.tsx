import { getShop } from "@/shop/get-shop";
import { CatalogueView } from "./_components/catalogue-view";
import {
  type CatalogueSearchParams,
  parseCatalogueQuery,
} from "./parse-catalogue-query";

export const dynamic = "force-dynamic";

type CataloguePageProps = {
  searchParams: Promise<CatalogueSearchParams>;
};

export default async function CataloguePage({
  searchParams,
}: CataloguePageProps) {
  const params = await searchParams;
  const query = parseCatalogueQuery(params);
  const catalogue = await getShop().catalogue(query);

  return <CatalogueView catalogue={catalogue} query={query} />;
}
