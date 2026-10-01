import { expect, test } from "@playwright/test";

test.describe("whisky page", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("opening a Catalogue card reaches the Whisky page with a purchase action", async ({
    page,
  }) => {
    await page.goto("/catalogue");

    const whiskyCards = page.getByRole("article");
    const emptyCatalogue = page.getByRole("heading", {
      name: "В момента каталогът се обновява",
    });

    const hasCards = (await whiskyCards.count()) > 0;
    if (!hasCards) {
      await expect(emptyCatalogue).toBeVisible();
      return;
    }

    const firstCard = whiskyCards.first();
    const cardName = await firstCard
      .getByRole("heading", { level: 2 })
      .innerText();
    await firstCard.getByRole("link").click();

    await expect(page).toHaveURL(/\/whiskies\//);
    await expect(
      page.getByRole("heading", { level: 1, name: cardName }),
    ).toBeVisible();

    const addToCart = page.getByRole("button", { name: /Добави в кошницата/i });
    const askUs = page.getByRole("button", { name: "Попитай ни" });
    await expect(addToCart.or(askUs)).toBeVisible();
  });
});
