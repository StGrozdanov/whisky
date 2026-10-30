"use client";

import { RetryableError } from "@/components/retryable-error";

type CatalogueErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CatalogueError({ reset }: CatalogueErrorProps) {
  return (
    <RetryableError
      message="Не успяхме да заредим актуалните уискита. Моля, опитайте отново."
      reset={reset}
    />
  );
}
