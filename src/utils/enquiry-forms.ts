import type { ContactRequestInput, WaitlistJoinInput } from "@/shop/types";

type Parsed<Field extends string, Value> =
  | { ok: true; value: Value }
  | {
      ok: false;
      errors: Partial<Record<Field, string>>;
      values: Record<Field, string>;
    };

export type ContactField = "name" | "email" | "phone" | "subject" | "message";
export type WaitlistField = "skuId" | "email" | "phone";

/** Server action state shared by the Contact, Newsletter and Waitlist forms. */
export type EnquiryFormState<Field extends string> =
  | { status: "idle" }
  | {
      status: "invalid";
      errors: Partial<Record<Field, string>>;
      values: Record<Field, string>;
    }
  | { status: "failed"; message: string; values: Record<Field, string> }
  | { status: "sent"; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s\-()]{5,19}$/;

const LIMITS = {
  name: 120,
  email: 254,
  subject: 150,
  message: 5000,
} as const;

const MESSAGES = {
  name: "Моля, въведете име.",
  emailMissing: "Моля, въведете имейл.",
  emailInvalid: "Моля, въведете валиден имейл адрес.",
  phone: "Моля, въведете валиден телефонен номер или оставете полето празно.",
  subject: "Моля, въведете тема.",
  message: "Моля, напишете съобщение.",
  sku: "Моля, изберете размер на бутилката.",
} as const;

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function tooLong(limit: number): string {
  return `Текстът е твърде дълъг (до ${limit} знака).`;
}

function requiredText(
  value: string,
  missing: string,
  limit: number,
): string | undefined {
  if (value === "") {
    return missing;
  }
  if (value.length > limit) {
    return tooLong(limit);
  }
  return undefined;
}

function emailError(value: string): string | undefined {
  if (value === "") {
    return MESSAGES.emailMissing;
  }
  if (value.length > LIMITS.email || !EMAIL_PATTERN.test(value)) {
    return MESSAGES.emailInvalid;
  }
  return undefined;
}

function phoneError(value: string): string | undefined {
  if (value === "" || PHONE_PATTERN.test(value)) {
    return undefined;
  }
  return MESSAGES.phone;
}

function withoutUndefined<Field extends string>(
  errors: Record<Field, string | undefined>,
): Partial<Record<Field, string>> {
  const result: Partial<Record<Field, string>> = {};
  for (const [field, message] of Object.entries(errors) as [
    Field,
    string | undefined,
  ][]) {
    if (message) {
      result[field] = message;
    }
  }
  return result;
}

function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}

export function parseContactForm(
  form: FormData,
): Parsed<ContactField, ContactRequestInput> {
  const values = {
    name: text(form, "name"),
    email: text(form, "email"),
    phone: text(form, "phone"),
    subject: text(form, "subject"),
    message: text(form, "message"),
  };
  const errors = withoutUndefined<ContactField>({
    name: requiredText(values.name, MESSAGES.name, LIMITS.name),
    email: emailError(values.email),
    phone: phoneError(values.phone),
    subject: requiredText(values.subject, MESSAGES.subject, LIMITS.subject),
    message: requiredText(values.message, MESSAGES.message, LIMITS.message),
  });

  if (hasErrors(errors)) {
    return { ok: false, errors, values };
  }
  return {
    ok: true,
    value: { ...values, phone: values.phone === "" ? undefined : values.phone },
  };
}

export function parseNewsletterForm(
  form: FormData,
): Parsed<"email", { email: string }> {
  const values = { email: text(form, "email") };
  const errors = withoutUndefined<"email">({
    email: emailError(values.email),
  });

  if (hasErrors(errors)) {
    return { ok: false, errors, values };
  }
  return { ok: true, value: values };
}

export function parseWaitlistForm(
  form: FormData,
): Parsed<WaitlistField, WaitlistJoinInput> {
  const values = {
    skuId: text(form, "skuId"),
    email: text(form, "email"),
    phone: text(form, "phone"),
  };
  const errors = withoutUndefined<WaitlistField>({
    skuId: values.skuId === "" ? MESSAGES.sku : undefined,
    email: emailError(values.email),
    phone: phoneError(values.phone),
  });

  if (hasErrors(errors)) {
    return { ok: false, errors, values };
  }
  return {
    ok: true,
    value: { ...values, phone: values.phone === "" ? undefined : values.phone },
  };
}
