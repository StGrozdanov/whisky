import { expect, type Page, test } from "@playwright/test";

function cardFor(page: Page, name: string) {
  return page.getByRole("article").filter({
    has: page.getByRole("heading", { name, exact: true }),
  });
}

test.describe("guest discovery pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("Promotions show regular, discounted, and prior prices for active Promotions only", async ({
    page,
  }) => {
    await page.goto("/promotions");

    await expect(
      page.getByRole("heading", { level: 1, name: "Промоции" }),
    ).toBeVisible();

    const buy = cardFor(page, "Fixture Buy Bottle");
    await expect(buy.getByText("49.90 €", { exact: true })).toBeVisible();
    await expect(buy.getByText("Редовна цена")).toBeVisible();
    await expect(buy.getByText("55.20 €", { exact: true })).toBeVisible();
    await expect(
      buy.getByText("Най-ниска цена за последните 30 дни"),
    ).toBeVisible();
    await expect(buy.getByText("54.00 €", { exact: true })).toBeVisible();
    await expect(buy.getByText("Валидна до 31 декември 2099 г.")).toBeVisible();
    await expect(buy.getByRole("link", { name: /Купи/ })).toBeVisible();

    await expect(
      cardFor(page, "Fixture Ask Bottle").getByRole("link", {
        name: /Попитай ни/,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Fixture Partial Editorial" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Fixture Draft Bottle" }),
    ).toHaveCount(0);
  });

  for (const path of ["/catalogue", "/gifts", "/awards"]) {
    test(`${path} Whisky cards show the active Promotion`, async ({ page }) => {
      await page.goto(path);

      const buy = cardFor(page, "Fixture Buy Bottle");
      await expect(buy.getByText("-8%")).toBeVisible();
      await expect(buy.getByText("Промоционална цена")).toBeVisible();
      await expect(buy.getByText("49.90 €", { exact: true })).toBeVisible();
      await expect(buy.getByText("54.00 €", { exact: true })).toBeVisible();
      await expect(buy.getByText("55.20 €", { exact: true })).toBeVisible();
    });
  }

  test("Catalogue cards without a Promotion show only the regular price", async ({
    page,
  }) => {
    await page.goto("/catalogue");

    const partial = cardFor(page, "Fixture Partial Editorial");
    await expect(partial.getByText("Цена", { exact: true })).toBeVisible();
    await expect(partial.getByText("Промоционална цена")).toHaveCount(0);
  });

  test("Home shows only Promotions the Shopkeeper selected and links to all", async ({
    page,
  }) => {
    await page.goto("/");

    const rail = page.getByRole("region", { name: "Специални Оферти" });
    await expect(rail.getByText("Fixture Buy Bottle")).toBeVisible();
    await expect(rail.getByText("Fixture Ask Bottle")).toHaveCount(0);
    await expect(rail.getByText("Fixture Partial Editorial")).toHaveCount(0);
    await expect(rail.getByText("Редовна цена")).toBeVisible();

    await rail.getByRole("link", { name: "Всички промоции" }).click();
    await expect(page).toHaveURL(/\/promotions$/);
  });

  test("Gifts list selected Whiskies and Packs and hide drafts", async ({
    page,
  }) => {
    await page.goto("/gifts");

    await expect(
      page.getByRole("heading", { level: 1, name: "Подаръци" }),
    ).toBeVisible();
    await expect(
      cardFor(page, "Fixture Buy Bottle").getByRole("link", { name: /Купи/ }),
    ).toBeVisible();
    await expect(
      cardFor(page, "Fixture Pack In Stock").getByRole("button", {
        name: /Поръчай Сет/,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fixture Draft Bottle" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Fixture Ask Bottle" }),
    ).toHaveCount(0);
    await expect(
      cardFor(page, "Fixture Pack Sold Out").getByRole("button", {
        name: "Попитай ни",
      }),
    ).toBeVisible();
  });

  test("Discovery Packs are sold by their own quantity", async ({ page }) => {
    await page.goto("/packs");

    await expect(
      cardFor(page, "Fixture Pack In Stock").getByRole("button", {
        name: /Поръчай Сет/,
      }),
    ).toBeVisible();

    const soldOut = cardFor(page, "Fixture Pack Sold Out");
    await expect(
      soldOut.getByRole("button", { name: "Попитай ни" }),
    ).toBeVisible();
    await expect(
      soldOut.getByRole("button", { name: /Поръчай Сет/ }),
    ).toHaveCount(0);
  });

  test("Award page lists published Whiskies with Awards", async ({ page }) => {
    await page.goto("/awards");

    await expect(
      page.getByRole("heading", { level: 1, name: "Наградени уискита" }),
    ).toBeVisible();
    await expect(
      cardFor(page, "Fixture Buy Bottle").getByText("Златен медал"),
    ).toBeVisible();
    await expect(
      cardFor(page, "Fixture Buy Bottle").getByText(/Single Malt/),
    ).toBeVisible();
    await expect(
      cardFor(page, "Fixture Ask Bottle").getByRole("link", {
        name: /Попитай ни/,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fixture Partial Editorial" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Fixture Draft Bottle" }),
    ).toHaveCount(0);
  });

  test("Club landing describes the v1 membership", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Научи повече за Клуба/ }).click();

    await expect(page).toHaveURL(/\/club$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Whisky Finder Клуб" }),
    ).toBeVisible();
    await expect(page.getByText("60.00 €", { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        "Плаща се еднократно с карта и не се подновява автоматично.",
      ),
    ).toBeVisible();
    await expect(page.getByText("5% клубна цена")).toBeVisible();
    await expect(page.getByText("Безплатна клубна бутилка")).toBeVisible();
  });

  for (const { path, heading } of [
    { path: "/promotions", heading: "Няма активни промоции" },
    { path: "/gifts", heading: "Подборката от подаръци се обновява" },
    { path: "/packs", heading: "Няма налични Discovery сетове" },
    { path: "/awards", heading: "Няма наградени уискита" },
  ]) {
    test(`${path} shows an honest empty state`, async ({ page }) => {
      await page.setExtraHTTPHeaders({ "x-shop-fixture": "empty" });
      await page.goto(path);

      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
      await expect(page.getByRole("article")).toHaveCount(0);
      await expect(
        page.getByRole("link", { name: "Към селекцията" }),
      ).toBeVisible();
    });

    test(`${path} shows a retryable error when loading fails`, async ({
      page,
    }) => {
      await page.setExtraHTTPHeaders({ "x-shop-fixture": "error" });
      await page.goto(path);

      await expect(
        page.getByRole("heading", {
          name: "Възникна временна грешка при зареждане",
        }),
      ).toBeVisible();
      await expect(page.getByRole("article")).toHaveCount(0);

      await page.setExtraHTTPHeaders({ "x-shop-fixture": "mixed" });
      await page.getByRole("button", { name: "Опитай отново" }).click();
      await expect(page.getByRole("article").first()).toBeVisible();
    });
  }
});
