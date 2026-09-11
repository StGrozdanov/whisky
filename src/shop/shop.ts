import type {
  CatalogueFilter,
  CatalogueStore,
  CatalogueWhisky,
  FlavourTag,
  ListedWhisky,
  ListWhiskyInput,
} from "./types";
import { FLAVOUR_TAGS, SMOKE_VALUES, SWEETNESS_VALUES } from "./types";

type ShopDeps = {
  store: CatalogueStore;
};

export function createShop(deps: ShopDeps) {
  return {
    listWhisky(input: ListWhiskyInput): void {
      assertCanList(input);
      deps.store.save({
        name: input.name,
        photoUrl: input.photoUrl,
        origin: input.origin,
        houseTasting: input.houseTasting,
        sku: input.sku,
      });
    },

    catalogue(filter: CatalogueFilter = {}): CatalogueWhisky[] {
      return deps.store
        .all()
        .filter((whisky) => matchesCatalogueFilter(whisky, filter))
        .map((whisky) => ({
          name: whisky.name,
          photoUrl: whisky.photoUrl,
          origin: whisky.origin,
          priceEuro: whisky.sku.priceEuro,
        }));
    },
  };
}

export type Shop = ReturnType<typeof createShop>;

function assertCanList(input: ListWhiskyInput): void {
  if (!input.photoUrl) {
    throw new Error("A Whisky needs a bottle photo to be listed");
  }
  if (!input.origin) {
    throw new Error("A Whisky needs an Origin to be listed");
  }
  if (!input.houseTasting) {
    throw new Error("A Whisky needs a House tasting to be listed");
  }
  if (
    !input.houseTasting.nose ||
    !input.houseTasting.taste ||
    !input.houseTasting.aftertaste
  ) {
    throw new Error("A Whisky needs a House tasting to be listed");
  }
  if (
    !input.houseTasting.flavourTags ||
    input.houseTasting.flavourTags.length === 0
  ) {
    throw new Error("A Whisky needs Flavour tags on the House tasting");
  }
  for (const tag of input.houseTasting.flavourTags) {
    if (!(FLAVOUR_TAGS as readonly string[]).includes(tag)) {
      throw new Error("A Whisky needs Flavour tags from the closed list");
    }
  }
  if (
    !(SWEETNESS_VALUES as readonly string[]).includes(
      input.houseTasting.sweetness,
    )
  ) {
    throw new Error("A Whisky needs Sweetness on the House tasting");
  }
  if (!(SMOKE_VALUES as readonly string[]).includes(input.houseTasting.smoke)) {
    throw new Error("A Whisky needs Smoke on the House tasting");
  }
  if (!input.sku) {
    throw new Error("A Whisky needs at least one SKU to be listed");
  }
  if (!input.sku.size) {
    throw new Error("A Whisky needs at least one SKU to be listed");
  }
  if (!(input.sku.priceEuro > 0)) {
    throw new Error("A Whisky needs at least one SKU to be listed");
  }
  if (!(input.sku.quantity >= 0)) {
    throw new Error("A Whisky needs at least one SKU to be listed");
  }
}

function matchesCatalogueFilter(
  whisky: ListedWhisky,
  filter: CatalogueFilter,
): boolean {
  if (filter.origin && whisky.origin !== filter.origin) {
    return false;
  }

  const flavourTags = filter.flavourTags;
  if (flavourTags && flavourTags.length > 0) {
    return flavourTags.some((tag: FlavourTag) =>
      whisky.houseTasting.flavourTags.includes(tag),
    );
  }

  return true;
}
