"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { FormStatus } from "@/components/form-status";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/use-form-feedback";
import {
  type EmailVerificationField,
  parseEmailVerificationForm,
} from "@/utils/account-forms";
import type { EnquiryFormState } from "@/utils/enquiry-forms";
import { verifyEmail } from "../actions";

const INITIAL_STATE: EnquiryFormState<EmailVerificationField> = {
  status: "idle",
};

/**
 * Verifying takes a submit, not just opening the link: mail scanners that
 * prefetch links would otherwise use up the one-time token. It also asks for
 * the Account's password, so only whoever chose it can activate the Account.
 */
export function VerifyEmailForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    verifyEmail,
    INITIAL_STATE,
  );
  const { errors, failure, formProps } = useFormFeedback(
    state,
    parseEmailVerificationForm,
  );

  const values =
    state.status === "invalid" || state.status === "failed"
      ? state.values
      : undefined;

  return (
    <form
      {...formProps}
      action={formAction}
      aria-label="Потвърждение на имейл"
      className="flex flex-col gap-space-md"
      noValidate
    >
      {failure ? <FormStatus message={failure} tone="error" /> : null}
      <input name="token" type="hidden" value={token} />
      <FormField
        autoComplete="email"
        defaultValue={values?.email}
        error={errors.email}
        id="verify-email"
        label="Имейл"
        maxLength={254}
        name="email"
        required
        type="email"
      />
      <FormField
        autoComplete="current-password"
        error={errors.password}
        id="verify-password"
        label="Парола"
        name="password"
        required
        type="password"
      />
      <SubmitButton
        label="Потвърди имейла"
        pending={pending}
        pendingLabel="Потвърждаване…"
      />
      <Link
        className="text-body-sm text-secondary underline hover:text-primary"
        href="/account/forgot-password"
      >
        Забравена парола
      </Link>
    </form>
  );
}
