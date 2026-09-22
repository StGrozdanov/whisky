export default function CatalogueLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="relative w-full overflow-hidden"
      role="status"
    >
      <span className="sr-only">Зареждане на каталога с уискита...</span>
      <div className="mx-auto max-w-[1440px] px-gutter-mobile py-space-xl md:px-gutter">
        <div className="mb-space-lg h-10 w-48 animate-pulse rounded bg-surface-container" />
        <div className="mb-space-lg grid grid-cols-1 gap-space-sm sm:grid-cols-2 lg:grid-cols-5">
          <div className="h-14 animate-pulse rounded-lg bg-surface-container-low" />
          <div className="h-14 animate-pulse rounded-lg bg-surface-container-low" />
          <div className="h-14 animate-pulse rounded-lg bg-surface-container-low" />
          <div className="hidden h-14 animate-pulse rounded-lg bg-surface-container-low sm:block" />
          <div className="hidden h-14 animate-pulse rounded-lg bg-surface-container-low lg:block" />
        </div>
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-[420px] animate-pulse rounded-xl bg-surface-container-low" />
          <div className="hidden h-[420px] animate-pulse rounded-xl bg-surface-container-low sm:block" />
          <div className="hidden h-[420px] animate-pulse rounded-xl bg-surface-container-low lg:block" />
          <div className="hidden h-[420px] animate-pulse rounded-xl bg-surface-container-low lg:block" />
        </div>
      </div>
    </div>
  );
}
