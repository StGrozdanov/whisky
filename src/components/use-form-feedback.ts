"use client";

import { type FormEvent, useState } from "react";
import type { EnquiryFormState } from "@/utils/enquiry-forms";

type Validation<Field extends string> =
  | { ok: true }
  | { ok: false; errors: Partial<Record<Field, string>> };

type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

type Editable = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isEditable(element: unknown): element is Editable {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  );
}

/**
 * The browser half of a form's validation. Submitting runs the same parser
 * as the server action: an invalid form shows its errors at once, moves focus
 * to the first one, and sends nothing. Typing into a field clears that
 * field's error and any form-level failure, so the Customer sees the edit
 * taken. The server action still validates everything it receives.
 */
export function useFormFeedback<Field extends string>(
  state: EnquiryFormState<Field>,
  validate: (form: FormData) => Validation<Field>,
) {
  const [shownFor, setShownFor] = useState(state);
  const [browserErrors, setBrowserErrors] = useState<FieldErrors<Field> | null>(
    null,
  );
  const [edited, setEdited] = useState<ReadonlySet<string>>(new Set());
  const [failureDismissed, setFailureDismissed] = useState(false);

  // A new server answer replaces whatever the browser showed before it.
  if (shownFor !== state) {
    setShownFor(state);
    setBrowserErrors(null);
    setEdited(new Set());
    setFailureDismissed(false);
  }

  const shown: FieldErrors<Field> = browserErrors
    ? browserErrors
    : state.status === "invalid"
      ? state.errors
      : {};
  const errors: FieldErrors<Field> = {};
  for (const [field, message] of Object.entries(shown) as [
    Field,
    string | undefined,
  ][]) {
    if (message && !edited.has(field)) {
      errors[field] = message;
    }
  }

  const failure =
    state.status === "failed" && !browserErrors && !failureDismissed
      ? state.message
      : undefined;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const result = validate(new FormData(event.currentTarget));
    if (result.ok) {
      return;
    }
    event.preventDefault();
    setBrowserErrors(result.errors);
    setEdited(new Set());
    const firstInvalid = Array.from(event.currentTarget.elements).find(
      (element) => isEditable(element) && element.name in result.errors,
    );
    if (isEditable(firstInvalid)) {
      firstInvalid.focus();
    }
  }

  function onInput(event: FormEvent<HTMLFormElement>) {
    const target = event.target;
    if (!isEditable(target)) {
      return;
    }
    if (!failureDismissed) {
      setFailureDismissed(true);
    }
    if (!edited.has(target.name)) {
      setEdited(new Set(edited).add(target.name));
    }
  }

  return {
    errors,
    hasErrors: Object.keys(errors).length > 0,
    failure,
    formProps: { onSubmit, onInput },
  };
}
