import type { Metadata } from "next";
import {
  DiscoveryEmptyState,
  DiscoveryPageLayout,
} from "@/components/discovery-page";
import { getShop } from "@/shop/get-shop";
import { PromotionOfferCard } from "./_components/promotion-offer-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Промоции",
};

export default async function PromotionsPage() {
  const shop = await getShop();
  const promotions = await shop.promotions();

  return (
    <DiscoveryPageLayout
      intro="Актуални намаления с ясно посочени промоционална, редовна и най-ниска цена за последните 30 дни."
      title="Промоции"
    >
      {promotions.length === 0 ? (
        <DiscoveryEmptyState
          icon="local_offer"
          text="В момента няма активни промоции. Разгледайте цялата селекция."
          title="Няма активни промоции"
        />
      ) : (
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
          {promotions.map((promotion) => (
            <PromotionOfferCard key={promotion.skuId} promotion={promotion} />
          ))}
        </div>
      )}
    </DiscoveryPageLayout>
  );
}
