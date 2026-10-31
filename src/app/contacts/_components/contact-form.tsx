"use client";

import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { FormStatus } from "@/components/form-status";
import { Icon } from "@/components/icon";
import type { ContactField, EnquiryFormState } from "@/utils/enquiry-forms";
import { submitContactRequest } from "../actions";

const INITIAL_STATE: EnquiryFormState<ContactField> = { status: "idle" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactRequest,
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
      aria-label="Форма за контакти"
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
          autoComplete="name"
          defaultValue={values?.name}
          error={errors.name}
          id="contact-name"
          label="Име"
          maxLength={120}
          name="name"
          required
        />
        <FormField
          autoComplete="email"
          defaultValue={values?.email}
          error={errors.email}
          id="contact-email"
          label="Имейл"
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </div>
      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <FormField
          autoComplete="tel"
          defaultValue={values?.phone}
          error={errors.phone}
          id="contact-phone"
          label="Телефон"
          maxLength={30}
          name="phone"
          type="tel"
        />
        <FormField
          defaultValue={values?.subject}
          error={errors.subject}
          id="contact-subject"
          label="Тема"
          maxLength={150}
          name="subject"
          required
        />
      </div>
      <FormField
        defaultValue={values?.message}
        error={errors.message}
        id="contact-message"
        label="Съобщение"
        maxLength={5000}
        multiline
        name="message"
        required
      />

      <p className="text-body-sm text-on-surface-variant">
        Полетата със <span className="text-primary">*</span> са задължителни.
        Използваме данните само за да отговорим на съобщението ви.
      </p>

      <button
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-space-xl py-3 text-label-md font-bold tracking-wider text-on-primary uppercase shadow-sm transition-colors hover:bg-primary-fixed disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:self-start"
        disabled={pending}
        type="submit"
      >
        {pending ? "Изпращане…" : "Изпрати съобщението"}
        <Icon fontSize={16} name="send" />
      </button>
    </form>
  );
}
