import { expect, test } from "@playwright/test";

test.describe("search", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("suggestions stay closed until the second character", async ({
    page,
  }) => {
    await page.goto("/");
    const search = page.getByRole("combobox", { name: "Търсене" });
    await search.fill("Б");
    await page.waitForTimeout(500);
    await expect(
      page.getByRole("listbox", { name: "Предложения" }),
    ).toHaveCount(0);
  });

  test("selecting a Whisky opens the Catalogue on that full name", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("combobox", { name: "Търсене" }).fill("Buy");
    await page
      .getByRole("option", { name: "Уиски: Fixture Buy Bottle" })
      .click();

    await expect(page).toHaveURL(/name=Fixture(\+|%20)Buy(\+|%20)Bottle/);
    await expect(
      page.getByRole("heading", { name: "Fixture Buy Bottle", level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fixture Ask Bottle", level: 2 }),
    ).toHaveCount(0);
  });

  test("selecting a Distillery, Country, or Region opens that Catalogue filter", async ({
    page,
  }) => {
    await page.goto("/");
    const search = page.getByRole("combobox", { name: "Търсене" });

    await search.fill("Buy Distillery");
    await page
      .getByRole("option", { name: "Дестилерия: Buy Distillery" })
      .click();
    await expect(page).toHaveURL(/distillery=Buy(\+|%20)Distillery/);
    await expect(
      page.getByRole("heading", { name: "Fixture Buy Bottle", level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fixture Ask Bottle", level: 2 }),
    ).toHaveCount(0);

    await search.fill("Шот");
    await page.getByRole("option", { name: "Държава: Шотландия" }).click();
    await expect(page).toHaveURL(/country=/);
    await expect(
      page.getByRole("heading", { name: "Fixture Buy Bottle", level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fixture Draft Bottle", level: 2 }),
    ).toHaveCount(0);

    await search.fill("Spey");
    await page.getByRole("option", { name: "Регион: Speyside" }).click();
    await expect(page).toHaveURL(/region=Speyside/);
    await expect(
      page.getByRole("heading", { name: "Fixture Buy Bottle", level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fixture Ask Bottle", level: 2 }),
    ).toHaveCount(0);
  });

  test("no match shows an honest empty state and Enter does not invent cards", async ({
    page,
  }) => {
    await page.goto("/");
    const search = page.getByRole("combobox", { name: "Търсене" });
    await search.fill("zzzzqqqq");

    await expect(page.getByText("Няма съвпадения")).toBeVisible();
    await expect(page.getByRole("option")).toHaveCount(0);
    await expect(page.getByRole("article")).toHaveCount(0);

    await search.press("Enter");

    await expect(page).toHaveURL(/q=zzzzqqqq/);
    await expect(
      page.getByRole("heading", {
        name: "Няма открити уискита с избраните филтри",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fixture Buy Bottle", level: 2 }),
    ).toHaveCount(0);
  });
});
