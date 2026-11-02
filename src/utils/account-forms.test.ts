import { describe, expect, it } from "vitest";
import {
  parsePasswordResetForm,
  parseRecoveryRequestForm,
  parseRegistrationForm,
  parseSignInForm,
} from "./account-forms";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    data.set(name, value);
  }
  return data;
}

const VALID_REGISTRATION = {
  firstName: " Мария ",
  lastName: "Иванова",
  email: " maria@example.com ",
  password: "dalmore-12",
};

describe("parseRegistrationForm", () => {
  it("accepts first and last name, email and password", () => {
    expect(parseRegistrationForm(form(VALID_REGISTRATION))).toEqual({
      ok: true,
      value: {
        firstName: "Мария",
        lastName: "Иванова",
        email: "maria@example.com",
        password: "dalmore-12",
      },
    });
  });

  it("requires every field and never echoes the password back", () => {
    expect(
      parseRegistrationForm(
        form({ firstName: "", lastName: " ", email: "", password: "x" }),
      ),
    ).toEqual({
      ok: false,
      errors: {
        firstName: "Моля, въведете име.",
        lastName: "Моля, въведете фамилия.",
        email: "Моля, въведете имейл.",
        password: "Паролата трябва да е поне 8 знака.",
      },
      values: { firstName: "", lastName: "", email: "", password: "" },
    });
  });

  it("keeps the password exactly as typed and caps its length", () => {
    const spaced = parseRegistrationForm(
      form({ ...VALID_REGISTRATION, password: "  spaced  " }),
    );
    const tooLong = parseRegistrationForm(
      form({ ...VALID_REGISTRATION, password: "a".repeat(73) }),
    );

    expect(spaced).toMatchObject({
      ok: true,
      value: { password: "  spaced  " },
    });
    expect(tooLong).toMatchObject({
      ok: false,
      errors: { password: "Паролата може да е до 72 знака." },
    });
  });
});

describe("parseSignInForm", () => {
  it("needs an email and a password but no password rules", () => {
    expect(
      parseSignInForm(form({ email: "maria@example.com", password: "short" })),
    ).toEqual({
      ok: true,
      value: { email: "maria@example.com", password: "short" },
    });
    expect(parseSignInForm(form({ email: "maria@", password: "" }))).toEqual({
      ok: false,
      errors: {
        email: "Моля, въведете валиден имейл адрес.",
        password: "Моля, въведете парола.",
      },
      values: { email: "maria@", password: "" },
    });
  });
});

describe("parsePasswordResetForm", () => {
  it("carries the recovery link token with the new password", () => {
    expect(
      parsePasswordResetForm(form({ token: "abc", password: "new-password" })),
    ).toEqual({ ok: true, value: { token: "abc", password: "new-password" } });
    expect(
      parsePasswordResetForm(form({ token: "abc", password: "short" })),
    ).toEqual({
      ok: false,
      errors: { password: "Паролата трябва да е поне 8 знака." },
      values: { token: "abc", password: "" },
    });
  });
});

describe("parseRecoveryRequestForm", () => {
  it("needs a valid email", () => {
    expect(
      parseRecoveryRequestForm(form({ email: " maria@example.com " })),
    ).toEqual({ ok: true, value: { email: "maria@example.com" } });
    expect(parseRecoveryRequestForm(form({ email: "maria@" }))).toEqual({
      ok: false,
      errors: { email: "Моля, въведете валиден имейл адрес." },
      values: { email: "maria@" },
    });
  });
});
