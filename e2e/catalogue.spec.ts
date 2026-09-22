import { expect, test } from "@playwright/test";

test.describe("catalogue", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("Селекция nav opens Catalogue with heading and list or empty state", async ({
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

    const whiskyCards = page.getByRole("article");
    const emptyCatalogue = page.getByRole("heading", {
      name: "В момента каталогът се обновява",
    });
    const emptyFilters = page.getByRole("heading", {
      name: "Няма открити уискита с избраните филтри",
    });

    await expect(
      whiskyCards.or(emptyCatalogue).or(emptyFilters).first(),
    ).toBeVisible();
  });

  test("changing a filter updates the URL", async ({ page }) => {
    await page.goto("/catalogue");

    await page.getByLabel("Произход").selectOption("Irish");
    await expect(page).toHaveURL(/origin=Irish/);
    await expect(page).not.toHaveURL(/page=/);

    await expect(
      page.getByRole("heading", { name: "Селекция", level: 1 }),
    ).toBeVisible();
  });
});
