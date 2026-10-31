"use server";

import { getShop } from "@/shop/get-shop";
import {
  type EnquiryFormState,
  parseNewsletterForm,
} from "@/utils/enquiry-forms";
import { PRIVACY_POLICY_VERSION } from "@/utils/policy-versions";

export async function subscribeToNewsletter(
  _previous: EnquiryFormState<"email">,
  formData: FormData,
): Promise<EnquiryFormState<"email">> {
  const parsed = parseNewsletterForm(formData);
  if (!parsed.ok) {
    return { status: "invalid", errors: parsed.errors, values: parsed.values };
  }

  try {
    const shop = await getShop();
    await shop.subscribeToNewsletter({
      email: parsed.value.email,
      policyVersion: PRIVACY_POLICY_VERSION,
    });
  } catch (error) {
    console.error("Newsletter subscription failed", error);
    return {
      status: "failed",
      message: "Не успяхме да ви абонираме. Моля, опитайте отново.",
      values: parsed.value,
    };
  }

  return {
    status: "sent",
    message:
      "Абонирахте се за бюлетина. Във всяко писмо има линк за отписване.",
  };
}

export async function unsubscribeFromNewsletter(
  _previous: EnquiryFormState<"token">,
  formData: FormData,
): Promise<EnquiryFormState<"token">> {
  const token = formData.get("token");
  const values = { token: typeof token === "string" ? token : "" };

  try {
    const shop = await getShop();
    const outcome = await shop.unsubscribeFromNewsletter(values.token);
    if (outcome === "unknown-token") {
      return {
        status: "failed",
        message:
          "Линкът за отписване е невалиден или вече е използван. Ако все още получавате бюлетина, пишете ни на info@whiskyfinder.bg.",
        values,
      };
    }
  } catch (error) {
    console.error("Newsletter unsubscribe failed", error);
    return {
      status: "failed",
      message: "Не успяхме да ви отпишем. Моля, опитайте отново.",
      values,
    };
  }

  return {
    status: "sent",
    message:
      "Отписахте се от бюлетина. Няма да получавате повече писма от нас.",
  };
}
