import { CatalogueFilters } from "@/catalogue/catalogue-filters";
import { CatalogueGrid } from "@/catalogue/catalogue-grid";
import { getShop } from "@/shop/get-shop";
import {
  FLAVOUR_TAGS,
  type FlavourTag,
  ORIGINS,
  type Origin,
} from "@/shop/types";

type CataloguePageProps = {
  searchParams: Promise<{
    origin?: string | string[];
    flavour?: string | string[];
  }>;
  basePath: string;
};

export async function CataloguePage({
  searchParams,
  basePath,
}: CataloguePageProps) {
  const params = await searchParams;
  const origin = parseOrigin(params.origin);
  const flavourTags = parseFlavourTags(params.flavour);

  const shop = getShop();
  const whiskies = shop.catalogue({
    origin,
    flavourTags: flavourTags.length > 0 ? flavourTags : undefined,
  });

  return (
    <main className="catalogue-page">
      <header className="catalogue-header">
        <p className="eyebrow">Бутик уиски</p>
        <h1>Каталог</h1>
        <p className="lede">
          Кратък избран списък. Цената е тази, която Buy би използвал — In stock
          SKU, или Ask us SKU ако няма In stock.
        </p>
      </header>

      <CatalogueFilters
        basePath={basePath}
        selectedOrigin={origin}
        selectedFlavourTags={flavourTags}
      />

      <CatalogueGrid whiskies={whiskies} />
    </main>
  );
}

function parseOrigin(value: string | string[] | undefined): Origin | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return undefined;
  }
  if ((ORIGINS as readonly string[]).includes(raw)) {
    return raw as Origin;
  }
  return undefined;
}

function parseFlavourTags(value: string | string[] | undefined): FlavourTag[] {
  if (!value) {
    return [];
  }
  const values = Array.isArray(value) ? value : [value];
  return values.filter((tag): tag is FlavourTag =>
    (FLAVOUR_TAGS as readonly string[]).includes(tag),
  );
}
