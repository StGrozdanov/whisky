"use client";

import { useActionState } from "react";
import { FormStatus } from "@/components/form-status";
import { SubmitButton } from "@/components/submit-button";
import type { EnquiryFormState } from "@/utils/enquiry-forms";
import { verifyEmail } from "../actions";

const INITIAL_STATE: EnquiryFormState<"token"> = { status: "idle" };

/**
 * Verifying takes a click, not just opening the link: mail scanners that
 * prefetch links would otherwise use up the one-time token.
 */
export function VerifyEmailForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    verifyEmail,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-space-md">
      {state.status === "failed" ? (
        <FormStatus message={state.message} tone="error" />
      ) : null}
      <input name="token" type="hidden" value={token} />
      <SubmitButton
        label="Потвърди имейла"
        pending={pending}
        pendingLabel="Потвърждаване…"
      />
    </form>
  );
}
