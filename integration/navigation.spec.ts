import { expect, test } from "@playwright/test";

const MAIN_NAVIGATION = [
  { name: "Селекция", href: "/catalogue" },
  { name: "Подаръци", href: "/gifts" },
  { name: "Промоции", href: "/promotions" },
  { name: "Награди", href: "/awards" },
  { name: "Клуб", href: "/club" },
  { name: "Finder", href: "/finder" },
];

const POLICIES = [
  { name: "Общи условия", href: "/terms" },
  { name: "Политика за поверителност", href: "/privacy" },
  { name: "Политика за бисквитките", href: "/cookies" },
  { name: "Доставка и плащане", href: "/delivery-and-payment" },
  { name: "Отказ и връщане", href: "/withdrawal-and-returns" },
  { name: "Възрастова политика", href: "/age-policy" },
];

test.describe("navigation, footer and Policy pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("Main navigation links the agreed destinations and not About", async ({
    page,
  }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Основна навигация" });
    const links = nav.getByRole("link");
    await expect(links).toHaveCount(MAIN_NAVIGATION.length);
    for (const [index, link] of MAIN_NAVIGATION.entries()) {
      await expect(links.nth(index)).toHaveText(link.name);
      await expect(links.nth(index)).toHaveAttribute("href", link.href);
    }
    await expect(nav.getByRole("link", { name: "За нас" })).toHaveCount(0);
  });

  test("Main navigation marks the current destination", async ({ page }) => {
    await page.goto("/promotions");

    const nav = page.getByRole("navigation", { name: "Основна навигация" });
    await expect(nav.getByRole("link", { name: "Промоции" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(
      nav.getByRole("link", { name: "Селекция" }),
    ).not.toHaveAttribute("aria-current", "page");
  });

  test("footer repeats Main navigation, lists Policy pages and About", async ({
    page,
  }) => {
    await page.goto("/");

    const footer = page.getByRole("contentinfo");
    const useful = footer.getByRole("navigation", { name: "Полезни връзки" });
    for (const link of MAIN_NAVIGATION) {
      await expect(
        useful.getByRole("link", { name: link.name, exact: true }),
      ).toHaveAttribute("href", link.href);
    }

    const policies = footer.getByRole("navigation", {
      name: "Информация и Политики",
    });
    for (const policy of POLICIES) {
      await expect(
        policies.getByRole("link", { name: policy.name, exact: true }),
      ).toHaveAttribute("href", policy.href);
    }

    await expect(
      footer.getByRole("link", { name: /Повече за нас/ }),
    ).toHaveAttribute("href", "/about");
    await expect(
      footer.getByRole("link", { name: "Форма за контакти" }),
    ).toHaveAttribute("href", "/contacts");
    await expect(footer.locator('a[href="#"]')).toHaveCount(0);
  });

  test("header and footer show the shop phone and a skip link", async ({
    page,
  }) => {
    await page.goto("/");

    const banner = page.getByRole("banner");
    await expect(
      banner.getByRole("link", { name: /0876473165/ }),
    ).toHaveAttribute("href", "tel:0876473165");
    await expect(
      banner.getByRole("link", { name: "Свържете се с нас" }),
    ).toHaveAttribute("href", "/contacts");
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: /0876473165/ }),
    ).toHaveAttribute("href", "tel:0876473165");

    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Към съдържанието" });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute("href", "#main-content");
  });

  for (const policy of POLICIES) {
    test(`${policy.href} is an indexable Bulgarian Policy page`, async ({
      page,
    }) => {
      await page.goto("/");
      await page
        .getByRole("contentinfo")
        .getByRole("link", { name: policy.name, exact: true })
        .click();

      await expect(page).toHaveURL(new RegExp(`${policy.href}$`));
      await expect(
        page.getByRole("heading", { level: 1, name: policy.name }),
      ).toBeVisible();
      await expect(page).toHaveTitle(policy.name);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        /.+/,
      );
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.getByText(/Последна актуализация/)).toBeVisible();
      await expect(
        page
          .getByRole("navigation", { name: "Всички политики" })
          .getByRole("link", { name: policy.name }),
      ).toHaveAttribute("aria-current", "page");
    });
  }

  test("Delivery & Payment states EUR prices, Speedy and both payment methods", async ({
    page,
  }) => {
    await page.goto("/delivery-and-payment");

    await expect(page.getByText(/в евро \(EUR\)/)).toBeVisible();
    await expect(page.getByText(/със Спиди/).first()).toBeVisible();
    await expect(page.getByText(/Карта чрез Stripe/)).toBeVisible();
    await expect(page.getByText(/Наложен платеж/)).toBeVisible();
  });

  test("About page is reachable from the footer only", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: /Повече за нас/ })
      .click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "За нас" }),
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: "0876473165" }),
    ).toHaveAttribute("href", "tel:0876473165");
    await expect(
      page
        .getByRole("main")
        .getByRole("link", { name: "info@whiskyfinder.bg" }),
    ).toHaveAttribute("href", "mailto:info@whiskyfinder.bg");
  });
});
