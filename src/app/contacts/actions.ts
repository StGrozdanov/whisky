"use server";

import { getShop } from "@/shop/get-shop";
import {
  type ContactField,
  type EnquiryFormState,
  parseContactForm,
} from "@/utils/enquiry-forms";

export async function submitContactRequest(
  _previous: EnquiryFormState<ContactField>,
  formData: FormData,
): Promise<EnquiryFormState<ContactField>> {
  const parsed = parseContactForm(formData);
  if (!parsed.ok) {
    return { status: "invalid", errors: parsed.errors, values: parsed.values };
  }

  try {
    const shop = await getShop();
    await shop.submitContactRequest(parsed.value);
  } catch (error) {
    console.error("Contact request failed", error);
    return {
      status: "failed",
      message:
        "Не успяхме да изпратим съобщението. Моля, опитайте отново или ни се обадете.",
      values: {
        ...parsed.value,
        phone: parsed.value.phone ? parsed.value.phone : "",
      },
    };
  }

  return {
    status: "sent",
    message:
      "Благодарим ви! Получихме съобщението и ще отговорим на посочения имейл или телефон.",
  };
}
