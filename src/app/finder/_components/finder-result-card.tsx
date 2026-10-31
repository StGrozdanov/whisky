import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { PromotionPrices } from "@/components/promotion-prices";
import type { FinderRecommendation } from "@/finder/finder";
import { formatPriceEur } from "@/utils/format-price-eur";
import { ORIGIN_LABELS } from "@/utils/origin-labels";
import { whiskyHref } from "@/utils/whisky-href";

/**
 * A Finder result: the Catalogue Whisky with the AI's short reason. It shows
 * no score, percentage, or source; price and Buy / Ask us come from the Shop.
 */
export function FinderResultCard({
  recommendation,
}: {
  recommendation: FinderRecommendation;
}) {
  const { whisky, reason } = recommendation;
  const isAskUs = whisky.action === "ask-us";

  return (
    <article className="h-full">
      <Link
        className="group flex h-full cursor-pointer flex-col justify-between gap-space-md rounded-xl border border-surface-container-highest/40 bg-surface-container-lowest p-space-md shadow-xl transition-all duration-300 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.8),0_0_20px_rgba(217,119,6,0.15)]"
        href={whiskyHref(whisky.id)}
      >
        <div className="flex gap-space-md">
          <div className="flex h-36 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-surface-container-low to-surface-container-lowest">
            <Image
              alt={whisky.name}
              className="h-32 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105"
              height={140}
              src={whisky.photoUrl}
              unoptimized
              width={90}
            />
          </div>
          <div className="flex flex-col gap-space-xs">
            <span className="text-label-sm text-outline uppercase tracking-wider">
              {ORIGIN_LABELS[whisky.origin]}
            </span>
            <h4 className="font-headline text-headline-sm text-on-surface transition-colors group-hover:text-primary">
              {whisky.name}
            </h4>
            <p className="text-body-md text-on-surface-variant">{reason}</p>
          </div>
        </div>

        <div className="space-y-space-sm border-t border-surface-container-highest/40 pt-space-sm">
          {whisky.promotion ? (
            <PromotionPrices
              discountedPriceEur={whisky.promotion.discountedPriceEur}
              priorPriceEur={whisky.promotion.priorPriceEur}
              regularPriceEur={whisky.priceEur}
            />
          ) : (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-technical-data text-outline">Цена</span>
              <span className="font-headline text-headline-md font-bold text-primary">
                {formatPriceEur(whisky.priceEur)}
              </span>
            </div>
          )}
          {isAskUs ? (
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
