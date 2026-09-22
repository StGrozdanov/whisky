import { expect, type Page, test } from "@playwright/test";

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
    const name = await firstPublishedWhiskyName(page);
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

  test("a Distillery suggestion from a published Whisky opens that filter", async ({
    page,
  }) => {
    const name = await firstPublishedWhiskyName(page);
    const option = await findDistilleryOption(page, name);
    const distillery = (await option.innerText()).trim();
    await option.click();

    await expect
      .poll(() => new URL(page.url()).searchParams.get("distillery"))
      .toBe(distillery);
    await expect(page.getByRole("article").first()).toBeVisible();
  });
});

async function firstPublishedWhiskyName(page: Page): Promise<string> {
  await page.goto("/catalogue");

  const emptyCatalogue = page.getByRole("heading", {
    name: "В момента каталогът се обновява",
  });
  const firstName = page.getByRole("article").getByRole("heading").first();
  await expect(firstName.or(emptyCatalogue)).toBeVisible();
  await expect(
    emptyCatalogue,
    "Search navigation e2e needs at least one published Whisky",
  ).toHaveCount(0);

  return (await firstName.innerText()).trim();
}

async function findDistilleryOption(page: Page, whiskyName: string) {
  const queries = [
    whiskyName,
    ...whiskyName.split(/\s+/).filter((part) => part.trim().length >= 2),
  ];

  for (const query of queries) {
    await openSuggestions(page, query.trim());
    const option = page.getByRole("option", { name: /^Дестилерия:/ }).first();
    if ((await option.count()) > 0) {
      return option;
    }
  }

  throw new Error(
    `No Distillery suggestion found from published Whisky "${whiskyName}"`,
  );
}

async function openSuggestions(page: Page, query: string) {
  const search = page.getByRole("combobox", { name: "Търсене" });
  await search.fill("");
  await search.fill(query);
  await expect(
    page.getByRole("listbox", { name: "Предложения" }),
  ).toBeVisible();
}
