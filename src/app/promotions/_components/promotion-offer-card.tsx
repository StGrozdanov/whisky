import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { PromotionPrices } from "@/components/promotion-prices";
import type { Promotion } from "@/shop/types";
import { ORIGIN_LABELS } from "@/utils/origin-labels";
import { promotionEndLabel } from "@/utils/promotion-labels";
import { whiskyHref } from "@/utils/whisky-href";

function metaLine(promotion: Promotion): string {
  const parts = [
    ORIGIN_LABELS[promotion.whisky.origin],
    `${promotion.volumeMl}ml`,
  ];
  if (promotion.whisky.abv !== undefined) {
    parts.push(`${promotion.whisky.abv.toFixed(1)}% ABV`);
  }
  return parts.join(" • ");
}

export function PromotionOfferCard({ promotion }: { promotion: Promotion }) {
  const endLabel = promotionEndLabel(promotion.endsAt);

  return (
    <article className="h-full">
      <Link
        className="group flex h-full cursor-pointer flex-col justify-between rounded-xl border border-surface-container-highest/40 bg-surface-container-lowest p-space-md shadow-xl transition-all duration-300 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.8),0_0_20px_rgba(217,119,6,0.15)]"
        href={whiskyHref(promotion.whisky.id)}
      >
        <div className="flex flex-col gap-space-sm">
          <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-surface-container-low to-surface-container-lowest">
            <span className="absolute top-2 left-2 z-10 rounded bg-primary px-2 py-0.5 text-label-sm font-bold text-on-primary">
              -{promotion.discountPercent}%
            </span>
            <Image
              alt={promotion.whisky.name}
              className="h-36 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105"
              height={160}
              src={promotion.whisky.photoUrl}
              unoptimized
              width={120}
            />
          </div>

          <div className="space-y-1">
            <span className="text-technical-data text-outline">
              {metaLine(promotion)}
            </span>
            <h2 className="font-headline text-headline-sm text-on-surface transition-colors group-hover:text-primary">
              {promotion.whisky.name}
            </h2>
            {endLabel ? (
              <p className="inline-flex items-center gap-1 text-technical-data text-secondary">
                <Icon fontSize={14} name="schedule" />
                {endLabel}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-space-md space-y-space-sm border-t border-surface-container-highest/40 pt-space-sm">
          <PromotionPrices
            discountedPriceEur={promotion.discountedPriceEur}
            priorPriceEur={promotion.priorPriceEur}
            regularPriceEur={promotion.regularPriceEur}
          />
          {promotion.action === "ask-us" ? (
            <span className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-transparent py-2.5 text-label-md font-bold text-on-surface uppercase tracking-wider transition-colors group-hover:border-secondary group-hover:bg-surface-container">
              <Icon fontSize={18} name="mail" />
              <span>Попитай ни</span>
            </span>
          ) : (
            <span className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-label-md font-bold text-on-primary uppercase tracking-wider shadow-sm transition-colors group-hover:bg-primary-fixed">
              <Icon fontSize={18} name="shopping_bag" />
              <span>Купи</span>
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
