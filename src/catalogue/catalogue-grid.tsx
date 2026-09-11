import Image from "next/image";
import { ORIGIN_LABELS } from "@/catalogue/origin-labels";
import type { CatalogueWhisky } from "@/shop/types";

type CatalogueGridProps = {
  whiskies: CatalogueWhisky[];
};

export function CatalogueGrid({ whiskies }: CatalogueGridProps) {
  if (whiskies.length === 0) {
    return <p className="empty">Няма уискита за тези филтри.</p>;
  }

  return (
    <ul className="catalogue-grid">
      {whiskies.map((whisky) => (
        <li key={whisky.name} className="catalogue-card">
          <Image
            src={whisky.photoUrl}
            alt={whisky.name}
            width={320}
            height={420}
          />
          <div className="catalogue-card-body">
            <h2>{whisky.name}</h2>
            <p className="origin">{ORIGIN_LABELS[whisky.origin]}</p>
            <p className="price">{formatEuro(whisky.priceEuro)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatEuro(priceEuro: number): string {
  return `${priceEuro.toFixed(2)} €`;
}
