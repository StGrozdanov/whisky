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

    await page.getByRole("button", { name: "Над 18 съм" }).click();
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

    await expect(
      page.getByRole("banner").getByText("WHISKY FINDER"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /0876473165/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Безплатна доставка за цялата страна при поръчки над 50,00 €",
      ),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "GlenAllachie 12" }),
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
    await expect(footer.getByText("info@whiskyfinder.bg")).toBeVisible();
    await expect(
      footer.getByText("Доставка със Спиди в цялата страна"),
    ).toBeVisible();
    await expect(footer.getByText(/© 2026 whiskyfinder.bg/)).toBeVisible();
  });
});
