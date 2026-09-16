"use client";

type HomeErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function HomeError({ reset }: HomeErrorProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-[1440px] flex-col items-center justify-center gap-space-md px-gutter-mobile py-space-xl text-center md:px-gutter">
      <h1 className="font-headline text-headline-md text-on-surface">
        Нещо се обърка
      </h1>
      <p className="max-w-md text-body-md text-on-surface-variant">
        Не успяхме да заредим началната страница. Моля, опитайте отново.
      </p>
      <button
        className="cursor-pointer rounded-lg bg-primary px-space-xl py-3.5 text-label-md font-bold text-on-primary uppercase tracking-wider shadow-sm transition-colors hover:bg-primary-fixed"
        onClick={reset}
        type="button"
      >
        Опитай отново
      </button>
    </div>
  );
}
