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
      page.getByText("46.0% ABV • Нестудено филтрирано"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Стоян Грозданов" }),
    ).toBeVisible();
    await expect(page.getByText("9.3 / 10")).toBeVisible();
    await expect(page.getByText("55.20 €")).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "GlenAllachie 12" })
        .getByRole("button", { name: "Купи" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Пусни видео" })).toHaveCount(
      0,
    );

    await expect(
      page.getByRole("heading", {
        name: "Стани клубен член и отключи ексклузивни привилегии",
      }),
    ).toBeVisible();
    await expect(page.getByText("5% отстъпка")).toBeVisible();
    await expect(
      page.getByText("Безплатна клубна бутилка уиски"),
    ).toBeVisible();
    await expect(
      page.getByText("Преференциален ранен достъп до нови бутилки"),
    ).toBeVisible();
    await expect(page.getByText("Специални клубни оферти")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Стани клубен член" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Специални Оферти" }),
    ).toBeVisible();
    await expect(page.getByText("Arran 10 Year Old")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Предишни оферти" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Следващи оферти" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Нови уискита" }),
    ).toBeVisible();
    await expect(page.getByText("Springbank 10 Y.O. (2025)")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Предишни нови уискита" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Следващи нови уискита" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "50ml Discovery Сетове" }),
    ).toBeVisible();
    await expect(page.getByText("Шери срещу Торф (3 x 50ml)")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Предишни discovery сетове" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Следващи discovery сетове" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Открий своето идеално уиски за под 60 секунди",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Трябват ни 5 кратки въпроса, относно вкусовия ви профил"),
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
      footer.getByRole("button", { name: "Facebook" }),
    ).toBeVisible();
    await expect(
      footer.getByRole("button", { name: "Instagram" }),
    ).toBeVisible();
    await expect(footer.getByRole("button", { name: "TikTok" })).toBeVisible();
    await expect(footer.getByRole("button", { name: "YouTube" })).toBeVisible();
    await expect(
      footer.getByText("Доставка със Спиди в цялата страна"),
    ).toBeVisible();
    await expect(footer.getByText(/© 2026 whiskyfinder.bg/)).toBeVisible();
  });
});
