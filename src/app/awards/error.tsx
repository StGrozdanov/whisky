"use client";

import { RetryableError } from "@/components/retryable-error";

type AwardsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AwardsError({ reset }: AwardsErrorProps) {
  return (
    <RetryableError
      message="Не успяхме да заредим наградените уискита. Моля, опитайте отново."
      reset={reset}
    />
  );
}
