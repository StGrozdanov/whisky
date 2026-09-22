import { expect, test } from "@playwright/test";

test.describe("catalogue fixtures", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("empty catalogue shows the honest empty state", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-shop-fixture": "empty" });
    await page.goto("/catalogue");

    await expect(
      page.getByRole("heading", { name: "Селекция", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "В момента каталогът се обновява",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Към началото" }),
    ).toBeVisible();
  });

  test("filter with no matches offers clear filters", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-shop-fixture": "mixed" });
    await page.goto("/catalogue?origin=Japanese");

    await expect(
      page.getByRole("heading", {
        name: "Няма открити уискита с избраните филтри",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Изчисти филтрите" }),
    ).toBeVisible();
  });

  test("shows Buy and Ask us from fixture Availability", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-shop-fixture": "mixed" });
    await page.goto("/catalogue");

    await expect(
      page
        .getByRole("article")
        .filter({
          has: page.getByRole("heading", { name: "Fixture Buy Bottle" }),
        })
        .getByRole("button", { name: "Купи" }),
    ).toBeVisible();

    await expect(
      page
        .getByRole("article")
        .filter({
          has: page.getByRole("heading", { name: "Fixture Ask Bottle" }),
        })
        .getByRole("button", { name: "Попитай ни" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Fixture Draft Bottle" }),
    ).toHaveCount(0);
  });

  test("paginates past the first page of fixture Whiskies", async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ "x-shop-fixture": "mixed" });
    await page.goto("/catalogue?page=2");

    await expect(page.getByText(/Стр\. 2 от/)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fixture Whisky 25", level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fixture Buy Bottle", level: 2 }),
    ).toHaveCount(0);
  });

  test("retryable error page renders when the catalogue load fails", async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ "x-shop-fixture": "error" });
    await page.goto("/catalogue");

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
