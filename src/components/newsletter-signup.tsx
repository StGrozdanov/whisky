"use client";

import Link from "next/link";
import { useActionState } from "react";
import { subscribeToNewsletter } from "@/app/newsletter/actions";
import { FormStatus } from "@/components/form-status";
import { Icon } from "@/components/icon";
import type { EnquiryFormState } from "@/utils/enquiry-forms";

const INITIAL_STATE: EnquiryFormState<"email"> = { status: "idle" };

export function NewsletterSignup() {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
    INITIAL_STATE,
  );

  if (state.status === "sent") {
    return <FormStatus message={state.message} tone="success" />;
  }

  const emailError =
    state.status === "invalid" ? state.errors.email : undefined;
  const defaultEmail =
    state.status === "invalid" || state.status === "failed"
      ? state.values.email
      : undefined;

  return (
    <form
      action={formAction}
      aria-label="Абонамент за бюлетина"
      className="flex flex-col gap-space-xs"
      noValidate
    >
      <label className="sr-only" htmlFor="newsletter-email">
        Имейл за бюлетина
      </label>
      <input
        aria-describedby={emailError ? "newsletter-email-error" : undefined}
        aria-invalid={emailError ? true : undefined}
        autoComplete="email"
        className={`rounded-lg border bg-surface-container-low px-space-sm py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary focus:outline-none ${emailError ? "border-error" : "border-outline-variant/30"}`}
        defaultValue={defaultEmail}
        id="newsletter-email"
        maxLength={254}
        name="email"
        placeholder="Въведете вашия имейл..."
        required
        type="email"
      />
      {emailError ? (
        <p className="text-body-sm text-error" id="newsletter-email-error">
          {emailError}
        </p>
      ) : null}
      {state.status === "failed" ? (
        <FormStatus message={state.message} tone="error" />
      ) : null}
      <button
        className="mt-2 flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-primary px-space-md py-2.5 text-label-md font-bold tracking-wider text-on-primary uppercase shadow-sm transition-all hover:bg-primary-fixed disabled:cursor-wait disabled:opacity-70"
        disabled={pending}
        type="submit"
      >
        {pending ? "Абониране…" : "Абонирай се"}
        <Icon fontSize={16} name="send" />
      </button>
      <p className="text-body-sm text-on-surface-variant/80">
        С абонирането се съгласявате да получавате нашия бюлетин. Можете да се
        отпишете от всяко писмо. Вижте{" "}
        <Link
          className="text-secondary underline hover:text-primary"
          href="/privacy"
        >
          Политиката за поверителност
        </Link>
        .
      </p>
    </form>
  );
}
