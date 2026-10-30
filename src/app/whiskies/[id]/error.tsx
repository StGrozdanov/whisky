"use client";

import { RetryableError } from "@/components/retryable-error";

type WhiskyErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function WhiskyError({ reset }: WhiskyErrorProps) {
  return (
    <RetryableError
      message="Не успяхме да заредим страницата на уискито. Моля, опитайте отново."
      reset={reset}
    />
  );
}
