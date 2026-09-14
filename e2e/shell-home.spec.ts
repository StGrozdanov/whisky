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

  test("home renders inside the shell with House pick and Finder CTA", async ({
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
      page.getByRole("heading", { name: "GlenAllachie 12", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText(/УИСКИ НА МЕСЕЦА/)).toBeVisible();
    await expect(
      page.getByText(
        "Сърцето на възродената дестилерия от мастър-дистилър Били Уокър",
      ),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Стани клубен член и отключи ексклузивни привилегии",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Стани клубен член" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Уискита в магазина" }),
    ).toBeVisible();
    await expect(page.getByText("Redbreast 12")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Открий своето идеално уиски" }),
    ).toBeVisible();

    const footer = page.getByRole("contentinfo");
    await expect(
      footer.getByRole("link", { name: /0888888888/ }),
    ).toHaveAttribute("href", "tel:0888888888");
    await expect(footer.getByText("info@whiskyfinder.bg")).toBeVisible();
    await expect(
      footer.getByRole("button", { name: "Facebook" }),
    ).toBeVisible();
    await expect(
      footer.getByRole("button", { name: "Instagram" }),
    ).toBeVisible();
    await expect(footer.getByRole("button", { name: "TikTok" })).toBeVisible();
    await expect(
      footer.getByRole("button", { name: "YouTube" }),
    ).toBeVisible();
    await expect(
      footer.getByText("Доставка със Спиди в цялата страна"),
    ).toBeVisible();
    await expect(footer.getByText(/© 2026 whiskyfinder.bg/)).toBeVisible();
  });
});
