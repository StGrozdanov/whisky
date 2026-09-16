export default function HomeLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="relative w-full overflow-hidden"
      role="status"
    >
      <span className="sr-only">Зареждане</span>
      <div className="mx-auto max-w-[1440px] px-gutter-mobile py-space-xl md:px-gutter">
        <div className="h-[420px] animate-pulse rounded-2xl bg-surface-container-low" />
      </div>

      <div className="mx-auto mb-6 max-w-[1440px] px-gutter-mobile md:px-gutter">
        <div className="h-36 animate-pulse rounded-2xl bg-surface-container-low" />
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-space-xl px-gutter-mobile py-space-xl md:px-gutter">
        <div className="space-y-space-md">
          <div className="h-8 w-48 animate-pulse rounded bg-surface-container" />
          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
            <div className="h-80 animate-pulse rounded-xl bg-surface-container-low" />
            <div className="hidden h-80 animate-pulse rounded-xl bg-surface-container-low sm:block" />
            <div className="hidden h-80 animate-pulse rounded-xl bg-surface-container-low lg:block" />
            <div className="hidden h-80 animate-pulse rounded-xl bg-surface-container-low lg:block" />
          </div>
        </div>
        <div className="space-y-space-md">
          <div className="h-8 w-40 animate-pulse rounded bg-surface-container" />
          <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
            <div className="h-80 animate-pulse rounded-xl bg-surface-container-low" />
            <div className="hidden h-80 animate-pulse rounded-xl bg-surface-container-low sm:block" />
            <div className="hidden h-80 animate-pulse rounded-xl bg-surface-container-low lg:block" />
            <div className="hidden h-80 animate-pulse rounded-xl bg-surface-container-low lg:block" />
          </div>
        </div>
      </div>
    </div>
  );
}
