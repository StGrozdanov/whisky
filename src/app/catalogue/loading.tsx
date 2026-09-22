import { CatalogueResultsSkeleton } from "./_components/catalogue-results-skeleton";

export default function CatalogueLoading() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-gutter-mobile py-space-xl md:px-gutter">
        <div className="mb-space-md flex items-center justify-between gap-space-md">
          <div className="h-4 w-32 animate-pulse rounded bg-surface-container" />
          <div className="h-4 w-40 animate-pulse rounded bg-surface-container" />
        </div>
        <div className="mb-space-lg h-36 animate-pulse rounded-xl bg-surface-container-low" />
        <CatalogueResultsSkeleton />
      </div>
    </div>
  );
}
