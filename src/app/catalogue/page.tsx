import { CataloguePage } from "@/catalogue/catalogue-page";

type PageProps = {
  searchParams: Promise<{
    origin?: string | string[];
    flavour?: string | string[];
  }>;
};

export default function CatalogueRoutePage({ searchParams }: PageProps) {
  return <CataloguePage searchParams={searchParams} basePath="/catalogue" />;
}
