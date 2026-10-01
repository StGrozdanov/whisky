import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WhiskyDetailView } from "@/app/whiskies/_components/whisky-detail-view";
import { getShop } from "@/shop/get-shop";

export const dynamic = "force-dynamic";

type WhiskyRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: WhiskyRouteProps): Promise<Metadata> {
  const { id } = await params;
  const shop = await getShop();
  const page = await shop.whisky(id);

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
  const shop = await getShop();
  const page = await shop.whisky(id);

  if (!page) {
    notFound();
  }

  return <WhiskyDetailView page={page} />;
}
