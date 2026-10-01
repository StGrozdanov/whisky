import { expect, test } from "@playwright/test";

test.describe("whisky page fixtures", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("complete fixture Whisky shows editorial sections and stepper total", async ({
    page,
  }) => {
    await page.goto("/whiskies/buy");

    await expect(page).toHaveURL(/\/whiskies\/buy$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Fixture Buy Bottle" }),
    ).toBeVisible();
    await expect(
      page.getByText("Отличия и международни награди"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Ревю: Fixture Buy Bottle" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "С какво се комбинира перфектно",
      }),
    ).toBeVisible();
    await expect(page.getByText("Fixture Discovery Set")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Добави в кошницата • 55.20 €" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Купи сега" })).toBeVisible();
    await expect(page.getByText("Държава")).toBeVisible();
    await expect(page.getByText("Шотландия")).toHaveCount(2);
    await expect(page.getByText("Регион")).toBeVisible();
    await expect(page.getByText("Speyside")).toHaveCount(2);
    await expect(page.getByText("12 Години")).toBeVisible();
    await expect(page.getByText("46.0% Vol.")).toBeVisible();
    await expect(page.getByText("Natural / Non-Chill")).toBeVisible();
    await expect(page.getByText("9.3/10")).toBeVisible();
    await expect(page.getByRole("button", { name: /700 мл/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /50 мл/ })).toBeVisible();
    await expect(page.getByText("Фронтален")).toBeVisible();
    await expect(page.getByText("Отличен малц за тестове.")).toBeVisible();
    await expect(page.getByText("TIER")).toHaveCount(0);

    await page.getByRole("button", { name: "Увеличи количеството" }).click();
    await expect(
      page.getByRole("button", { name: "Добави в кошницата • 110.40 €" }),
    ).toBeVisible();
  });

  test("partial fixture Whisky omits optional editorial blocks", async ({
    page,
  }) => {
    await page.goto("/whiskies/partial");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Fixture Partial Editorial",
      }),
    ).toBeVisible();
    await expect(page.getByText("Отличия и международни награди")).toHaveCount(
      0,
    );
    await expect(page.getByText("Ревю:")).toHaveCount(0);
    await expect(page.getByText("Fixture Discovery Set")).toHaveCount(0);
    await expect(page.getByText("Цвят / Филтрация")).toHaveCount(0);
    await expect(page.getByText("9.3/10")).toHaveCount(0);
    await expect(page.getByText("Дегустации от членове")).toHaveCount(0);
    await expect(page.getByText("Регион")).toHaveCount(0);
    await expect(page.getByText("Държава")).toBeVisible();
    await expect(page.getByText("40.0% Vol.")).toBeVisible();
    await expect(page.getByText("NAS")).toBeVisible();
  });

  test("draft and unknown Whisky URLs show not-found", async ({ page }) => {
    await page.goto("/whiskies/draft");
    await expect(
      page.getByRole("heading", { name: "Това уиски не е налично" }),
    ).toBeVisible();

    await page.goto("/whiskies/unknown-id");
    await expect(
      page.getByRole("heading", { name: "Това уиски не е налично" }),
    ).toBeVisible();
  });

  test("Catalogue card opens the Whisky page", async ({ page }) => {
    await page.goto("/catalogue");
    await page
      .getByRole("link", { name: /Fixture Buy Bottle/i })
      .first()
      .click();

    await expect(page).toHaveURL(/\/whiskies\/buy$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Fixture Buy Bottle" }),
    ).toBeVisible();
  });

  test("ask-us fixture Whisky shows Попитай ни on the purchase panel", async ({
    page,
  }) => {
    await page.goto("/whiskies/ask");

    await expect(
      page.getByRole("heading", { level: 1, name: "Fixture Ask Bottle" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Попитай ни", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Купи сега" })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("button", { name: /Добави в кошницата/ }),
    ).toHaveCount(0);
  });

  test("Home new-whisky card opens the Whisky page", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Fixture Buy Bottle/i })
      .first()
      .click();

    await expect(page).toHaveURL(/\/whiskies\/buy$/);
  });

  test("retryable error page renders when the Whisky load fails", async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ "x-shop-fixture": "error" });
    await page.goto("/whiskies/buy");

    await expect(
      page.getByRole("heading", {
        name: "Възникна временна грешка при зареждане",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Опитай отново" }),
    ).toBeVisible();
  });
});
