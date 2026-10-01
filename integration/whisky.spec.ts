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
      page.getByRole("button", { name: "Попитай ни" }),
    ).toBeVisible();
  });

  test("Home new-whisky card opens the Whisky page", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Fixture Buy Bottle/i })
      .first()
      .click();

    await expect(page).toHaveURL(/\/whiskies\/buy$/);
  });
});
