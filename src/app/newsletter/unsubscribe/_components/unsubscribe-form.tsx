"use client";

import { useActionState } from "react";
import { FormStatus } from "@/components/form-status";
import type { EnquiryFormState } from "@/utils/enquiry-forms";
import { unsubscribeFromNewsletter } from "../../actions";

const INITIAL_STATE: EnquiryFormState<"token"> = { status: "idle" };

export function UnsubscribeForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    unsubscribeFromNewsletter,
    INITIAL_STATE,
  );

  if (state.status === "sent") {
    return <FormStatus message={state.message} tone="success" />;
  }

  return (
    <form action={formAction} className="flex flex-col gap-space-md">
      {state.status === "failed" ? (
        <FormStatus message={state.message} tone="error" />
      ) : null}
      <input name="token" type="hidden" value={token} />
      <p className="text-body-md text-on-surface-variant">
        След отписване ще пазим само имейла ви в списък за блокиране, за да не
        ви пишем отново.
      </p>
      <button
        className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary px-space-xl py-3 text-label-md font-bold tracking-wider text-on-primary uppercase transition-colors hover:bg-primary-fixed disabled:cursor-wait disabled:opacity-70 sm:self-start"
        disabled={pending}
        type="submit"
      >
        {pending ? "Отписване…" : "Отпиши ме"}
      </button>
    </form>
  );
}
