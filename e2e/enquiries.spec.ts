import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

// Critical public journeys for navigation, Policy pages, Contact, and
// Newsletter. Nothing here writes to the shared nonprod database: forms are
// exercised through their validation and unknown-token paths only.

const MAIN_NAVIGATION = [
  { name: "Селекция", path: "/catalogue" },
  { name: "Подаръци", path: "/gifts" },
  { name: "Промоции", path: "/promotions" },
  { name: "Награди", path: "/awards" },
  { name: "Клуб", path: "/club" },
];

const POLICIES = [
  { name: "Общи условия", path: "/terms" },
  { name: "Политика за поверителност", path: "/privacy" },
  { name: "Политика за бисквитките", path: "/cookies" },
  { name: "Доставка и плащане", path: "/delivery-and-payment" },
  { name: "Отказ и връщане", path: "/withdrawal-and-returns" },
  { name: "Възрастова политика", path: "/age-policy" },
];

test.describe("public utility pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("Main navigation reaches each public destination", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Основна навигация" });
    await expect(nav.getByRole("link", { name: "Finder" })).toHaveAttribute(
      "href",
      "/finder",
    );
    await expect(nav.getByRole("link", { name: "За нас" })).toHaveCount(0);

    for (const link of MAIN_NAVIGATION) {
      await nav.getByRole("link", { name: link.name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${link.path}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("footer opens every Policy page and the About page", async ({
    page,
  }) => {
    for (const policy of POLICIES) {
      await page.goto("/");
      await page
        .getByRole("contentinfo")
        .getByRole("link", { name: policy.name, exact: true })
        .click();
      await expect(page).toHaveURL(new RegExp(`${policy.path}$`));
      await expect(
        page.getByRole("heading", { level: 1, name: policy.name }),
      ).toBeVisible();
    }

    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: /Повече за нас/ })
      .click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "За нас" }),
    ).toBeVisible();
  });

  test("Contact request names missing required fields", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Форма за контакти" })
      .click();
    await expect(page).toHaveURL(/\/contacts$/);

    const form = page.getByRole("form", { name: "Форма за контакти" });
    await form.getByRole("button", { name: "Изпрати съобщението" }).click();

    await expect(form.getByText("Моля, въведете име.")).toBeVisible();
    await expect(form.getByText("Моля, въведете имейл.")).toBeVisible();
    await expect(form.getByText("Моля, въведете тема.")).toBeVisible();
    await expect(form.getByText("Моля, напишете съобщение.")).toBeVisible();
  });

  test("Newsletter signup validates the email before subscribing", async ({
    page,
  }) => {
    await page.goto("/");

    const form = page.getByRole("form", { name: "Абонамент за бюлетина" });
    await form.getByLabel("Имейл за бюлетина").fill("not-an-email");
    await form.getByRole("button", { name: "Абонирай се" }).click();

    await expect(
      form.getByText("Моля, въведете валиден имейл адрес."),
    ).toBeVisible();
  });

  test("an unknown unsubscribe link is reported honestly", async ({ page }) => {
    await page.goto(`/newsletter/unsubscribe?token=${randomUUID()}`);

    await page.getByRole("button", { name: "Отпиши ме" }).click();

    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "невалиден или вече е използван",
    );
  });
});
