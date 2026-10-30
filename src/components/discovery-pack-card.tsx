import Image from "next/image";
import { Icon } from "@/components/icon";
import type { DiscoveryPack } from "@/shop/types";
import { formatPriceEur } from "@/utils/format-price-eur";

type DiscoveryPackCardProps = {
  pack: DiscoveryPack;
  headingLevel: 2 | 3;
};

export function DiscoveryPackCard({
  pack,
  headingLevel,
}: DiscoveryPackCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className="flex h-full w-full flex-col justify-between rounded-xl bg-surface-container p-space-lg shadow-md">
      <div>
        <div className="mb-space-md flex items-start justify-between">
          <div>
            <Heading className="font-headline text-headline-md text-on-surface">
              {pack.title}
            </Heading>
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
        {pack.action === "buy" ? (
          <button
            className="flex flex-1 cursor-pointer items-center justify-center gap-space-xs rounded-lg bg-primary py-3 text-label-md text-on-primary uppercase tracking-wider shadow-sm transition-colors hover:bg-primary-fixed"
            type="button"
          >
            <Icon fontSize={18} name="add_shopping_cart" />
            <span>Поръчай Сет ({formatPriceEur(pack.priceEur)})</span>
          </button>
        ) : (
          <button
            className="flex flex-1 cursor-pointer items-center justify-center gap-space-xs rounded-lg border border-outline-variant bg-transparent py-3 text-label-md font-bold text-on-surface uppercase tracking-wider transition-colors hover:border-secondary hover:bg-surface-container-high"
            type="button"
          >
            <Icon fontSize={18} name="mail" />
            <span>Попитай ни</span>
          </button>
        )}
        <button
          className="cursor-pointer rounded-lg bg-surface-container-high p-3 text-on-surface-variant transition-colors hover:bg-surface-bright"
          title="Добави в любими"
          type="button"
        >
          <Icon fontSize={20} name="favorite_border" />
        </button>
      </div>
    </article>
  );
}
