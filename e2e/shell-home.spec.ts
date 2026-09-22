import { expect, test } from "@playwright/test";

test.describe("shell and home", () => {
  test("first visit shows 18+ splash; confirming remembers it", async ({
    page,
  }) => {
    await page.goto("/");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Потвърдете, че сте навършили 18 години",
      }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Да" }).click();
    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("home renders inside the shell without requiring named catalogue data", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });

    await page.goto("/");

    const banner = page.getByRole("banner");
    await expect(banner.getByText("WHISKY FINDER")).toBeVisible();
    await expect(
      banner.getByRole("link", { name: /0888888888/ }),
    ).toHaveAttribute("href", "tel:0888888888");
    await expect(
      banner.getByText(
        "Безплатна доставка за цялата страна при поръчки над 50,00 €",
      ),
    ).toBeVisible();
    await expect(
      banner.getByRole("link", { name: "Запитване за наличност" }),
    ).toHaveAttribute("href", "/contacts");
    await expect(
      banner.getByRole("searchbox", { name: "Търсене" }),
    ).toBeVisible();
    await expect(
      banner.getByPlaceholder("Търси дестилерия, нотка..."),
    ).toBeVisible();
    await expect(banner.getByRole("button", { name: "Любими" })).toBeVisible();
    await expect(banner.getByRole("button", { name: "Количка" })).toBeVisible();
    await expect(banner.getByRole("button", { name: "Акаунт" })).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Стани клубен член и отключи ексклузивни привилегии",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Стани клубен член" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Открий своето идеално уиски за под 60 секунди",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "открий вкусовия си профил" }),
    ).toBeVisible();

    const footer = page.getByRole("contentinfo");
    await expect(
      footer.getByRole("link", { name: /0888888888/ }),
    ).toHaveAttribute("href", "tel:0888888888");
    await expect(footer.getByText("info@whiskyfinder.bg")).toBeVisible();
    await expect(
      footer.getByText("Доставка със Спиди в цялата страна"),
    ).toBeVisible();
    await expect(footer.getByText(/© 2026 whiskyfinder.bg/)).toBeVisible();
  });
});
