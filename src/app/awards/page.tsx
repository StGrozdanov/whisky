import type { Metadata } from "next";
import { CatalogueWhiskyCard } from "@/app/catalogue/_components/catalogue-whisky-card";
import {
  DiscoveryEmptyState,
  DiscoveryPageLayout,
} from "@/components/discovery-page";
import { Icon } from "@/components/icon";
import { getShop } from "@/shop/get-shop";
import type { WhiskyAward } from "@/shop/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Наградени уискита",
};

function AwardList({ awards }: { awards: WhiskyAward[] }) {
  return (
    <ul aria-label="Награди" className="space-y-1">
      {awards.map((award) => (
        <li
          className="flex items-start gap-1.5 text-body-sm text-on-surface-variant"
          key={`${award.organisation}-${award.year}-${award.title}`}
        >
          <Icon
            className="mt-0.5 text-secondary"
            fontSize={16}
            name="military_tech"
          />
          <span>
            <span className="font-semibold text-on-surface">{award.title}</span>{" "}
            • {award.organisation} {award.year}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function AwardsPage() {
  const shop = await getShop();
  const awarded = await shop.awards();

  return (
    <DiscoveryPageLayout
      intro="Уискита от нашата селекция, отличени на международни конкурси."
      title="Наградени уискита"
    >
      {awarded.length === 0 ? (
        <DiscoveryEmptyState
          icon="military_tech"
          text="Скоро тук ще се появят отличените уискита от селекцията."
          title="Няма наградени уискита"
        />
      ) : (
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
          {awarded.map((entry) => (
            <CatalogueWhiskyCard
              card={entry.whisky}
              extra={<AwardList awards={entry.awards} />}
              key={entry.whisky.id}
            />
          ))}
        </div>
      )}
    </DiscoveryPageLayout>
  );
}
