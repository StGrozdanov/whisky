import { describe, expect, it } from "vitest";
import {
  parseContactForm,
  parseNewsletterForm,
  parseWaitlistForm,
} from "./enquiry-forms";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    data.set(name, value);
  }
  return data;
}

const VALID_CONTACT = {
  name: "Мария Иванова",
  email: "maria@example.com",
  phone: "",
  subject: "Дегустация",
  message: "Организирате ли дегустации?",
};

describe("parseContactForm", () => {
  it("accepts the required fields without a phone", () => {
    expect(parseContactForm(form(VALID_CONTACT))).toEqual({
      ok: true,
      value: {
        name: "Мария Иванова",
        email: "maria@example.com",
        phone: undefined,
        subject: "Дегустация",
        message: "Организирате ли дегустации?",
      },
    });
  });

  it("trims values and keeps an optional phone", () => {
    const result = parseContactForm(
      form({ ...VALID_CONTACT, name: "  Мария ", phone: " +359 888 123 456 " }),
    );

    expect(result).toMatchObject({
      ok: true,
      value: { name: "Мария", phone: "+359 888 123 456" },
    });
  });

  it("names every missing required field", () => {
    const result = parseContactForm(form({}));

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(Object.keys(result.errors).sort()).toEqual([
      "email",
      "message",
      "name",
      "subject",
    ]);
    expect(result.errors.name).toBe("Моля, въведете име.");
  });

  it("rejects a malformed email and phone but keeps what was typed", () => {
    const result = parseContactForm(
      form({ ...VALID_CONTACT, email: "maria@", phone: "call me" }),
    );

    expect(result).toMatchObject({
      ok: false,
      errors: {
        email: "Моля, въведете валиден имейл адрес.",
        phone:
          "Моля, въведете валиден телефонен номер или оставете полето празно.",
      },
      values: { email: "maria@", phone: "call me", name: "Мария Иванова" },
    });
  });

  it("limits the message length", () => {
    const result = parseContactForm(
      form({ ...VALID_CONTACT, message: "a".repeat(5001) }),
    );

    expect(result).toMatchObject({
      ok: false,
      errors: { message: "Текстът е твърде дълъг (до 5000 знака)." },
    });
  });
});

describe("parseNewsletterForm", () => {
  it("accepts an email", () => {
    expect(parseNewsletterForm(form({ email: " ivan@example.com " }))).toEqual({
      ok: true,
      value: { email: "ivan@example.com" },
    });
  });

  it("requires a valid email", () => {
    expect(parseNewsletterForm(form({ email: "" }))).toMatchObject({
      ok: false,
      errors: { email: "Моля, въведете имейл." },
    });
    expect(parseNewsletterForm(form({ email: "ivan" }))).toMatchObject({
      ok: false,
      errors: { email: "Моля, въведете валиден имейл адрес." },
    });
  });
});

describe("parseWaitlistForm", () => {
  it("requires an email and accepts an optional phone", () => {
    expect(
      parseWaitlistForm(
        form({ target: "sku:sku-1", email: "guest@example.com", phone: "" }),
      ),
    ).toEqual({
      ok: true,
      value: {
        target: { kind: "sku", skuId: "sku-1" },
        email: "guest@example.com",
        phone: undefined,
      },
    });
  });

  it("reads a Pack target", () => {
    expect(
      parseWaitlistForm(
        form({ target: "pack:pack-1", email: "guest@example.com" }),
      ),
    ).toMatchObject({
      ok: true,
      value: { target: { kind: "pack", packId: "pack-1" } },
    });
  });

  it("rejects a missing email or target", () => {
    const result = parseWaitlistForm(form({ target: "", email: "" }));

    expect(result).toMatchObject({
      ok: false,
      errors: { email: "Моля, въведете имейл.", target: expect.any(String) },
    });
  });

  it("rejects a malformed target", () => {
    for (const target of ["sku:", "box:1", "sku-1"]) {
      expect(
        parseWaitlistForm(form({ target, email: "guest@example.com" })),
      ).toMatchObject({ ok: false, errors: { target: expect.any(String) } });
    }
  });
});
