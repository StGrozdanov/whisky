"use server";

import { parseFinderAnswers } from "@/finder/answers";
import type { FinderTierGroup } from "@/finder/finder";
import { getFinder } from "@/finder/get-finder";

export type FinderRunResult =
  | { status: "results"; groups: FinderTierGroup[] }
  | { status: "failed" };

/**
 * One live Finder run. A server action is a POST, so it is never prefetched
 * or cached. Failures stay honest: the Customer gets a retryable error and
 * never fallback results, and no failure detail leaves the server.
 */
export async function runFinder(input: unknown): Promise<FinderRunResult> {
  const answers = parseFinderAnswers(input);
  if (!answers) {
    return { status: "failed" };
  }

  try {
    const finder = await getFinder();
    const outcome = await finder.run(answers);
    if (outcome.status === "results") {
      return { status: "results", groups: outcome.groups };
    }
    return { status: "failed" };
  } catch (error) {
    console.error("Finder run failed (unexpected)", error);
    return { status: "failed" };
  }
}
