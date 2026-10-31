import { PRICE_TIERS, type PriceTier } from "@/shop/types";

const SMOKE_CHOICES = ["none", "medium", "strong"] as const;
const INTENSITY_CHOICES = ["soft", "balanced", "bold"] as const;
const SWEETNESS_CHOICES = ["sweet", "balanced", "dry-spicy"] as const;
const FRUIT_CHOICES = ["dark", "light", "balanced"] as const;

type Smoke = (typeof SMOKE_CHOICES)[number];
type Intensity = (typeof INTENSITY_CHOICES)[number];
type Sweetness = (typeof SWEETNESS_CHOICES)[number];
type FruitProfile = (typeof FRUIT_CHOICES)[number];

/** The Customer's current answers for one Finder run. */
export type FinderAnswers = {
  smoke: Smoke;
  intensity: Intensity;
  sweetness: Sweetness;
  fruit: FruitProfile;
  priceTier: PriceTier | undefined;
};

export type FinderStepKey = keyof FinderAnswers;

type FinderOption = {
  value: string;
  /** Bulgarian label shown to the Customer. */
  label: string;
  /** Plain meaning handed to the AI research prompt. */
  meaning: string;
};

type FinderStep = {
  key: FinderStepKey;
  title: string;
  question: string;
  optional: boolean;
  options: FinderOption[];
};

export const PRICE_TIER_LABELS: Record<PriceTier, string> = {
  ENTRY: "ENTRY · до 50 €",
  CORE: "CORE · над 50 € до 90 €",
  SIGNATURE: "SIGNATURE · над 90 € до 140 €",
  PREMIUM: "PREMIUM · над 140 €",
};

export const FINDER_STEPS: FinderStep[] = [
  {
    key: "smoke",
    title: "Опушеност",
    question: "Колко опушено да бъде уискито?",
    optional: false,
    options: [
      { value: "none", label: "без", meaning: "no smoke or peat" },
      { value: "medium", label: "средно", meaning: "light to medium smoke" },
      { value: "strong", label: "силно", meaning: "heavy smoke and peat" },
    ],
  },
  {
    key: "intensity",
    title: "Интензивност",
    question: "Колко интензивен вкус предпочитате?",
    optional: false,
    options: [
      { value: "soft", label: "меко", meaning: "soft, gentle, easy-drinking" },
      {
        value: "balanced",
        label: "балансирано",
        meaning: "balanced, medium-bodied",
      },
      {
        value: "bold",
        label: "смело и плътно",
        meaning: "bold, full-bodied and rich",
      },
    ],
  },
  {
    key: "sweetness",
    title: "Сладост",
    question: "Сладко или по-сухо?",
    optional: false,
    options: [
      { value: "sweet", label: "сладко", meaning: "sweet" },
      {
        value: "balanced",
        label: "балансирано",
        meaning: "balanced between sweet and dry",
      },
      {
        value: "dry-spicy",
        label: "сухо и пикантно",
        meaning: "dry and spicy",
      },
    ],
  },
  {
    key: "fruit",
    title: "Плодов профил",
    question: "Какви плодови нотки търсите?",
    optional: false,
    options: [
      {
        value: "dark",
        label: "тъмни плодове (стафиди, смокини, синя слива)",
        meaning: "dark fruit: raisins, figs, plum",
      },
      {
        value: "light",
        label: "светли плодове (зелена ябълка, круша, цитрус)",
        meaning: "light fruit: green apple, pear, citrus",
      },
      {
        value: "balanced",
        label: "баланс между двете",
        meaning: "a balance of dark and light fruit",
      },
    ],
  },
  {
    key: "priceTier",
    title: "Ценови клас",
    question: "В какъв ценови клас търсите? (по желание)",
    optional: true,
    options: PRICE_TIERS.map((tier) => ({
      value: tier,
      label: PRICE_TIER_LABELS[tier],
      meaning: tier,
    })),
  },
];

function oneOf<T extends string>(
  choices: readonly T[],
  value: unknown,
): T | undefined {
  return typeof value === "string" &&
    (choices as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

/**
 * Validates untrusted Finder input (it arrives through a server action) and
 * keeps only the five known answers.
 */
export function parseFinderAnswers(input: unknown): FinderAnswers | undefined {
  if (typeof input !== "object" || input === null) {
    return undefined;
  }
  const record = input as Record<string, unknown>;
  const smoke = oneOf(SMOKE_CHOICES, record.smoke);
  const intensity = oneOf(INTENSITY_CHOICES, record.intensity);
  const sweetness = oneOf(SWEETNESS_CHOICES, record.sweetness);
  const fruit = oneOf(FRUIT_CHOICES, record.fruit);
  if (!smoke || !intensity || !sweetness || !fruit) {
    return undefined;
  }

  const rawTier = record.priceTier;
  const anyTier = rawTier === undefined || rawTier === null || rawTier === "";
  const priceTier = oneOf(PRICE_TIERS, rawTier);
  if (!anyTier && !priceTier) {
    return undefined;
  }

  return { smoke, intensity, sweetness, fruit, priceTier };
}

/** The option for an answer on a step, used for prompts and summaries. */
export function finderOption(
  key: FinderStepKey,
  value: string,
): FinderOption | undefined {
  const step = FINDER_STEPS.find((item) => item.key === key);
  return step?.options.find((option) => option.value === value);
}
