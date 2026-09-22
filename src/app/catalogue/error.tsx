"use client";

import { Icon } from "@/components/icon";

type CatalogueErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CatalogueError({ reset }: CatalogueErrorProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-[1440px] flex-col items-center justify-center gap-space-md px-gutter-mobile py-space-xl text-center md:px-gutter">
      <Icon className="text-outline" fontSize={32} name="cloud_off" />
      <h1 className="font-headline text-headline-md text-on-surface">
        Възникна временна грешка при зареждане
      </h1>
      <p className="max-w-md text-body-md text-on-surface-variant">
        Не успяхме да заредим актуалните уискита. Моля, опитайте отново.
      </p>
      <button
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-space-xl py-3.5 text-label-md font-bold text-on-primary uppercase tracking-wider shadow-sm transition-colors hover:bg-primary-fixed"
        onClick={reset}
        type="button"
      >
        <Icon fontSize={18} name="refresh" />
        Опитай отново
      </button>
    </div>
  );
}
