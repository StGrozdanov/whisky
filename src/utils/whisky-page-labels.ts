export function formatWhiskyAgeYears(ageYears: number | undefined): string {
  if (ageYears === undefined) {
    return "NAS";
  }
  return `${ageYears} Години`;
}

export function formatAbvVol(abv: number | undefined): string {
  if (abv === undefined) {
    return "—";
  }
  return `${abv.toFixed(1)}% Vol.`;
}

function colourLabel(naturalColour: boolean): string {
  if (naturalColour) {
    return "Natural";
  }
  return "Coloured";
}

function filtrationLabel(nonChillFiltered: boolean): string {
  if (nonChillFiltered) {
    return "Non-Chill";
  }
  return "Chill filtered";
}

export function formatColourFiltration(
  naturalColour: boolean | undefined,
  nonChillFiltered: boolean | undefined,
): string | undefined {
  const parts: string[] = [];
  if (naturalColour !== undefined) {
    parts.push(colourLabel(naturalColour));
  }
  if (nonChillFiltered !== undefined) {
    parts.push(filtrationLabel(nonChillFiltered));
  }
  if (parts.length === 0) {
    return undefined;
  }
  return parts.join(" / ");
}

export function skuIsInStock(action: "buy" | "ask-us"): boolean {
  return action === "buy";
}

export function skuAvailabilityLabel(action: "buy" | "ask-us"): string {
  if (skuIsInStock(action)) {
    return "В наличност";
  }
  return "Попитай ни";
}

export function formatDisplayedScore(
  score: number | undefined,
): string | undefined {
  if (score === undefined) {
    return undefined;
  }
  return `${score.toFixed(1)}/10`;
}

export function formatVolumeMl(volumeMl: number): string {
  return `${volumeMl} мл`;
}
