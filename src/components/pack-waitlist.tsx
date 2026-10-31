"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { WaitlistForm } from "@/components/waitlist-form";

type PackWaitlistProps = {
  packId: string;
};

/** Ask us on a Pack that is not In stock: opens its Waitlist signup. */
export function PackWaitlist({ packId }: PackWaitlistProps) {
  const [open, setOpen] = useState(false);
  const formId = `pack-waitlist-${packId}`;

  return (
    <div className="flex flex-1 flex-col gap-space-sm">
      <button
        aria-controls={open ? formId : undefined}
        aria-expanded={open}
        className="flex flex-1 cursor-pointer items-center justify-center gap-space-xs rounded-lg border border-outline-variant bg-transparent py-3 text-label-md font-bold text-on-surface uppercase tracking-wider transition-colors hover:border-secondary hover:bg-surface-container-high"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Icon fontSize={18} name="mail" />
        <span>Попитай ни</span>
      </button>
      {open ? (
        <WaitlistForm
          id={formId}
          subject="сетът"
          target={{ kind: "pack", packId }}
        />
      ) : null}
    </div>
  );
}
