"use client";

import Link from "next/link";
import { type RefObject, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import {
  FINDER_STEPS,
  type FinderAnswers,
  type FinderStepKey,
  PRICE_TIER_LABELS,
  parseFinderAnswers,
} from "@/finder/answers";
import type { FinderTierGroup } from "@/finder/finder";
import {
  clearFinderHistory,
  type FinderHistoryEntry,
  readFinderHistory,
  recordFinderRun,
} from "@/finder/history";
import { type FinderRunResult, runFinder } from "../actions";
import { FinderHistory } from "./finder-history";
import { FinderResultCard } from "./finder-result-card";

type Draft = Record<FinderStepKey, string>;

const EMPTY_DRAFT: Draft = {
  smoke: "",
  intensity: "",
  sweetness: "",
  fruit: "",
  priceTier: "",
};

type Phase =
  | { kind: "questions" }
  | { kind: "running" }
  | { kind: "results"; groups: FinderTierGroup[] }
  | { kind: "failed" };

const PRIMARY_BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-space-xl py-3 text-label-md font-bold text-on-primary uppercase tracking-wider shadow-sm transition-colors hover:bg-primary-fixed disabled:cursor-not-allowed disabled:opacity-40";
const SECONDARY_BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline-variant px-space-xl py-3 text-label-md font-bold text-on-surface uppercase tracking-wider transition-colors hover:border-secondary hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40";

function sessionStore(): Storage | undefined {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function FinderFlow() {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [phase, setPhase] = useState<Phase>({ kind: "questions" });
  const [lastAnswers, setLastAnswers] = useState<FinderAnswers | undefined>();
  const [history, setHistory] = useState<FinderHistoryEntry[]>([]);
  const outcomeHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const storage = sessionStore();
    if (storage) {
      setHistory(readFinderHistory(storage));
    }
  }, []);

  useEffect(() => {
    if (phase.kind === "results" || phase.kind === "failed") {
      outcomeHeading.current?.focus();
    }
  }, [phase.kind]);

  async function run(answers: FinderAnswers) {
    setLastAnswers(answers);
    setPhase({ kind: "running" });

    let result: FinderRunResult;
    try {
      result = await runFinder(answers);
    } catch {
      result = { status: "failed" };
    }

    if (result.status === "failed") {
      setPhase({ kind: "failed" });
      return;
    }

    setPhase({ kind: "results", groups: result.groups });
    const storage = sessionStore();
    if (storage) {
      setHistory(
        recordFinderRun(storage, {
          ranAt: new Date().toISOString(),
          answers,
          whiskies: result.groups.flatMap((group) =>
            group.whiskies.map((item) => ({
              id: item.whisky.id,
              name: item.whisky.name,
            })),
          ),
        }),
      );
    }
  }

  function startOver() {
    setDraft(EMPTY_DRAFT);
    setStepIndex(0);
    setPhase({ kind: "questions" });
  }

  function clearHistory() {
    const storage = sessionStore();
    if (storage) {
      clearFinderHistory(storage);
    }
    setHistory([]);
  }

  const historySection = (
    <FinderHistory history={history} onClear={clearHistory} />
  );

  if (phase.kind === "running") {
    return (
      <div
        className="flex min-h-[40vh] flex-col items-center justify-center gap-space-md rounded-2xl bg-surface-container-low px-space-lg py-space-xl text-center"
        role="status"
      >
        <Icon
          className="animate-spin text-primary"
          fontSize={32}
          name="refresh"
        />
        <p className="font-headline text-headline-sm text-on-surface">
          Проучваме актуални публични източници…
        </p>
        <p className="max-w-lg text-body-md text-on-surface-variant">
          Всяко търсене е ново и може да отнеме до минута.
        </p>
      </div>
    );
  }

  if (phase.kind === "failed") {
    return (
      <>
        <div className="flex flex-col items-center justify-center gap-space-md rounded-2xl bg-surface-container-low px-space-lg py-space-xl text-center">
          <Icon className="text-outline" fontSize={32} name="cloud_off" />
          <h2
            className="font-headline text-headline-md text-on-surface outline-none"
            ref={outcomeHeading}
            tabIndex={-1}
          >
            Finder не успя да завърши проучването
          </h2>
          <p className="max-w-lg text-body-md text-on-surface-variant">
            Възникна временна грешка при актуалното проучване. Не показваме
            резервни или измислени препоръки — моля, опитайте отново.
          </p>
          <div className="flex flex-wrap justify-center gap-space-sm">
            <button
              className={PRIMARY_BUTTON}
              disabled={!lastAnswers}
              onClick={() => {
                if (lastAnswers) {
                  void run(lastAnswers);
                }
              }}
              type="button"
            >
              <Icon fontSize={18} name="refresh" />
              Опитай отново
            </button>
            <button
              className={SECONDARY_BUTTON}
              onClick={startOver}
              type="button"
            >
              Промени отговорите
            </button>
          </div>
        </div>
        {historySection}
      </>
    );
  }

  if (phase.kind === "results") {
    return (
      <>
        <FinderResults
          groups={phase.groups}
          headingRef={outcomeHeading}
          onStartOver={startOver}
        />
        {historySection}
      </>
    );
  }

  const step = FINDER_STEPS[stepIndex];
  const isLast = stepIndex === FINDER_STEPS.length - 1;
  const value = draft[step.key];
  const canContinue = step.optional || value !== "";
  const options = step.optional
    ? [{ value: "", label: "Без значение" }, ...step.options]
    : step.options;

  function next() {
    if (!isLast) {
      setStepIndex(stepIndex + 1);
      return;
    }
    const answers = parseFinderAnswers(draft);
    if (answers) {
      void run(answers);
    }
  }

  return (
    <>
      <form
        className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-space-lg md:p-space-xl"
        onSubmit={(event) => {
          event.preventDefault();
          if (canContinue) {
            next();
          }
        }}
      >
        <p className="mb-space-sm text-label-md text-secondary uppercase tracking-wider">
          Стъпка {stepIndex + 1} от {FINDER_STEPS.length} · {step.title}
        </p>
        <div aria-hidden="true" className="mb-space-lg flex gap-1">
          {FINDER_STEPS.map((item, index) => (
            <span
              className={`h-1 flex-1 rounded-full ${index <= stepIndex ? "bg-primary" : "bg-surface-container-highest"}`}
              key={item.key}
            />
          ))}
        </div>

        <fieldset>
          <legend className="mb-space-md font-headline text-headline-md text-on-surface">
            {step.question}
          </legend>
          <div className="grid grid-cols-1 gap-space-sm md:grid-cols-3">
            {options.map((option) => (
              <label
                className="flex cursor-pointer items-center gap-space-sm rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-space-md py-space-md text-body-md text-on-surface transition-colors hover:border-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary"
                key={option.value === "" ? "any" : option.value}
              >
                <input
                  checked={value === option.value}
                  className="accent-primary"
                  name={step.key}
                  onChange={() =>
                    setDraft({ ...draft, [step.key]: option.value })
                  }
                  type="radio"
                  value={option.value}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-space-lg flex flex-wrap justify-between gap-space-sm">
          <button
            className={SECONDARY_BUTTON}
            disabled={stepIndex === 0}
            onClick={() => setStepIndex(stepIndex - 1)}
            type="button"
          >
            <Icon fontSize={18} name="chevron_left" />
            Назад
          </button>
          <button
            className={PRIMARY_BUTTON}
            disabled={!canContinue}
            type="submit"
          >
            {isLast ? "Покажи препоръки" : "Напред"}
            <Icon fontSize={18} name="arrow_forward" />
          </button>
        </div>
      </form>
      {historySection}
    </>
  );
}

type FinderResultsProps = {
  groups: FinderTierGroup[];
  headingRef: RefObject<HTMLHeadingElement | null>;
  onStartOver: () => void;
};

function FinderResults({
  groups,
  headingRef,
  onStartOver,
}: FinderResultsProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-space-md rounded-2xl bg-surface-container-low px-space-lg py-space-xl text-center">
        <Icon className="text-outline" fontSize={32} name="search" />
        <h2
          className="font-headline text-headline-md text-on-surface outline-none"
          ref={headingRef}
          tabIndex={-1}
        >
          Не открихме подходящо уиски
        </h2>
        <p className="max-w-lg text-body-md text-on-surface-variant">
          Проучването не намери уиски от нашата селекция, което да отговаря на
          избора ви. Не показваме заместващи предложения.
        </p>
        <div className="flex flex-wrap justify-center gap-space-sm">
          <button
            className={PRIMARY_BUTTON}
            onClick={onStartOver}
            type="button"
          >
            Промени отговорите
          </button>
          <Link className={SECONDARY_BUTTON} href="/catalogue">
            Към селекцията
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-space-xl">
      <div className="flex flex-wrap items-end justify-between gap-space-md">
        <div className="space-y-space-xs">
          <h2
            className="font-headline text-headline-md text-on-surface outline-none"
            ref={headingRef}
            tabIndex={-1}
          >
            Препоръки за вас
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Подредени по съвпадение с отговорите ви, до три във всеки ценови
            клас.
          </p>
        </div>
        <button
          className={SECONDARY_BUTTON}
          onClick={onStartOver}
          type="button"
        >
          <Icon fontSize={18} name="restart_alt" />
          Нов избор
        </button>
      </div>

      {groups.map((group) => (
        <section aria-labelledby={`finder-tier-${group.tier}`} key={group.tier}>
          <h3
            className="mb-space-md text-label-lg text-secondary uppercase tracking-wider"
            id={`finder-tier-${group.tier}`}
          >
            {PRICE_TIER_LABELS[group.tier]}
          </h3>
          <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 xl:grid-cols-3">
            {group.whiskies.map((recommendation) => (
              <FinderResultCard
                key={recommendation.whisky.id}
                recommendation={recommendation}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
