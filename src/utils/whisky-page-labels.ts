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

export function formatColourFiltration(
  naturalColour: boolean | undefined,
  nonChillFiltered: boolean | undefined,
): string | undefined {
  const parts: string[] = [];
  if (naturalColour) {
    parts.push("Natural");
  }
  if (nonChillFiltered) {
    parts.push("Non-Chill");
  }
  if (parts.length === 0) {
    return undefined;
  }
  return parts.join(" / ");
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
