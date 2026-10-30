import { expect, test } from "@playwright/test";

test.describe("guest discovery pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  for (const { path, heading, empty } of [
    {
      path: "/promotions",
      heading: "Промоции",
      empty: "Няма активни промоции",
    },
    {
      path: "/gifts",
      heading: "Подаръци",
      empty: "Подборката от подаръци се обновява",
    },
    {
      path: "/packs",
      heading: "Discovery сетове",
      empty: "Няма налични Discovery сетове",
    },
    {
      path: "/awards",
      heading: "Наградени уискита",
      empty: "Няма наградени уискита",
    },
  ]) {
    test(`${path} renders live entries or an honest empty state`, async ({
      page,
    }) => {
      await page.goto(path);

      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("article")
          .or(page.getByRole("heading", { name: empty }))
          .first(),
      ).toBeVisible();
    });
  }

  test("every live Promotion card names its prior and regular price", async ({
    page,
  }) => {
    await page.goto("/promotions");

    const cards = page.getByRole("article");
    const count = await cards.count();
    for (let index = 0; index < count; index += 1) {
      const card = cards.nth(index);
      await expect(
        card.getByText("Най-ниска цена за последните 30 дни"),
      ).toBeVisible();
      await expect(card.getByText("Редовна цена")).toBeVisible();
    }
  });

  test("Club landing states the membership price and term", async ({
    page,
  }) => {
    await page.goto("/club");

    await expect(
      page.getByRole("heading", { level: 1, name: "Whisky Finder Клуб" }),
    ).toBeVisible();
    await expect(page.getByText("60.00 €")).toBeVisible();
    await expect(page.getByText("за 12 месеца")).toBeVisible();
  });
});
