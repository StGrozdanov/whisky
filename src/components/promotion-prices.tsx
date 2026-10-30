import { formatPriceEur } from "@/utils/format-price-eur";

type PromotionPricesProps = {
  discountedPriceEur: number;
  priorPriceEur: number;
  regularPriceEur: number;
};

export function PromotionPrices({
  discountedPriceEur,
  priorPriceEur,
  regularPriceEur,
}: PromotionPricesProps) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-technical-data text-outline">
          Промоционална цена
        </span>
        <span className="font-headline text-headline-md font-bold whitespace-nowrap text-primary">
          {formatPriceEur(discountedPriceEur)}
        </span>
      </div>
      <dl className="space-y-1 text-technical-data text-on-surface-variant">
        <div className="flex justify-between gap-2">
          <dt>Най-ниска цена за последните 30 дни</dt>
          <dd className="whitespace-nowrap line-through">
            {formatPriceEur(priorPriceEur)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Редовна цена</dt>
          <dd className="whitespace-nowrap">
            {formatPriceEur(regularPriceEur)}
          </dd>
        </div>
      </dl>
    </>
  );
}
