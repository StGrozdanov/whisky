import Image from "next/image";
import { Icon } from "@/components/icon";
import type { CatalogueCard } from "@/shop/types";
import { formatPriceEur } from "@/utils/format-price-eur";
import { ORIGIN_LABELS } from "@/utils/origin-labels";

function formatScore(score: number): string {
  return `${score.toFixed(1)}/10`;
}

function ageLabel(ageYears: number | undefined): string {
  if (ageYears === undefined) {
    return "NAS";
  }
  return `${ageYears} години`;
}

function experienceLabel(
  level: CatalogueCard["experienceLevel"],
): string | undefined {
  if (level === "beginner") {
    return "За начинаещи";
  }
  if (level === "advanced") {
    return "За напреднали";
  }
  return undefined;
}

function metaLine(card: CatalogueCard): string {
  const origin = ORIGIN_LABELS[card.origin];
  if (card.abv !== undefined) {
    return `${origin} • ${card.abv.toFixed(1)}% ABV`;
  }
  return origin;
}

type CatalogueWhiskyCardProps = {
  card: CatalogueCard;
};

export function CatalogueWhiskyCard({ card }: CatalogueWhiskyCardProps) {
  const age = ageLabel(card.ageYears);
  const experience = experienceLabel(card.experienceLevel);
  const isAskUs = card.action === "ask-us";

  return (
    <article className="group flex h-full flex-col justify-between rounded-xl border border-surface-container-highest/40 bg-surface-container-lowest p-space-md shadow-xl transition-all duration-300 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.8),0_0_20px_rgba(217,119,6,0.15)]">
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between gap-1">
          <span className="rounded bg-surface-container-high px-2 py-0.5 text-label-sm tracking-wider text-on-surface uppercase">
            {card.priceTier} TIER
          </span>
          {card.displayedScore !== undefined ? (
            <span className="inline-flex items-center gap-0.5 rounded bg-surface-container px-2 py-0.5 text-technical-data font-bold text-secondary">
              <Icon fontSize={14} name="star" />
              {formatScore(card.displayedScore)}
            </span>
          ) : null}
        </div>

        <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-surface-container-low to-surface-container-lowest">
          <Image
            alt={card.name}
            className="h-36 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105"
            height={160}
            src={card.photoUrl}
            unoptimized
            width={120}
          />
          <span className="absolute bottom-2 left-2 z-20 rounded bg-surface-container-lowest/80 px-2 py-0.5 font-mono text-label-sm text-on-surface-variant backdrop-blur-md">
            {metaLine(card)}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm text-outline">
              {age}
            </span>
            {experience ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-label-sm text-primary">
                {experience}
              </span>
            ) : null}
          </div>
          <h2 className="font-headline text-headline-sm text-on-surface transition-colors group-hover:text-primary">
            {card.name}
          </h2>
          {card.tagline ? (
            <p className="line-clamp-2 text-body-sm text-on-surface-variant">
              {card.tagline}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-space-md space-y-space-sm border-t border-surface-container-highest/40 pt-space-sm">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-technical-data text-outline">Цена</span>
          <span className="font-headline text-headline-md font-bold text-primary">
            {formatPriceEur(card.priceEur)}
          </span>
        </div>
        {isAskUs ? (
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-transparent py-2.5 text-label-md font-bold text-on-surface uppercase tracking-wider transition-colors hover:border-secondary hover:bg-surface-container"
            type="button"
          >
            <Icon fontSize={18} name="mail" />
            <span>Попитай ни</span>
          </button>
        ) : (
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-label-md font-bold text-on-primary uppercase tracking-wider shadow-sm transition-colors hover:bg-primary-fixed"
            type="button"
          >
            <Icon fontSize={18} name="shopping_bag" />
            <span>Купи</span>
          </button>
        )}
      </div>
    </article>
  );
}
