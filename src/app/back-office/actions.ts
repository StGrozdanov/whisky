"use server";

import { redirect } from "next/navigation";
import { getIdentity } from "@/identity/get-identity";
import {
  endShopkeeperSession,
  startShopkeeperSession,
} from "@/identity/sessions";
import { parseSignInForm, type SignInField } from "@/utils/account-forms";
import type { EnquiryFormState } from "@/utils/enquiry-forms";

export async function signInShopkeeper(
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
    const signedIn = await identity.signInShopkeeper(
      parsed.value.email,
      parsed.value.password,
    );
    if (!signedIn.ok) {
      return {
        status: "failed",
        message: "Грешен имейл или парола.",
        values,
      };
    }
    await startShopkeeperSession(signedIn.session);
  } catch (error) {
    console.error("Shopkeeper sign-in failed", error);
    return {
      status: "failed",
      message: "Нещо се обърка. Моля, опитайте отново след малко.",
      values,
    };
  }

  redirect("/back-office");
}

export async function signOutShopkeeper(): Promise<void> {
  await endShopkeeperSession();
  redirect("/back-office/sign-in");
}
