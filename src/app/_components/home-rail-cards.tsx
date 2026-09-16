import Image from "next/image";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import type {
  HomeDiscoveryPack,
  HomeNewWhisky,
  HomePromotion,
  HomeWhisky,
} from "@/shop/types";
import { ORIGIN_LABELS } from "@/utils/origin-labels";

function formatPriceEur(price: number): string {
  return `${price.toFixed(2)} €`;
}

function whiskyMeta(whisky: HomeWhisky): string {
  const originLabel = ORIGIN_LABELS[whisky.origin];
  if (whisky.abv !== undefined) {
    return `${originLabel} • ${whisky.abv.toFixed(1)}%`;
  }
  return originLabel;
}

type RailWhiskyCardChromeProps = {
  name: string;
  meta: string;
  photoUrl: string;
  badge: ReactNode;
  priceRow: ReactNode;
};

function RailWhiskyCardChrome({
  name,
  meta,
  photoUrl,
  badge,
  priceRow,
}: RailWhiskyCardChromeProps) {
  return (
    <div className="group relative flex h-full w-full flex-col justify-between rounded-xl bg-surface-container-low p-space-md transition-all hover:bg-surface-container">
      <div className="flex flex-col">
        <div className="relative mb-space-sm flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-container-lowest">
          {badge}
          <button
            className="absolute top-2 right-2 z-10 cursor-pointer rounded-lg bg-surface/80 p-1.5 text-on-surface-variant transition-colors hover:bg-surface"
            title="Любими"
            type="button"
          >
            <Icon fontSize={18} name="favorite_border" />
          </button>
          <Image
            alt={name}
            className="h-4/5 w-auto object-contain transition-transform duration-700 group-hover:scale-105"
            height={320}
            src={photoUrl}
            unoptimized
            width={220}
          />
        </div>
        <span className="mb-1 text-technical-data text-outline">{meta}</span>
        <h3 className="mb-2 truncate font-headline text-headline-sm text-on-surface">
          {name}
        </h3>
      </div>
      <div className="border-t border-surface-container-highest/40 pt-space-xs">
        {priceRow}
        <button
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-label-md font-bold text-on-primary uppercase tracking-wider shadow-sm transition-colors hover:bg-primary-fixed"
          type="button"
        >
          <Icon fontSize={18} name="shopping_bag" />
          <span>Купи</span>
        </button>
      </div>
    </div>
  );
}

export function PromotionCard({ promotion }: { promotion: HomePromotion }) {
  return (
    <RailWhiskyCardChrome
      badge={
        <span className="absolute top-2 left-2 z-10 rounded bg-primary px-2 py-0.5 text-label-sm font-bold text-on-primary">
          -{promotion.discountPercent}%
        </span>
      }
      meta={whiskyMeta(promotion.whisky)}
      name={promotion.whisky.name}
      photoUrl={promotion.whisky.photoUrl}
      priceRow={
        <div className="mb-space-sm flex min-h-9 flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-headline-md font-bold text-primary">
              {formatPriceEur(promotion.discountedPriceEur)}
            </span>
            <span className="text-technical-data text-outline line-through">
              {formatPriceEur(promotion.priorPriceEur)}
            </span>
          </div>
          <span className="text-technical-data font-semibold whitespace-nowrap text-secondary">
            Спестяваш {formatPriceEur(promotion.savingsEur)}
          </span>
        </div>
      }
    />
  );
}

const NEW_WHISKY_BADGE_CLASS =
  "bg-secondary text-on-secondary absolute top-2 left-2 z-10 rounded px-2 py-0.5 text-label-sm font-bold tracking-wider uppercase";

const NEW_WHISKY_EXCLUSIVE_BADGE_CLASS =
  "bg-primary-container text-on-primary-container absolute top-2 left-2 z-10 rounded px-2 py-0.5 text-label-sm font-bold tracking-wider uppercase";

function newWhiskyBadgeClassName(badge: string): string {
  if (badge === "Ексклузивно") {
    return NEW_WHISKY_EXCLUSIVE_BADGE_CLASS;
  }
  return NEW_WHISKY_BADGE_CLASS;
}

export function NewWhiskyCard({ entry }: { entry: HomeNewWhisky }) {
  return (
    <RailWhiskyCardChrome
      badge={
        <span className={newWhiskyBadgeClassName(entry.badge)}>
          {entry.badge}
        </span>
      }
      meta={whiskyMeta(entry.whisky)}
      name={entry.whisky.name}
      photoUrl={entry.whisky.photoUrl}
      priceRow={
        <div className="mb-space-sm flex min-h-9 flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <span className="font-headline text-headline-md font-bold text-primary">
            {formatPriceEur(entry.displayPriceEur)}
          </span>
          <span className="text-technical-data whitespace-nowrap text-on-surface-variant">
            {entry.note}
          </span>
        </div>
      }
    />
  );
}

export function DiscoveryPackCard({ pack }: { pack: HomeDiscoveryPack }) {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-xl bg-surface-container p-space-lg shadow-md">
      <div>
        <div className="mb-space-md flex items-start justify-between">
          <div>
            <h3 className="font-headline text-headline-md text-on-surface">
              {pack.title}
            </h3>
          </div>
          <div className="text-right">
            <span className="font-headline text-headline-md font-bold text-primary">
              {formatPriceEur(pack.priceEur)}
            </span>
          </div>
        </div>
        <div className="relative mb-space-md flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-container-lowest">
          <Image
            alt={pack.title}
            className="h-4/5 w-auto object-contain"
            height={240}
            src={pack.photoUrl}
            unoptimized
            width={320}
          />
        </div>
        <div className="mb-space-md space-y-2 text-body-sm">
          {pack.lineup.map((item) => (
            <div
              className="flex items-center justify-between gap-2 rounded bg-surface-container-low p-2"
              key={item.name}
            >
              <span className="font-semibold whitespace-nowrap text-on-surface">
                {item.name}
              </span>
              <span className="text-right whitespace-nowrap text-on-surface-variant">
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-space-sm pt-space-xs">
        <button
          className="flex flex-1 cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-primary py-3 text-label-md text-on-primary uppercase tracking-wider shadow-sm transition-colors hover:bg-primary-fixed"
          type="button"
        >
          <Icon fontSize={18} name="add_shopping_cart" />
          <span>Поръчай Сет ({formatPriceEur(pack.priceEur)})</span>
        </button>
        <button
          className="cursor-pointer rounded-lg bg-surface-container-high p-3 text-on-surface-variant transition-colors hover:bg-surface-bright"
          title="Добави в любими"
          type="button"
        >
          <Icon fontSize={20} name="favorite_border" />
        </button>
      </div>
    </div>
  );
}
