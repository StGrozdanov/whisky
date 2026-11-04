import { describe, expect, it } from "vitest";
import {
  parseEmailVerificationForm,
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
  passwordConfirmation: "dalmore-12",
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
        form({
          firstName: "",
          lastName: " ",
          email: "",
          password: "x",
          passwordConfirmation: "",
        }),
      ),
    ).toEqual({
      ok: false,
      errors: {
        firstName: "Моля, въведете име.",
        lastName: "Моля, въведете фамилия.",
        email: "Моля, въведете имейл.",
        password: "Паролата трябва да е поне 8 знака.",
        passwordConfirmation: "Моля, повторете паролата.",
      },
      values: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirmation: "",
      },
    });
  });

  it("needs the password typed twice the same way", () => {
    expect(
      parseRegistrationForm(
        form({ ...VALID_REGISTRATION, passwordConfirmation: "dalmore-21" }),
      ),
    ).toMatchObject({
      ok: false,
      errors: { passwordConfirmation: "Паролите не съвпадат." },
    });
  });

  it("keeps the password exactly as typed and caps its length", () => {
    const spaced = parseRegistrationForm(
      form({
        ...VALID_REGISTRATION,
        password: "  spaced  ",
        passwordConfirmation: "  spaced  ",
      }),
    );
    const tooLong = parseRegistrationForm(
      form({
        ...VALID_REGISTRATION,
        password: "a".repeat(73),
        passwordConfirmation: "a".repeat(73),
      }),
    );
    const cyrillicTooLong = parseRegistrationForm(
      form({
        ...VALID_REGISTRATION,
        password: "я".repeat(37),
        passwordConfirmation: "я".repeat(37),
      }),
    );

    expect(spaced).toMatchObject({
      ok: true,
      value: { password: "  spaced  " },
    });
    const longMessage =
      "Паролата е твърде дълга: до 72 знака на латиница или до 36 на кирилица.";
    expect(tooLong).toMatchObject({
      ok: false,
      errors: { password: longMessage },
    });
    expect(cyrillicTooLong).toMatchObject({
      ok: false,
      errors: { password: longMessage },
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
  it("carries the recovery link token with the new password typed twice", () => {
    expect(
      parsePasswordResetForm(
        form({
          token: "abc",
          password: "new-password",
          passwordConfirmation: "new-password",
        }),
      ),
    ).toEqual({ ok: true, value: { token: "abc", password: "new-password" } });
    expect(
      parsePasswordResetForm(
        form({
          token: "abc",
          password: "short",
          passwordConfirmation: "other",
        }),
      ),
    ).toEqual({
      ok: false,
      errors: {
        password: "Паролата трябва да е поне 8 знака.",
        passwordConfirmation: "Паролите не съвпадат.",
      },
      values: { token: "abc", password: "", passwordConfirmation: "" },
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

describe("parseEmailVerificationForm", () => {
  it("carries the verification link token with the sign-in details", () => {
    expect(
      parseEmailVerificationForm(
        form({ token: "abc", email: " maria@example.com ", password: "pw" }),
      ),
    ).toEqual({
      ok: true,
      value: { token: "abc", email: "maria@example.com", password: "pw" },
    });
    expect(
      parseEmailVerificationForm(
        form({ token: "abc", email: "", password: "" }),
      ),
    ).toEqual({
      ok: false,
      errors: {
        email: "Моля, въведете имейл.",
        password: "Моля, въведете парола.",
      },
      values: { token: "abc", email: "", password: "" },
    });
  });
});
