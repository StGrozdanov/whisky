"use client";

import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { FormStatus } from "@/components/form-status";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/use-form-feedback";
import type { SignInField } from "@/utils/account-forms";
import { parseSignInForm } from "@/utils/account-forms";
import type { EnquiryFormState } from "@/utils/enquiry-forms";

const INITIAL_STATE: EnquiryFormState<SignInField> = { status: "idle" };

type SignInFormProps = {
  /** Customer or Shopkeeper sign-in: each has its own door. */
  action: (
    previous: EnquiryFormState<SignInField>,
    formData: FormData,
  ) => Promise<EnquiryFormState<SignInField>>;
  label: string;
};

export function SignInForm({ action, label }: SignInFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const { errors, failure, formProps } = useFormFeedback(
    state,
    parseSignInForm,
  );

  const values =
    state.status === "invalid" || state.status === "failed"
      ? state.values
      : undefined;

  return (
    <form
      {...formProps}
      action={formAction}
      aria-label={label}
      className="flex flex-col gap-space-md"
      noValidate
    >
      {failure ? <FormStatus message={failure} tone="error" /> : null}
      <FormField
        autoComplete="email"
        defaultValue={values?.email}
        error={errors.email}
        id="sign-in-email"
        label="Имейл"
        maxLength={254}
        name="email"
        required
        type="email"
      />
      <FormField
        autoComplete="current-password"
        error={errors.password}
        id="sign-in-password"
        label="Парола"
        name="password"
        required
        type="password"
      />
      <SubmitButton label="Вход" pending={pending} pendingLabel="Влизане…" />
    </form>
  );
}
