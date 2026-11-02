"use client";

import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { FormStatus } from "@/components/form-status";
import { SubmitButton } from "@/components/submit-button";
import type { EnquiryFormState } from "@/utils/enquiry-forms";
import { requestPasswordReset } from "../actions";

const INITIAL_STATE: EnquiryFormState<"email"> = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    INITIAL_STATE,
  );

  if (state.status === "sent") {
    return <FormStatus message={state.message} tone="success" />;
  }

  const values =
    state.status === "invalid" || state.status === "failed"
      ? state.values
      : undefined;
  const errors = state.status === "invalid" ? state.errors : {};

  return (
    <form
      action={formAction}
      aria-label="Забравена парола"
      className="flex flex-col gap-space-md"
      noValidate
    >
      {state.status === "failed" ? (
        <FormStatus message={state.message} tone="error" />
      ) : null}
      <FormField
        autoComplete="email"
        defaultValue={values?.email}
        error={errors.email}
        id="forgot-password-email"
        label="Имейл"
        maxLength={254}
        name="email"
        required
        type="email"
      />
      <SubmitButton
        label="Изпрати линк"
        pending={pending}
        pendingLabel="Изпращане…"
      />
    </form>
  );
}
