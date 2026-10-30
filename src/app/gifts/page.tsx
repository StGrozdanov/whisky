import type { Metadata } from "next";
import { CatalogueWhiskyCard } from "@/app/catalogue/_components/catalogue-whisky-card";
import { DiscoveryPackCard } from "@/components/discovery-pack-card";
import {
  DiscoveryEmptyState,
  DiscoveryPageLayout,
} from "@/components/discovery-page";
import { getShop } from "@/shop/get-shop";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Подаръци",
};

export default async function GiftsPage() {
  const shop = await getShop();
  const gifts = await shop.gifts();

  return (
    <DiscoveryPageLayout
      intro="Уискита и сетове, които подбрахме специално за подарък."
      title="Подаръци"
    >
      {gifts.length === 0 ? (
        <DiscoveryEmptyState
          icon="featured_seasonal_and_gifts"
          text="Подготвяме нова подборка от подаръци. Дотогава разгледайте цялата селекция."
          title="Подборката от подаръци се обновява"
        />
      ) : (
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
          {gifts.map((gift) =>
            gift.kind === "whisky" ? (
              <CatalogueWhiskyCard
                card={gift.whisky}
                key={`whisky-${gift.whisky.id}`}
              />
            ) : (
              <div className="sm:col-span-2" key={`pack-${gift.pack.id}`}>
                <DiscoveryPackCard headingLevel={2} pack={gift.pack} />
              </div>
            ),
          )}
        </div>
      )}
    </DiscoveryPageLayout>
  );
}
