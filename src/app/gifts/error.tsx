"use client";

import { RetryableError } from "@/components/retryable-error";

type GiftsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GiftsError({ reset }: GiftsErrorProps) {
  return (
    <RetryableError
      message="Не успяхме да заредим подаръците. Моля, опитайте отново."
      reset={reset}
    />
  );
}
