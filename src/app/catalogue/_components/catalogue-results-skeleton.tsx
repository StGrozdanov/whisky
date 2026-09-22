export function CatalogueResultsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="mt-space-lg"
      role="status"
    >
      <span className="sr-only">Зареждане на каталога с уискита...</span>
      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-[420px] animate-pulse rounded-xl bg-surface-container-low" />
        <div className="hidden h-[420px] animate-pulse rounded-xl bg-surface-container-low sm:block" />
        <div className="hidden h-[420px] animate-pulse rounded-xl bg-surface-container-low lg:block" />
        <div className="hidden h-[420px] animate-pulse rounded-xl bg-surface-container-low lg:block" />
      </div>
    </div>
  );
}
