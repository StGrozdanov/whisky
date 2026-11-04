import { randomUUID } from "node:crypto";
import { expect, type Page, test } from "@playwright/test";

// Authentication and access boundaries against live Supabase Auth. Nothing
// here creates a login or sends an email: registration stops at validation,
// sign-in uses an address with no login, and links use made-up tokens.

function unknownEmail(): string {
  return `e2e-${randomUUID()}@example.com`;
}

async function signInAs(page: Page, formName: string, email: string) {
  const form = page.getByRole("form", { name: formName });
  await form.getByLabel("Имейл").fill(email);
  await form.getByLabel("Парола").fill("not-a-real-password");
  await form.getByRole("button", { name: "Вход" }).click();
  return form;
}

test.describe("Accounts and Shopkeeper access", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("a guest is sent from the Account to sign in", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Акаунт" }).click();

    await expect(page).toHaveURL(/\/account\/sign-in$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Вход" }),
    ).toBeVisible();
  });

  test("sign-in refuses an email without a login", async ({ page }) => {
    await page.goto("/account/sign-in");
    const form = await signInAs(page, "Вход в акаунта", unknownEmail());

    await expect(
      form.getByRole("alert").filter({ hasText: "Грешен имейл или парола." }),
    ).toBeVisible();
  });

  test("registration names the missing fields", async ({ page }) => {
    await page.goto("/account/register");
    const form = page.getByRole("form", { name: "Регистрация" });
    await form.getByRole("button", { name: "Създай акаунт" }).click();

    await expect(form.getByText("Моля, въведете име.")).toBeVisible();
    await expect(form.getByText("Моля, въведете фамилия.")).toBeVisible();
    await expect(form.getByText("Моля, въведете имейл.")).toBeVisible();
  });

  test("made-up verification and recovery links are refused", async ({
    page,
  }) => {
    await page.goto(`/account/verify-email?token_hash=${randomUUID()}`);
    await page.getByRole("button", { name: "Потвърди имейла" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "невалиден" }),
    ).toBeVisible();

    await page.goto(`/account/reset-password?token_hash=${randomUUID()}`);
    const reset = page.getByRole("form", { name: "Нова парола" });
    await reset.getByLabel(/^Нова парола/).fill("not-a-real-password");
    await reset
      .getByLabel("Повторете новата парола")
      .fill("not-a-real-password");
    await reset.getByRole("button", { name: "Запази паролата" }).click();
    await expect(
      reset.getByRole("alert").filter({ hasText: "Поискайте нов линк" }),
    ).toBeVisible();
  });

  test("the back office is closed to guests and unknown logins", async ({
    page,
  }) => {
    await page.goto("/back-office");
    await expect(page).toHaveURL(/\/back-office\/sign-in$/);

    const form = await signInAs(page, "Вход в бек офиса", unknownEmail());
    await expect(
      form.getByRole("alert").filter({ hasText: "Грешен имейл или парола." }),
    ).toBeVisible();
  });
});
