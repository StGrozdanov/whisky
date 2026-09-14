"use client";

import { useEffect, useState } from "react";

const AGE_GATE_KEY = "whiskyfinder.ageConfirmed";

type GateState = "pending" | "blocked" | "denied" | "ok";

export function AgeGate() {
  const [state, setState] = useState<GateState>("pending");

  useEffect(() => {
    const confirmed = window.localStorage.getItem(AGE_GATE_KEY);
    if (confirmed === "true") {
      setState("ok");
    } else {
      setState("blocked");
    }
  }, []);

  function confirmAge() {
    window.localStorage.setItem(AGE_GATE_KEY, "true");
    setState("ok");
  }

  function denyAge() {
    setState("denied");
  }

  if (state === "ok") {
    return null;
  }

  if (state === "pending") {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[100] bg-surface-container-lowest"
      />
    );
  }

  if (state === "denied") {
    return (
      <div
        aria-labelledby="age-gate-title"
        aria-modal="true"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-container-lowest/95 p-space-md backdrop-blur-md"
        role="dialog"
      >
        <div className="w-full max-w-md rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-xl text-center shadow-2xl">
          <h2
            className="mb-space-md font-headline text-headline-md text-on-surface"
            id="age-gate-title"
          >
            Нямате достъп
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Този сайт е достъпен само за лица над 18 години.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      aria-labelledby="age-gate-title"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-container-lowest/95 p-space-md backdrop-blur-md"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-xl text-center shadow-2xl">
        <h2
          className="mb-space-md font-headline text-headline-md text-on-surface"
          id="age-gate-title"
        >
          Потвърдете, че сте навършили 18 години
        </h2>
        <p className="mb-space-xl text-body-md text-on-surface-variant">
          Този сайт предлага алкохолни напитки. Достъпът е само за пълнолетни.
        </p>
        <div className="flex items-center justify-center gap-space-md">
          <button
            className="cursor-pointer rounded-lg bg-primary-container px-space-xl py-3.5 text-label-lg font-bold text-on-primary uppercase shadow-[0_4px_20px_rgba(217,119,6,0.35)] transition-colors hover:bg-primary"
            onClick={confirmAge}
            type="button"
          >
            Да
          </button>
          <button
            className="cursor-pointer rounded-lg border border-outline-variant/60 bg-transparent px-space-xl py-3.5 text-label-lg font-bold text-on-surface uppercase transition-colors hover:bg-surface-container-highest"
            onClick={denyAge}
            type="button"
          >
            Не
          </button>
        </div>
      </div>
    </div>
  );
}
