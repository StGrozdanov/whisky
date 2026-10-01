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
    await expect(
      page.getByRole("img", { name: cardName }).first(),
    ).toBeVisible();
    await expect(page.getByText("Държава")).toBeVisible();
    await expect(page.getByText("Отлежаване")).toBeVisible();
    await expect(page.getByText("Алкохол")).toBeVisible();

    const addToCart = page.getByRole("button", {
      name: /Добави в кошницата/i,
    });
    const buyNow = page.getByRole("button", { name: "Купи сега" });
    const askUs = page.getByRole("button", { name: "Попитай ни", exact: true });
    if ((await addToCart.count()) > 0) {
      await expect(addToCart).toBeVisible();
      await expect(buyNow).toBeVisible();
      await expect(askUs).toHaveCount(0);
    } else {
      await expect(askUs).toBeVisible();
      await expect(buyNow).toHaveCount(0);
      await expect(addToCart).toHaveCount(0);
    }

    const pairings = page.getByRole("heading", {
      name: "С какво се комбинира перфектно",
    });
    if ((await pairings.count()) === 0) {
      await expect(pairings).toHaveCount(0);
    } else {
      await expect(
        page.locator("section").filter({ has: pairings }).getByRole("article"),
      ).not.toHaveCount(0);
    }
  });

  test("an unknown Whisky URL is unavailable", async ({ page }) => {
    await page.goto("/whiskies/00000000-0000-0000-0000-000000000000");
    await expect(
      page.getByRole("heading", { name: "Това уиски не е налично" }),
    ).toBeVisible();
  });
});
