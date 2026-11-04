import type { ReactNode } from "react";

/** The panel that holds a single Account or back-office form. */
export function FormCard({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-xl space-y-space-md rounded-2xl bg-surface-container-low p-space-lg shadow-xl">
      {children}
    </div>
  );
}
