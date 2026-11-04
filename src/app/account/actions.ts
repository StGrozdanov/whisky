"use server";

import { redirect } from "next/navigation";
import { getIdentity } from "@/identity/get-identity";
import { endMemberSession, startMemberSession } from "@/identity/sessions";
import {
  type EmailVerificationField,
  type PasswordResetField,
  parseEmailVerificationForm,
  parsePasswordResetForm,
  parseRecoveryRequestForm,
  parseRegistrationForm,
  parseSignInForm,
  type RegistrationField,
  type SignInField,
} from "@/utils/account-forms";
import type { EnquiryFormState } from "@/utils/enquiry-forms";

const RETRY_MESSAGE = "Нещо се обърка. Моля, опитайте отново след малко.";

const INVALID_LINK_MESSAGE =
  "Линкът е невалиден, изтекъл или вече е използван.";

export async function registerAccount(
  _previous: EnquiryFormState<RegistrationField>,
  formData: FormData,
): Promise<EnquiryFormState<RegistrationField>> {
  const parsed = parseRegistrationForm(formData);
  if (!parsed.ok) {
    return { status: "invalid", errors: parsed.errors, values: parsed.values };
  }

  const values = { ...parsed.value, password: "", passwordConfirmation: "" };
  try {
    const identity = await getIdentity();
    const outcome = await identity.register(parsed.value);
    if (outcome === "already-registered") {
      return {
        status: "invalid",
        errors: {
          email:
            "Вече има акаунт с този имейл. Влезте или сменете паролата си през „Забравена парола“.",
        },
        values,
      };
    }
  } catch (error) {
    console.error("Account registration failed", error);
    return { status: "failed", message: RETRY_MESSAGE, values };
  }

  return {
    status: "sent",
    message: `Изпратихме линк за потвърждение на ${parsed.value.email}. Отворете го, за да активирате акаунта си.`,
  };
}

export async function verifyEmail(
  _previous: EnquiryFormState<EmailVerificationField>,
  formData: FormData,
): Promise<EnquiryFormState<EmailVerificationField>> {
  const parsed = parseEmailVerificationForm(formData);
  if (!parsed.ok) {
    return { status: "invalid", errors: parsed.errors, values: parsed.values };
  }
  const values = { ...parsed.value, password: "" };

  try {
    const identity = await getIdentity();
    const verified = await identity.verifyEmail({
      tokenHash: parsed.value.token,
      email: parsed.value.email,
      password: parsed.value.password,
    });
    if (!verified.ok) {
      return {
        status: "failed",
        message:
          verified.reason === "invalid-credentials"
            ? "Грешен имейл или парола. Ако не помните паролата, сменете я през „Забравена парола“: това също потвърждава имейла."
            : `${INVALID_LINK_MESSAGE} Ако вече сте потвърдили имейла си, просто влезте. Иначе се регистрирайте отново, за да получите нов линк.`,
        values,
      };
    }
    await startMemberSession(verified.session);
  } catch (error) {
    console.error("Email verification failed", error);
    return { status: "failed", message: RETRY_MESSAGE, values };
  }

  redirect("/account");
}

export async function signIn(
  _previous: EnquiryFormState<SignInField>,
  formData: FormData,
): Promise<EnquiryFormState<SignInField>> {
  const parsed = parseSignInForm(formData);
  if (!parsed.ok) {
    return { status: "invalid", errors: parsed.errors, values: parsed.values };
  }
  const values = { email: parsed.value.email, password: "" };

  try {
    const identity = await getIdentity();
    const signedIn = await identity.signInMember(
      parsed.value.email,
      parsed.value.password,
    );
    if (!signedIn.ok) {
      return {
        status: "failed",
        message:
          signedIn.reason === "email-not-verified"
            ? "Още не сте потвърдили имейла си. Отворете линка, който ви изпратихме, или се регистрирайте отново, за да получите нов."
            : "Грешен имейл или парола.",
        values,
      };
    }
    await startMemberSession(signedIn.session);
  } catch (error) {
    console.error("Sign-in failed", error);
    return { status: "failed", message: RETRY_MESSAGE, values };
  }

  redirect("/account");
}

export async function requestPasswordReset(
  _previous: EnquiryFormState<"email">,
  formData: FormData,
): Promise<EnquiryFormState<"email">> {
  const parsed = parseRecoveryRequestForm(formData);
  if (!parsed.ok) {
    return { status: "invalid", errors: parsed.errors, values: parsed.values };
  }

  try {
    const identity = await getIdentity();
    await identity.requestPasswordReset(parsed.value.email);
  } catch (error) {
    console.error("Password reset request failed", error);
    return { status: "failed", message: RETRY_MESSAGE, values: parsed.value };
  }

  return {
    status: "sent",
    message: `Изпратихме линк на имейла ${parsed.value.email}, за да смените паролата си.`,
  };
}

export async function resetPassword(
  _previous: EnquiryFormState<PasswordResetField>,
  formData: FormData,
): Promise<EnquiryFormState<PasswordResetField>> {
  const parsed = parsePasswordResetForm(formData);
  if (!parsed.ok) {
    return { status: "invalid", errors: parsed.errors, values: parsed.values };
  }
  const values = {
    token: parsed.value.token,
    password: "",
    passwordConfirmation: "",
  };

  try {
    const identity = await getIdentity();
    const outcome = await identity.resetPassword(
      parsed.value.token,
      parsed.value.password,
    );
    if (outcome === "invalid-link") {
      return {
        status: "failed",
        message: `${INVALID_LINK_MESSAGE} Поискайте нов линк за нова парола.`,
        values,
      };
    }
  } catch (error) {
    console.error("Password reset failed", error);
    return { status: "failed", message: RETRY_MESSAGE, values };
  }

  return {
    status: "sent",
    message: "Паролата е сменена. Вече можете да влезете с новата парола.",
  };
}

export async function signOut(): Promise<void> {
  await endMemberSession();
  redirect("/");
}
