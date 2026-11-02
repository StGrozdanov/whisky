"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { FormStatus } from "@/components/form-status";
import { SubmitButton } from "@/components/submit-button";
import type { PasswordResetField } from "@/utils/account-forms";
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

  const errors = state.status === "invalid" ? state.errors : {};

  return (
    <form
      action={formAction}
      aria-label="Нова парола"
      className="flex flex-col gap-space-md"
      noValidate
    >
      {state.status === "failed" ? (
        <FormStatus message={state.message} tone="error" />
      ) : null}
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
      <SubmitButton
        label="Запази паролата"
        pending={pending}
        pendingLabel="Запазване…"
      />
    </form>
  );
}
