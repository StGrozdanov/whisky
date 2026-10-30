const lastDayFormat = new Intl.DateTimeFormat("bg-BG", {
  timeZone: "Europe/Sofia",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** A Promotion ends exclusively at `endsAt`, so its last day is the one before that instant. */
export function promotionEndLabel(
  endsAt: Date | undefined,
): string | undefined {
  if (!endsAt) {
    return undefined;
  }
  const lastValidMoment = new Date(endsAt.getTime() - 1);
  return `Валидна до ${lastDayFormat.format(lastValidMoment)}`;
}
