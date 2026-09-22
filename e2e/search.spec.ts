import { expect, test } from "@playwright/test";

test.describe("search", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("a query with no match shows an honest empty state", async ({
    page,
  }) => {
    await page.goto("/");
    const search = page.getByRole("combobox", { name: "Търсене" });
    await search.fill("zzzzqqqq");

    await expect(page.getByText("Няма съвпадения")).toBeVisible();
    await expect(page.getByRole("option")).toHaveCount(0);

    await search.press("Enter");

    await expect(page).toHaveURL(/q=zzzzqqqq/);
    await expect(
      page.getByRole("heading", {
        name: "Няма открити уискита с избраните филтри",
      }),
    ).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);
  });

  test("selecting a published Whisky name opens that Catalogue filter", async ({
    page,
  }) => {
    await page.goto("/catalogue");

    const emptyCatalogue = page.getByRole("heading", {
      name: "В момента каталогът се обновява",
    });
    const firstName = page.getByRole("article").getByRole("heading").first();
    await expect(firstName.or(emptyCatalogue)).toBeVisible();

    if (await emptyCatalogue.isVisible()) {
      return;
    }

    const name = (await firstName.innerText()).trim();
    const search = page.getByRole("combobox", { name: "Търсене" });
    await search.fill(name);
    await page.getByRole("option", { name: `Уиски: ${name}` }).click();

    await expect(page).toHaveURL(/name=/);
    await expect(page.getByRole("heading", { name, level: 2 })).toBeVisible();
  });
});
