"use server";

import { getShop } from "@/shop/get-shop";
import type { WaitlistJoinOutcome } from "@/shop/types";
import {
  type EnquiryFormState,
  parseWaitlistForm,
  type WaitlistField,
} from "@/utils/enquiry-forms";

/** Ask us: join the Waitlist for a SKU that is not In stock. */
export async function joinWaitlist(
  _previous: EnquiryFormState<WaitlistField>,
  formData: FormData,
): Promise<EnquiryFormState<WaitlistField>> {
  const parsed = parseWaitlistForm(formData);
  if (!parsed.ok) {
    return { status: "invalid", errors: parsed.errors, values: parsed.values };
  }
  const values = {
    ...parsed.value,
    phone: parsed.value.phone ? parsed.value.phone : "",
  };

  let outcome: WaitlistJoinOutcome;
  try {
    const shop = await getShop();
    outcome = await shop.joinWaitlist(parsed.value);
  } catch (error) {
    console.error("Waitlist join failed", error);
    return {
      status: "failed",
      message: "Не успяхме да ви запишем. Моля, опитайте отново.",
      values,
    };
  }

  if (outcome === "sku-in-stock") {
    return {
      status: "failed",
      message:
        "Този размер вече е в наличност. Презаредете страницата, за да го поръчате.",
      values,
    };
  }
  if (outcome === "sku-not-found") {
    return {
      status: "failed",
      message: "Този размер вече не се предлага.",
      values,
    };
  }
  if (outcome === "already-joined") {
    return {
      status: "sent",
      message:
        "Този имейл вече е в списъка за изчакване за този размер. Ще ви пишем веднъж, когато е отново в наличност.",
    };
  }

  return {
    status: "sent",
    message:
      "Записахме ви. Ще ви изпратим един имейл, когато този размер е отново в наличност. Това не е резервация или поръчка.",
  };
}
