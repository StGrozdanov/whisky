const PLACEHOLDER_PHOTOS = [
  "/bottles/glenallachie-12.svg",
  "/bottles/redbreast-12.svg",
  "/bottles/buffalo-trace.svg",
  "/bottles/yamazaki-reserve.svg",
  "/bottles/laphroaig-10.svg",
] as const;

function photoAt(index: number): string {
  return PLACEHOLDER_PHOTOS[index % PLACEHOLDER_PHOTOS.length];
}

export type OfferRailCard = {
  name: string;
  meta: string;
  photoUrl: string;
  discountPercent: number;
  priceEur: number;
  wasPriceEur: number;
  savingsEur: number;
};

export type NewArrivalRailCard = {
  name: string;
  meta: string;
  photoUrl: string;
  badge: string;
  badgeClassName: string;
  priceEur: number;
  note: string;
  noteClassName: string;
};

export type DiscoveryLineupItem = {
  name: string;
  detail: string;
};

export type DiscoveryRailCard = {
  title: string;
  priceEur: number;
  priceClassName: string;
  photoUrl: string;
  lineup: DiscoveryLineupItem[];
};

export const SPECIAL_OFFERS: OfferRailCard[] = [
  {
    name: "Arran 10 Year Old",
    meta: "Isle of Arran • 46.0%",
    photoUrl: photoAt(0),
    discountPercent: 15,
    priceEur: 44,
    wasPriceEur: 52,
    savingsEur: 8,
  },
  {
    name: "Kilkerran 12 Campbeltown",
    meta: "Campbeltown Single Malt • 46.0%",
    photoUrl: photoAt(1),
    discountPercent: 20,
    priceEur: 59,
    wasPriceEur: 74,
    savingsEur: 15,
  },
  {
    name: "Bunnahabhain 12 C.S.",
    meta: "Islay • 55.1% ABV",
    photoUrl: photoAt(2),
    discountPercent: 12,
    priceEur: 78,
    wasPriceEur: 89,
    savingsEur: 11,
  },
  {
    name: "Glendronach 15 Revival",
    meta: "Highland Single Malt • 46.0%",
    photoUrl: photoAt(3),
    discountPercent: 25,
    priceEur: 86,
    wasPriceEur: 115,
    savingsEur: 29,
  },
];

export const NEW_ARRIVALS: NewArrivalRailCard[] = [
  {
    name: "Springbank 10 Y.O. (2025)",
    meta: "Campbeltown • 46.0%",
    photoUrl: photoAt(4),
    badge: "Ново",
    badgeClassName: "bg-secondary text-on-secondary",
    priceEur: 68,
    note: "Лимитиран тираж",
    noteClassName: "text-secondary",
  },
  {
    name: "Loch Lomond 14 Organic",
    meta: "Highland Single Malt • 46.0%",
    photoUrl: photoAt(0),
    badge: "Ново",
    badgeClassName: "bg-secondary text-on-secondary",
    priceEur: 54.5,
    note: "Био сертифициран",
    noteClassName: "text-outline",
  },
  {
    name: "Benromach Peat Smoke",
    meta: "Speyside • 46.0%",
    photoUrl: photoAt(1),
    badge: "Ексклузивно",
    badgeClassName: "bg-primary-container text-on-primary-container",
    priceEur: 62,
    note: "Първо зареждане",
    noteClassName: "text-secondary",
  },
  {
    name: "Port Charlotte 10 Peated",
    meta: "Islay Single Malt • 50.0%",
    photoUrl: photoAt(2),
    badge: "Ново",
    badgeClassName: "bg-secondary text-on-secondary",
    priceEur: 59,
    note: "40 ppm интензитет",
    noteClassName: "text-outline",
  },
];

export const DISCOVERY_SETS: DiscoveryRailCard[] = [
  {
    title: "Шери срещу Торф (3 x 50ml)",
    priceEur: 21.5,
    priceClassName: "text-primary",
    photoUrl: photoAt(0),
    lineup: [
      {
        name: "1. GlenAllachie 12 Y.O.",
        detail: "Шери Pedro Ximénez • Speyside",
      },
      {
        name: "2. Kilchoman Machir Bay",
        detail: "Торф от остров Islay • 50 ppm",
      },
      {
        name: "3. Benromach 10 Y.O.",
        detail: "Хармоничен фин пушек & шери баланс",
      },
    ],
  },
  {
    title: "The Japanese Craft Trio (3 x 50ml)",
    priceEur: 29.6,
    priceClassName: "text-secondary",
    photoUrl: photoAt(3),
    lineup: [
      {
        name: "1. Mars Shinshu Iwai Tradition",
        detail: "Японски алпийски малц • Японски кедър",
      },
      {
        name: "2. Ichiro's Malt & Grain",
        detail: "Легендарната дестилерия Chichibu",
      },
      {
        name: "3. Nikka Yoichi Single Malt",
        detail: "Традиционен въглищен дестилат от Хокайдо",
      },
    ],
  },
];
