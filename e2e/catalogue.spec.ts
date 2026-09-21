import { expect, test } from "@playwright/test";

test.describe("catalogue", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("Селекция nav opens Catalogue with A–Z published Whiskies", async ({
    page,
  }) => {
    await page.goto("/");

    const banner = page.getByRole("banner");
    await expect(banner.getByRole("link", { name: "Селекция" })).toBeVisible();
    await banner.getByRole("link", { name: "Селекция" }).click();

    await expect(page).toHaveURL(/\/catalogue/);
    await expect(
      page.getByRole("heading", { name: "Селекция", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText("Подредени по азбучен ред (A — Z)"),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Aberlour 12 Y.O.", level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Draft Speyside Reserve" }),
    ).toHaveCount(0);
  });

  test("filters and page state are preserved in the URL", async ({ page }) => {
    await page.goto("/catalogue");

    await page.getByLabel("Произход").selectOption("Irish");
    await expect(page).toHaveURL(/origin=Irish/);
    await expect(page).not.toHaveURL(/page=/);

    await expect(
      page.getByRole("heading", { name: "Redbreast 12", level: 2 }),
    ).toBeVisible();

    await page.goto("/catalogue?page=2");
    await expect(page.getByText(/Стр\. 2 от/)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Aberlour 12 Y.O.", level: 2 }),
    ).toHaveCount(0);
  });

  test("shows Buy and Ask us actions from Availability", async ({ page }) => {
    await page.goto("/catalogue");

    await expect(
      page
        .getByRole("article")
        .filter({ has: page.getByRole("heading", { name: "GlenAllachie 12" }) })
        .getByRole("button", { name: "Купи" }),
    ).toBeVisible();

    await expect(
      page
        .getByRole("article")
        .filter({ has: page.getByRole("heading", { name: "Eagle Rare 10" }) })
        .getByRole("button", { name: "Попитай ни" }),
    ).toBeVisible();
  });

  test("empty filter state offers clear filters", async ({ page }) => {
    await page.goto("/catalogue?tier=PREMIUM");

    await expect(
      page.getByRole("heading", {
        name: "Няма открити уискита с избраните филтри",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Изчисти филтрите" }),
    ).toBeVisible();
  });
});
