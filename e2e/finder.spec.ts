import { expect, test } from "@playwright/test";

// Live OpenRouter research can take most of a minute.
const RESEARCH_TIMEOUT = 90_000;

test.describe("Finder", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("a guest run shows Catalogue recommendations, an honest empty state, or an honest retryable error", async ({
    page,
  }) => {
    test.setTimeout(RESEARCH_TIMEOUT + 30_000);

    await page.goto("/finder");
    await expect(
      page.getByRole("heading", { level: 1, name: "Открий своето уиски" }),
    ).toBeVisible();

    for (const choice of ["средно", "балансирано", "сладко"]) {
      await page.getByRole("radio", { name: choice, exact: true }).check();
      await page.getByRole("button", { name: "Напред" }).click();
    }
    await page
      .getByRole("radio", { name: "баланс между двете", exact: true })
      .check();
    await page.getByRole("button", { name: "Напред" }).click();
    await page.getByRole("button", { name: "Покажи препоръки" }).click();

    const results = page.getByRole("heading", { name: "Препоръки за вас" });
    const empty = page.getByRole("heading", {
      name: "Не открихме подходящо уиски",
    });
    const failed = page.getByRole("heading", {
      name: "Finder не успя да завърши проучването",
    });
    await expect(results.or(empty).or(failed).first()).toBeVisible({
      timeout: RESEARCH_TIMEOUT,
    });

    if (await failed.isVisible()) {
      await expect(page.getByRole("article")).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Опитай отново" }),
      ).toBeVisible();
      return;
    }

    const history = page.getByRole("region", {
      name: "История от тази сесия",
    });
    await expect(history).toBeVisible();

    if (await empty.isVisible()) {
      await expect(page.getByRole("article")).toHaveCount(0);
      return;
    }

    const tierRegions = page
      .getByRole("region")
      .filter({ has: page.getByRole("heading", { level: 3 }) });
    const tierCount = await tierRegions.count();
    expect(tierCount).toBeGreaterThan(0);
    for (let index = 0; index < tierCount; index += 1) {
      const cards = tierRegions.nth(index).getByRole("article");
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(3);
    }

    for (const card of await page.getByRole("article").all()) {
      await expect(card.getByRole("link")).toHaveAttribute(
        "href",
        /^\/whiskies\//,
      );
      await expect(
        card
          .getByText("Купи", { exact: true })
          .or(card.getByText("Попитай ни", { exact: true })),
      ).toBeVisible();
      await expect(card.getByText(/https?:\/\//)).toHaveCount(0);
    }
  });
});
