"use client";

import { RetryableError } from "@/components/retryable-error";

type PromotionsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PromotionsError({ reset }: PromotionsErrorProps) {
  return (
    <RetryableError
      message="Не успяхме да заредим актуалните промоции. Моля, опитайте отново."
      reset={reset}
    />
  );
}
