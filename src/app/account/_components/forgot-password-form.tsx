"use client";

import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { FormStatus } from "@/components/form-status";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/use-form-feedback";
import { parseRecoveryRequestForm } from "@/utils/account-forms";
import type { EnquiryFormState } from "@/utils/enquiry-forms";
import { requestPasswordReset } from "../actions";

const INITIAL_STATE: EnquiryFormState<"email"> = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    INITIAL_STATE,
  );
  const { errors, failure, formProps } = useFormFeedback(
    state,
    parseRecoveryRequestForm,
  );

  if (state.status === "sent") {
    return <FormStatus message={state.message} tone="success" />;
  }

  const values =
    state.status === "invalid" || state.status === "failed"
      ? state.values
      : undefined;

  return (
    <form
      {...formProps}
      action={formAction}
      aria-label="Забравена парола"
      className="flex flex-col gap-space-md"
      noValidate
    >
      {failure ? <FormStatus message={failure} tone="error" /> : null}
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
