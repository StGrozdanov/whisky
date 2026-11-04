"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { FormStatus } from "@/components/form-status";
import { SubmitButton } from "@/components/submit-button";
import { useFormFeedback } from "@/components/use-form-feedback";
import type { RegistrationField } from "@/utils/account-forms";
import { parseRegistrationForm } from "@/utils/account-forms";
import type { EnquiryFormState } from "@/utils/enquiry-forms";
import { registerAccount } from "../actions";

const INITIAL_STATE: EnquiryFormState<RegistrationField> = { status: "idle" };

export function RegistrationForm() {
  const [state, formAction, pending] = useActionState(
    registerAccount,
    INITIAL_STATE,
  );
  const { errors, hasErrors, failure, formProps } = useFormFeedback(
    state,
    parseRegistrationForm,
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
      aria-label="Регистрация"
      className="flex flex-col gap-space-md"
      noValidate
    >
      {hasErrors ? (
        <FormStatus
          message="Моля, поправете отбелязаните полета."
          tone="error"
        />
      ) : null}
      {failure ? <FormStatus message={failure} tone="error" /> : null}
      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <FormField
          autoComplete="given-name"
          defaultValue={values?.firstName}
          error={errors.firstName}
          id="register-first-name"
          label="Име"
          maxLength={80}
          name="firstName"
          required
        />
        <FormField
          autoComplete="family-name"
          defaultValue={values?.lastName}
          error={errors.lastName}
          id="register-last-name"
          label="Фамилия"
          maxLength={80}
          name="lastName"
          required
        />
      </div>
      <FormField
        autoComplete="email"
        defaultValue={values?.email}
        error={errors.email}
        id="register-email"
        label="Имейл"
        maxLength={254}
        name="email"
        required
        type="email"
      />
      <FormField
        autoComplete="new-password"
        error={errors.password}
        id="register-password"
        label="Парола"
        name="password"
        required
        type="password"
      />
      <FormField
        autoComplete="new-password"
        error={errors.passwordConfirmation}
        id="register-password-confirmation"
        label="Повторете паролата"
        name="passwordConfirmation"
        required
        type="password"
      />
      <p className="text-body-sm text-on-surface-variant">
        Ще ви изпратим линк за потвърждение на имейла. Как пазим данните ви,
        можете да разгледате в{" "}
        <Link
          className="text-secondary underline hover:text-primary"
          href="/privacy"
        >
          Политиката за поверителност
        </Link>
        .
      </p>
      <SubmitButton
        label="Създай акаунт"
        pending={pending}
        pendingLabel="Създаване…"
      />
    </form>
  );
}
