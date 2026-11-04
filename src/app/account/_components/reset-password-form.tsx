"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { FormStatus } from "@/components/form-status";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/use-form-feedback";
import type { PasswordResetField } from "@/utils/account-forms";
import { parsePasswordResetForm } from "@/utils/account-forms";
import type { EnquiryFormState } from "@/utils/enquiry-forms";
import { resetPassword } from "../actions";

const INITIAL_STATE: EnquiryFormState<PasswordResetField> = {
  status: "idle",
};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    resetPassword,
    INITIAL_STATE,
  );
  const { errors, failure, formProps } = useFormFeedback(
    state,
    parsePasswordResetForm,
  );

  if (state.status === "sent") {
    return (
      <div className="space-y-space-md">
        <FormStatus message={state.message} tone="success" />
        <Link
          className="text-label-md text-secondary underline hover:text-primary"
          href="/account/sign-in"
        >
          Към входа
        </Link>
      </div>
    );
  }

  return (
    <form
      {...formProps}
      action={formAction}
      aria-label="Нова парола"
      className="flex flex-col gap-space-md"
      noValidate
    >
      {failure ? <FormStatus message={failure} tone="error" /> : null}
      <input name="token" type="hidden" value={token} />
      <FormField
        autoComplete="new-password"
        error={errors.password}
        id="reset-password"
        label="Нова парола"
        name="password"
        required
        type="password"
      />
      <FormField
        autoComplete="new-password"
        error={errors.passwordConfirmation}
        id="reset-password-confirmation"
        label="Повторете новата парола"
        name="passwordConfirmation"
        required
        type="password"
      />
      <SubmitButton
        label="Запази паролата"
        pending={pending}
        pendingLabel="Запазване…"
      />
    </form>
  );
}
