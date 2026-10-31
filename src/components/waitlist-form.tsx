"use client";

import { useActionState } from "react";
import { joinWaitlist } from "@/app/waitlist/actions";
import { FormField } from "@/components/form-field";
import { FormStatus } from "@/components/form-status";
import { Icon } from "@/components/icon";
import type { WaitlistTarget } from "@/shop/types";
import {
  type EnquiryFormState,
  type WaitlistField,
  waitlistTargetValue,
} from "@/utils/enquiry-forms";

const INITIAL_STATE: EnquiryFormState<WaitlistField> = { status: "idle" };

type WaitlistFormProps = {
  id: string;
  target: WaitlistTarget;
  /** What the Customer waits for, e.g. "размерът 700 мл" or "сетът". */
  subject: string;
};

/** Ask us: a Waitlist signup, never a reservation or Contact request. */
export function WaitlistForm({ id, target, subject }: WaitlistFormProps) {
  const [state, formAction, pending] = useActionState(
    joinWaitlist,
    INITIAL_STATE,
  );

  if (state.status === "sent") {
    return (
      <div id={id}>
        <FormStatus message={state.message} tone="success" />
      </div>
    );
  }

  const values =
    state.status === "invalid" || state.status === "failed"
      ? state.values
      : undefined;
  const errors = state.status === "invalid" ? state.errors : {};

  return (
    <form
      action={formAction}
      aria-label="Списък за изчакване"
      className="flex flex-col gap-space-sm rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-space-md"
      id={id}
      noValidate
    >
      <p className="text-body-sm text-on-surface-variant">
        Ще ви изпратим един имейл, когато {subject} е отново в наличност.
        Записването не е резервация или поръчка и не изисква плащане.
      </p>
      {state.status === "failed" ? (
        <FormStatus message={state.message} tone="error" />
      ) : null}
      {errors.target ? (
        <FormStatus message={errors.target} tone="error" />
      ) : null}
      <input name="target" type="hidden" value={waitlistTargetValue(target)} />
      <FormField
        autoComplete="email"
        defaultValue={values?.email}
        error={errors.email}
        id={`${id}-email`}
        label="Имейл"
        maxLength={254}
        name="email"
        required
        type="email"
      />
      <FormField
        autoComplete="tel"
        defaultValue={values?.phone}
        error={errors.phone}
        id={`${id}-phone`}
        label="Телефон"
        maxLength={30}
        name="phone"
        type="tel"
      />
      <button
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-space-md py-2.5 text-label-md font-bold tracking-wider text-on-primary uppercase transition-colors hover:bg-primary-fixed disabled:cursor-wait disabled:opacity-70"
        disabled={pending}
        type="submit"
      >
        <Icon fontSize={18} name="mail" />
        {pending ? "Записване…" : "Уведоми ме"}
      </button>
    </form>
  );
}
