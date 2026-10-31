import { expect, type Page, test } from "@playwright/test";

const CORE = "CORE · над 50 € до 90 €";
const ENTRY = "ENTRY · до 50 €";

async function answerTasteSteps(page: Page) {
  await page.getByRole("radio", { name: "без", exact: true }).check();
  await page.getByRole("button", { name: "Напред" }).click();
  await page.getByRole("radio", { name: "меко", exact: true }).check();
  await page.getByRole("button", { name: "Напред" }).click();
  await page.getByRole("radio", { name: "сладко", exact: true }).check();
  await page.getByRole("button", { name: "Напред" }).click();
  await page
    .getByRole("radio", {
      name: "тъмни плодове (стафиди, смокини, синя слива)",
    })
    .check();
  await page.getByRole("button", { name: "Напред" }).click();
}

async function runFinder(page: Page, tier?: string) {
  await page.goto("/finder");
  await answerTasteSteps(page);
  if (tier) {
    await page.getByRole("radio", { name: tier }).check();
  }
  await page.getByRole("button", { name: "Покажи препоръки" }).click();
}

function tierRegion(page: Page, label: string) {
  return page.getByRole("region", { name: label, exact: true });
}

test.describe("Finder", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("Home Finder call to action opens the Finder", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /открий вкусовия си профил/i })
      .click();

    await expect(page).toHaveURL(/\/finder$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Открий своето уиски" }),
    ).toBeVisible();
  });

  test("asks Smoke, Intensity, Sweetness, Fruit profile, then an optional Price tier", async ({
    page,
  }) => {
    await page.goto("/finder");

    const next = page.getByRole("button", { name: "Напред" });
    for (const [title, choice] of [
      ["Опушеност", "без"],
      ["Интензивност", "меко"],
      ["Сладост", "сладко"],
      ["Плодов профил", "баланс между двете"],
    ]) {
      await expect(page.getByText(new RegExp(`· ${title}$`))).toBeVisible();
      await expect(next).toBeDisabled();
      await page.getByRole("radio", { name: choice, exact: true }).check();
      await next.click();
    }

    await expect(page.getByText(/Стъпка 5 от 5 · Ценови клас/)).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Без значение" }),
    ).toBeChecked();
    await expect(
      page.getByRole("button", { name: "Покажи препоръки" }),
    ).toBeEnabled();

    await page.getByRole("button", { name: "Назад" }).click();
    await expect(
      page.getByRole("radio", { name: "баланс между двете" }),
    ).toBeChecked();
  });

  test("shows AI-ordered Catalogue Whiskies, three per Price tier, with Buy and Ask us from Shop data", async ({
    page,
  }) => {
    await runFinder(page);

    await expect(
      page.getByRole("heading", { name: "Препоръки за вас" }),
    ).toBeVisible();

    const core = tierRegion(page, CORE);
    await expect(core.getByRole("heading", { level: 4 })).toHaveText([
      "Fixture Ask Bottle",
      "Fixture Buy Bottle",
    ]);
    const cards = core.getByRole("article");
    await expect(cards.nth(0).getByText("Попитай ни")).toBeVisible();
    await expect(cards.nth(1).getByText("Купи")).toBeVisible();
    await expect(
      cards.nth(1).getByText("Стафиди и смокини без опушеност"),
    ).toBeVisible();

    const entry = tierRegion(page, ENTRY);
    await expect(entry.getByRole("heading", { level: 4 })).toHaveText([
      "Fixture Whisky 03",
      "Fixture Partial Editorial",
      "Fixture Whisky 01",
    ]);

    await expect(page.getByText("Fixture Whisky 02")).toHaveCount(0);
    await expect(page.getByText("Fixture Draft Bottle")).toHaveCount(0);
    await expect(page.getByText("Не е в каталога.")).toHaveCount(0);
  });

  test("results show no scores, percentages, or sources", async ({ page }) => {
    await runFinder(page);

    const results = page.getByRole("article");
    await expect(results).toHaveCount(5);
    for (const card of await results.all()) {
      await expect(card.getByText(/%|https?:|whiskybase/i)).toHaveCount(0);
      await expect(card.getByRole("link")).toHaveAttribute(
        "href",
        /^\/whiskies\//,
      );
    }
  });

  test("a chosen Price tier drops Whiskies from other tiers", async ({
    page,
  }) => {
    await runFinder(page, CORE);

    await expect(tierRegion(page, CORE).getByRole("article")).toHaveCount(2);
    await expect(tierRegion(page, ENTRY)).toHaveCount(0);
    await expect(page.getByRole("article")).toHaveCount(2);
  });

  test("an empty AI ranking shows an honest empty state", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-finder-fixture": "empty" });
    await runFinder(page);

    await expect(
      page.getByRole("heading", { name: "Не открихме подходящо уиски" }),
    ).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);
  });

  for (const fixture of ["http-error", "malformed", "invalid-ids"]) {
    test(`${fixture} research shows a retryable error and never fallback results`, async ({
      page,
    }) => {
      await page.setExtraHTTPHeaders({ "x-finder-fixture": fixture });
      await runFinder(page);

      await expect(
        page.getByRole("heading", {
          name: "Finder не успя да завърши проучването",
        }),
      ).toBeVisible();
      await expect(page.getByRole("article")).toHaveCount(0);

      await page.setExtraHTTPHeaders({ "x-finder-fixture": "ranked" });
      await page.getByRole("button", { name: "Опитай отново" }).click();
      await expect(
        page.getByRole("heading", { name: "Препоръки за вас" }),
      ).toBeVisible();
      await expect(page.getByRole("article")).toHaveCount(5);
    });
  }

  test("a Catalogue load failure shows the retryable error", async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ "x-shop-fixture": "error" });
    await runFinder(page);

    await expect(
      page.getByRole("heading", {
        name: "Finder не успя да завърши проучването",
      }),
    ).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);
  });

  test("guest history lasts for the browser session only", async ({
    page,
    browser,
  }) => {
    await runFinder(page);
    await expect(
      page.getByRole("heading", { name: "Препоръки за вас" }),
    ).toBeVisible();

    const history = page.getByRole("region", {
      name: "История от тази сесия",
    });
    await expect(
      history.getByRole("link", { name: "Fixture Ask Bottle" }),
    ).toBeVisible();

    await page.reload();
    await expect(
      history.getByRole("link", { name: "Fixture Ask Bottle" }),
    ).toBeVisible();
    expect(
      await page.evaluate(() =>
        window.localStorage.getItem("whiskyfinder.finderHistory"),
      ),
    ).toBeNull();

    const freshContext = await browser.newContext({
      baseURL: test.info().project.use.baseURL,
    });
    const freshPage = await freshContext.newPage();
    await freshPage.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
    await freshPage.goto("/finder");
    await expect(
      freshPage.getByRole("button", { name: "Напред" }),
    ).toBeVisible();
    await expect(
      freshPage.getByRole("region", { name: "История от тази сесия" }),
    ).toHaveCount(0);
    await freshContext.close();

    await page.getByRole("button", { name: "Изчисти историята" }).click();
    await expect(history).toHaveCount(0);
  });
});
