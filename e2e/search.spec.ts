import { expect, type Page, test } from "@playwright/test";

const SUGGESTION_KINDS = [
  { label: "Дестилерия", param: /distillery=/ },
  { label: "Държава", param: /country=/ },
  { label: "Регион", param: /region=/ },
] as const;

test.describe("search", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("a query with no match stays an empty suggestion list", async ({
    page,
  }) => {
    await page.goto("/");
    const search = page.getByRole("combobox", { name: "Търсене" });
    await search.fill("zzzzqqqq");

    await expect(page.getByText("Няма съвпадения")).toBeVisible();
    await expect(page.getByRole("option")).toHaveCount(0);

    await search.press("Enter");

    await expect(page).not.toHaveURL(/catalogue/);
    await expect(page.getByText("Няма съвпадения")).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);
  });

  test("Enter on a published Whisky name opens that exact Catalogue filter", async ({
    page,
  }) => {
    await page.goto("/catalogue");

    const emptyCatalogue = page.getByRole("heading", {
      name: "В момента каталогът се обновява",
    });
    const firstName = page.getByRole("article").getByRole("heading").first();
    await expect(firstName.or(emptyCatalogue)).toBeVisible();

    if (await emptyCatalogue.isVisible()) {
      const search = page.getByRole("combobox", { name: "Търсене" });
      await search.fill("zzzzqqqq");
      await expect(page.getByText("Няма съвпадения")).toBeVisible();
      await search.press("Enter");
      await expect(emptyCatalogue).toBeVisible();
      await expect(page.getByRole("article")).toHaveCount(0);
      return;
    }

    const name = (await firstName.innerText()).trim();
    const search = page.getByRole("combobox", { name: "Търсене" });
    await search.fill(name);
    await expect(
      page.getByRole("option", { name: `Уиски: ${name}` }),
    ).toBeVisible();
    await search.press("Enter");

    await expect(page).toHaveURL(/name=/);
    await expect(page).not.toHaveURL(/[?&]q=/);
    await expect(page.getByRole("heading", { name, level: 2 })).toBeVisible();
  });

  test("live Distillery, Country, and Region suggestions open those filters", async ({
    page,
  }) => {
    await page.goto("/catalogue");

    const emptyCatalogue = page.getByRole("heading", {
      name: "В момента каталогът се обновява",
    });
    const firstName = page.getByRole("article").getByRole("heading").first();
    await expect(firstName.or(emptyCatalogue)).toBeVisible();
    if (await emptyCatalogue.isVisible()) {
      await expect(page.getByRole("article")).toHaveCount(0);
      return;
    }

    const name = (await firstName.innerText()).trim();
    const prefix = name.slice(0, 2);
    await openSuggestions(page, prefix);

    for (const kind of SUGGESTION_KINDS) {
      const option = page
        .getByRole("option", { name: new RegExp(`^${kind.label}:`) })
        .first();
      if ((await option.count()) === 0) {
        continue;
      }

      await option.click();
      await expect(page).toHaveURL(kind.param);
      await expect(page.getByRole("article").first()).toBeVisible();
      await openSuggestions(page, prefix);
    }
  });
});

async function openSuggestions(page: Page, query: string) {
  const search = page.getByRole("combobox", { name: "Търсене" });
  await search.fill("");
  await search.fill(query);
  await expect(
    page.getByRole("listbox", { name: "Предложения" }),
  ).toBeVisible();
}
