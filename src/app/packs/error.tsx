"use client";

import { RetryableError } from "@/components/retryable-error";

type PacksErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PacksError({ reset }: PacksErrorProps) {
  return (
    <RetryableError
      message="Не успяхме да заредим Discovery сетовете. Моля, опитайте отново."
      reset={reset}
    />
  );
}
