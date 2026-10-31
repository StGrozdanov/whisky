"use client";

import Link from "next/link";
import { type FinderAnswers, finderOption } from "@/finder/answers";
import type { FinderHistoryEntry } from "@/finder/history";
import { whiskyHref } from "@/utils/whisky-href";

const TIME_FORMAT = new Intl.DateTimeFormat("bg-BG", {
  hour: "2-digit",
  minute: "2-digit",
});

function answersSummary(answers: FinderAnswers): string {
  const labels = (["smoke", "intensity", "sweetness", "fruit"] as const).map(
    (key) => {
      const option = finderOption(key, answers[key]);
      return option ? option.label : answers[key];
    },
  );
  const tier = answers.priceTier
    ? finderOption("priceTier", answers.priceTier)
    : undefined;
  return [...labels, tier ? tier.label : "всеки ценови клас"].join(" · ");
}

type FinderHistoryProps = {
  history: FinderHistoryEntry[];
  onClear: () => void;
};

export function FinderHistory({ history, onClear }: FinderHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="finder-history-heading"
      className="mt-space-xl rounded-2xl border border-outline-variant/30 bg-surface-container-low p-space-lg"
    >
      <div className="mb-space-md flex flex-wrap items-baseline justify-between gap-space-sm">
        <div>
          <h2
            className="font-headline text-headline-sm text-on-surface"
            id="finder-history-heading"
          >
            История от тази сесия
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Пази се само в този браузър, докато затворите прозореца.
          </p>
        </div>
        <button
          className="cursor-pointer text-label-md font-bold text-secondary uppercase tracking-wider hover:text-primary"
          onClick={onClear}
          type="button"
        >
          Изчисти историята
        </button>
      </div>
      <ol className="space-y-space-md">
        {history.map((entry) => (
          <li
            className="border-t border-outline-variant/20 pt-space-sm"
            key={entry.ranAt}
          >
            <p className="text-technical-data text-outline">
              <time dateTime={entry.ranAt}>
                {TIME_FORMAT.format(new Date(entry.ranAt))}
              </time>{" "}
              · {answersSummary(entry.answers)}
            </p>
            {entry.whiskies.length > 0 ? (
              <ul className="mt-1 flex flex-wrap gap-x-space-md gap-y-1">
                {entry.whiskies.map((whisky) => (
                  <li key={whisky.id}>
                    <Link
                      className="text-body-md text-on-surface underline-offset-4 hover:text-primary hover:underline"
                      href={whiskyHref(whisky.id)}
                    >
                      {whisky.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-body-md text-on-surface-variant">
                Без подходящо уиски
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
