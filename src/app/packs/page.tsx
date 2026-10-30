import type { Metadata } from "next";
import { DiscoveryPackCard } from "@/components/discovery-pack-card";
import {
  DiscoveryEmptyState,
  DiscoveryPageLayout,
} from "@/components/discovery-page";
import { getShop } from "@/shop/get-shop";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discovery сетове",
};

export default async function PacksPage() {
  const shop = await getShop();
  const packs = await shop.discoveryPacks();

  return (
    <DiscoveryPageLayout
      intro="Сетове от 50ml мостри, с които да сравните няколко уискита, преди да изберете цяла бутилка."
      title="Discovery сетове"
    >
      {packs.length === 0 ? (
        <DiscoveryEmptyState
          icon="inventory_2"
          text="В момента няма Discovery сетове. Разгледайте цялата селекция."
          title="Няма налични Discovery сетове"
        />
      ) : (
        <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-2">
          {packs.map((pack) => (
            <DiscoveryPackCard headingLevel={2} key={pack.id} pack={pack} />
          ))}
        </div>
      )}
    </DiscoveryPageLayout>
  );
}
