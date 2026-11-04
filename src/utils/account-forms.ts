import type { RegistrationInput } from "@/identity/types";
import {
  emailError,
  hasErrors,
  type Parsed,
  requiredText,
  text,
  withoutUndefined,
} from "./enquiry-forms";

export type RegistrationField =
  | keyof RegistrationInput
  | "passwordConfirmation";
export type SignInField = "email" | "password";
export type EmailVerificationField = "token" | SignInField;
export type PasswordResetField = "token" | "password" | "passwordConfirmation";

/** Bcrypt, behind Supabase Auth, ignores anything past 72 bytes. */
const PASSWORD_LIMITS = { min: 8, max: 72 } as const;
const NAME_LIMIT = 80;

const MESSAGES = {
  firstName: "Моля, въведете име.",
  lastName: "Моля, въведете фамилия.",
  passwordMissing: "Моля, въведете парола.",
  confirmationMissing: "Моля, повторете паролата.",
  confirmationMismatch: "Паролите не съвпадат.",
  passwordShort: `Паролата трябва да е поне ${PASSWORD_LIMITS.min} знака.`,
  // The limit is in UTF-8 bytes; a Cyrillic letter takes two.
  passwordLong: `Паролата е твърде дълга: до ${PASSWORD_LIMITS.max} знака на латиница или до ${PASSWORD_LIMITS.max / 2} на кирилица.`,
} as const;

/** Passwords are kept exactly as typed: spaces count. */
function password(form: FormData, name = "password"): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

function confirmationError(
  value: string,
  confirmation: string,
): string | undefined {
  if (confirmation === "") {
    return MESSAGES.confirmationMissing;
  }
  return confirmation === value ? undefined : MESSAGES.confirmationMismatch;
}

function newPasswordError(value: string): string | undefined {
  if (value.length < PASSWORD_LIMITS.min) {
    return MESSAGES.passwordShort;
  }
  if (new TextEncoder().encode(value).length > PASSWORD_LIMITS.max) {
    return MESSAGES.passwordLong;
  }
  return undefined;
}

export function parseRegistrationForm(
  form: FormData,
): Parsed<RegistrationField, RegistrationInput> {
  const value = {
    firstName: text(form, "firstName"),
    lastName: text(form, "lastName"),
    email: text(form, "email"),
    password: password(form),
  };
  const confirmation = password(form, "passwordConfirmation");
  const errors = withoutUndefined<RegistrationField>({
    firstName: requiredText(value.firstName, MESSAGES.firstName, NAME_LIMIT),
    lastName: requiredText(value.lastName, MESSAGES.lastName, NAME_LIMIT),
    email: emailError(value.email),
    password: newPasswordError(value.password),
    passwordConfirmation: confirmationError(value.password, confirmation),
  });

  if (hasErrors(errors)) {
    return {
      ok: false,
      errors,
      values: { ...value, password: "", passwordConfirmation: "" },
    };
  }
  return { ok: true, value };
}

export function parseSignInForm(
  form: FormData,
): Parsed<SignInField, { email: string; password: string }> {
  const value = { email: text(form, "email"), password: password(form) };
  const errors = withoutUndefined<SignInField>({
    email: emailError(value.email),
    password: value.password === "" ? MESSAGES.passwordMissing : undefined,
  });

  if (hasErrors(errors)) {
    return { ok: false, errors, values: { ...value, password: "" } };
  }
  return { ok: true, value };
}

export function parsePasswordResetForm(
  form: FormData,
): Parsed<PasswordResetField, { token: string; password: string }> {
  const value = { token: text(form, "token"), password: password(form) };
  const confirmation = password(form, "passwordConfirmation");
  const errors = withoutUndefined<PasswordResetField>({
    token: undefined,
    password: newPasswordError(value.password),
    passwordConfirmation: confirmationError(value.password, confirmation),
  });

  if (hasErrors(errors)) {
    return {
      ok: false,
      errors,
      values: { ...value, password: "", passwordConfirmation: "" },
    };
  }
  return { ok: true, value };
}

export function parseRecoveryRequestForm(
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

export function parseEmailVerificationForm(
  form: FormData,
): Parsed<
  EmailVerificationField,
  { token: string; email: string; password: string }
> {
  const signIn = parseSignInForm(form);
  const token = text(form, "token");
  if (!signIn.ok) {
    return {
      ok: false,
      errors: signIn.errors,
      values: { token, ...signIn.values },
    };
  }
  return { ok: true, value: { token, ...signIn.value } };
}
