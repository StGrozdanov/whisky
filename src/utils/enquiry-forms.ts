import type {
  ContactRequestInput,
  WaitlistJoinInput,
  WaitlistTarget,
} from "@/shop/types";

type Parsed<Field extends string, Value> =
  | { ok: true; value: Value }
  | {
      ok: false;
      errors: Partial<Record<Field, string>>;
      values: Record<Field, string>;
    };

export type ContactField = "name" | "email" | "phone" | "subject" | "message";
export type WaitlistField = "target" | "email" | "phone";

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
  target: "Не разпознахме продукта. Моля, презаредете страницата.",
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
    target: text(form, "target"),
    email: text(form, "email"),
    phone: text(form, "phone"),
  };
  const target = parseWaitlistTarget(values.target);
  const errors = withoutUndefined<WaitlistField>({
    target: target ? undefined : MESSAGES.target,
    email: emailError(values.email),
    phone: phoneError(values.phone),
  });

  if (!target || hasErrors(errors)) {
    return { ok: false, errors, values };
  }
  return {
    ok: true,
    value: {
      target,
      email: values.email,
      phone: values.phone === "" ? undefined : values.phone,
    },
  };
}

/** The hidden form value for a Waitlist target: `sku:<id>` or `pack:<id>`. */
export function waitlistTargetValue(target: WaitlistTarget): string {
  return target.kind === "sku"
    ? `sku:${target.skuId}`
    : `pack:${target.packId}`;
}

function parseWaitlistTarget(value: string): WaitlistTarget | undefined {
  const separator = value.indexOf(":");
  const kind = value.slice(0, separator);
  const id = value.slice(separator + 1);
  if (separator < 0 || id === "") {
    return undefined;
  }
  if (kind === "sku") {
    return { kind, skuId: id };
  }
  if (kind === "pack") {
    return { kind, packId: id };
  }
  return undefined;
}
