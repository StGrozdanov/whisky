export default function WhiskyLoading() {
  return (
    <div className="mx-auto max-w-[1440px] animate-pulse px-gutter-mobile py-space-xl md:px-gutter">
      <div className="mb-space-lg h-4 w-64 rounded bg-surface-container-high" />
      <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-2">
        <div className="h-[520px] rounded-xl bg-surface-container-low" />
        <div className="space-y-space-md">
          <div className="h-8 w-3/4 rounded bg-surface-container-high" />
          <div className="h-24 rounded bg-surface-container-low" />
          <div className="h-40 rounded bg-surface-container-low" />
        </div>
      </div>
    </div>
  );
}
