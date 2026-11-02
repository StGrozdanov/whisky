"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { FormStatus } from "@/components/form-status";
import { SubmitButton } from "@/components/submit-button";
import type { RegistrationField } from "@/utils/account-forms";
import type { EnquiryFormState } from "@/utils/enquiry-forms";
import { registerAccount } from "../actions";

const INITIAL_STATE: EnquiryFormState<RegistrationField> = { status: "idle" };

export function RegistrationForm() {
  const [state, formAction, pending] = useActionState(
    registerAccount,
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
      aria-label="Регистрация"
      className="flex flex-col gap-space-md"
      noValidate
    >
      {state.status === "invalid" ? (
        <FormStatus
          message="Моля, поправете отбелязаните полета."
          tone="error"
        />
      ) : null}
      {state.status === "failed" ? (
        <FormStatus message={state.message} tone="error" />
      ) : null}
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
      <p className="text-body-sm text-on-surface-variant">
        Паролата трябва да е поне 8 знака. Ще ви изпратим линк за потвърждение
        на имейла. Как пазим данните ви вижте в{" "}
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
