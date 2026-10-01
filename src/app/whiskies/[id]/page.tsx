import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { WhiskyDetailView } from "@/app/whiskies/_components/whisky-detail-view";
import { getShop } from "@/shop/get-shop";

export const dynamic = "force-dynamic";

type WhiskyRouteProps = {
  params: Promise<{ id: string }>;
};

const loadWhiskyPage = cache(async (id: string) => {
  const shop = await getShop();
  return shop.whisky(id);
});

export async function generateMetadata({
  params,
}: WhiskyRouteProps): Promise<Metadata> {
  const { id } = await params;
  const page = await loadWhiskyPage(id);

  if (!page) {
    return {
      title: "Уиски",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: page.name,
    robots: { index: true, follow: true },
  };
}

export default async function WhiskyRoutePage({ params }: WhiskyRouteProps) {
  const { id } = await params;
  const page = await loadWhiskyPage(id);

  if (!page) {
    notFound();
  }

  return <WhiskyDetailView page={page} />;
}
