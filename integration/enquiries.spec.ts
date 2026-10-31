import { expect, type Page, test } from "@playwright/test";

const FIXTURE_UNSUBSCRIBE_TOKEN = "0f1e2d3c-4b5a-4987-8776-655443322110";

function uniqueEmail(label: string): string {
  return `${label}-${Date.now()}-${Math.round(Math.random() * 1e6)}@example.com`;
}

async function fillContactForm(
  page: Page,
  fields: { name: string; email: string; subject: string; message: string },
) {
  const form = page.getByRole("form", { name: "Форма за контакти" });
  await form
    .getByRole("textbox", { name: "Име", exact: true })
    .fill(fields.name);
  await form
    .getByRole("textbox", { name: "Имейл", exact: true })
    .fill(fields.email);
  await form.getByLabel("Тема").fill(fields.subject);
  await form.getByLabel("Съобщение").fill(fields.message);
  return form;
}

test.describe("Contact request", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("names each missing required field and keeps phone optional", async ({
    page,
  }) => {
    await page.goto("/contacts");

    const form = page.getByRole("form", { name: "Форма за контакти" });
    await expect(form.getByLabel("Телефон")).not.toHaveAttribute(
      "required",
      "",
    );
    await form.getByRole("button", { name: "Изпрати съобщението" }).click();

    await expect(
      form.getByRole("alert").filter({ hasText: "поправете" }),
    ).toBeVisible();
    await expect(
      form.getByRole("textbox", { name: "Име", exact: true }),
    ).toHaveAttribute("aria-invalid", "true");
    await expect(form.getByText("Моля, въведете име.")).toBeVisible();
    await expect(form.getByText("Моля, въведете имейл.")).toBeVisible();
    await expect(form.getByText("Моля, въведете тема.")).toBeVisible();
    await expect(form.getByText("Моля, напишете съобщение.")).toBeVisible();
    await expect(form.getByLabel("Телефон")).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("rejects an invalid email and keeps what the Customer typed", async ({
    page,
  }) => {
    await page.goto("/contacts");

    const form = await fillContactForm(page, {
      name: "Мария Иванова",
      email: "maria@",
      subject: "Дегустация",
      message: "Здравейте!",
    });
    await form.getByRole("button", { name: "Изпрати съобщението" }).click();

    await expect(
      form.getByText("Моля, въведете валиден имейл адрес."),
    ).toBeVisible();
    await expect(
      form.getByRole("textbox", { name: "Име", exact: true }),
    ).toHaveValue("Мария Иванова");
    await expect(form.getByLabel("Съобщение")).toHaveValue("Здравейте!");
  });

  test("sends with required fields only and promises no confirmation or tracking", async ({
    page,
  }) => {
    await page.goto("/contacts");

    const form = await fillContactForm(page, {
      name: "Мария Иванова",
      email: uniqueEmail("contact"),
      subject: "Дегустация",
      message: "Организирате ли дегустации в София?",
    });
    await form.getByRole("button", { name: "Изпрати съобщението" }).click();

    const status = page.getByRole("status");
    await expect(status).toContainText("Получихме съобщението");
    await expect(status).not.toContainText(/потвърждение|статус|проследи/i);
    await expect(
      page.getByRole("form", { name: "Форма за контакти" }),
    ).toHaveCount(0);
  });

  test("shows a retryable error and keeps the message when sending fails", async ({
    page,
  }) => {
    await page.goto("/contacts");
    await page.setExtraHTTPHeaders({ "x-shop-fixture": "error" });

    const form = await fillContactForm(page, {
      name: "Мария Иванова",
      email: "maria@example.com",
      subject: "Дегустация",
      message: "Съобщение, което не трябва да се губи.",
    });
    await form.getByRole("button", { name: "Изпрати съобщението" }).click();

    await expect(form.getByRole("alert")).toContainText(
      "Не успяхме да изпратим съобщението",
    );
    await expect(form.getByLabel("Съобщение")).toHaveValue(
      "Съобщение, което не трябва да се губи.",
    );
  });
});

test.describe("Newsletter subscription", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  test("footer subscribes immediately with single opt-in", async ({ page }) => {
    await page.goto("/");

    const form = page.getByRole("form", { name: "Абонамент за бюлетина" });
    await expect(
      form.getByRole("link", { name: "Политиката за поверителност" }),
    ).toHaveAttribute("href", "/privacy");
    await form.getByLabel("Имейл за бюлетина").fill(uniqueEmail("newsletter"));
    await form.getByRole("button", { name: "Абонирай се" }).click();

    await expect(
      page.getByRole("contentinfo").getByRole("status"),
    ).toContainText("Абонирахте се за бюлетина");
  });

  test("footer rejects an invalid email", async ({ page }) => {
    await page.goto("/");

    const form = page.getByRole("form", { name: "Абонамент за бюлетина" });
    await form.getByLabel("Имейл за бюлетина").fill("ivan");
    await form.getByRole("button", { name: "Абонирай се" }).click();

    await expect(
      form.getByText("Моля, въведете валиден имейл адрес."),
    ).toBeVisible();
    await expect(form.getByLabel("Имейл за бюлетина")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("unsubscribe link removes the subscription once and is not indexed", async ({
    page,
  }) => {
    await page.goto(
      `/newsletter/unsubscribe?token=${FIXTURE_UNSUBSCRIBE_TOKEN}`,
    );

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await page.getByRole("button", { name: "Отпиши ме" }).click();
    await expect(page.getByRole("main").getByRole("status")).toContainText(
      "Отписахте се от бюлетина",
    );

    await page.reload();
    await page.getByRole("button", { name: "Отпиши ме" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "невалиден или вече е използван",
    );
  });

  test("unsubscribe page without a token explains the broken link", async ({
    page,
  }) => {
    await page.goto("/newsletter/unsubscribe");

    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "Линкът за отписване е непълен",
    );
    await expect(page.getByRole("button", { name: "Отпиши ме" })).toHaveCount(
      0,
    );
  });
});

test.describe("Ask us joins the Waitlist", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
    });
  });

  async function openWaitlist(page: Page) {
    await page.goto("/whiskies/ask");
    const askUs = page.getByRole("button", { name: "Попитай ни", exact: true });
    await expect(askUs).toHaveAttribute("aria-expanded", "false");
    await askUs.click();
    await expect(askUs).toHaveAttribute("aria-expanded", "true");
    return page.getByRole("form", { name: "Списък за изчакване" });
  }

  test("requires email, keeps phone optional, and is not a reservation", async ({
    page,
  }) => {
    const form = await openWaitlist(page);

    await expect(form.getByText(/не е резервация или поръчка/)).toBeVisible();
    await expect(form.getByLabel("Телефон")).toBeVisible();
    await form.getByRole("button", { name: "Уведоми ме" }).click();
    await expect(form.getByText("Моля, въведете имейл.")).toBeVisible();

    await form
      .getByRole("textbox", { name: "Имейл", exact: true })
      .fill(uniqueEmail("waitlist"));
    await form.getByRole("button", { name: "Уведоми ме" }).click();

    const status = page.getByRole("main").getByRole("status");
    await expect(status).toContainText("Записахме ви");
    await expect(status).toContainText("Това не е резервация или поръчка");
    await expect(page.getByRole("button", { name: "Купи сега" })).toHaveCount(
      0,
    );
  });

  test("a second signup for the same email and SKU is not duplicated", async ({
    page,
  }) => {
    const email = uniqueEmail("waitlist-dup");

    let form = await openWaitlist(page);
    await form.getByRole("textbox", { name: "Имейл", exact: true }).fill(email);
    await form.getByLabel("Телефон").fill("0888123456");
    await form.getByRole("button", { name: "Уведоми ме" }).click();
    await expect(page.getByRole("main").getByRole("status")).toContainText(
      "Записахме ви",
    );

    form = await openWaitlist(page);
    await form
      .getByRole("textbox", { name: "Имейл", exact: true })
      .fill(email.toUpperCase());
    await form.getByRole("button", { name: "Уведоми ме" }).click();
    await expect(page.getByRole("main").getByRole("status")).toContainText(
      "вече е в списъка за изчакване",
    );
  });

  test("In-stock Whisky offers Buy and no Waitlist", async ({ page }) => {
    await page.goto("/whiskies/buy");

    await expect(page.getByRole("button", { name: "Купи сега" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Попитай ни", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("form", { name: "Списък за изчакване" }),
    ).toHaveCount(0);
  });

  test("shows a retryable error when the Waitlist cannot be saved", async ({
    page,
  }) => {
    const form = await openWaitlist(page);
    await page.setExtraHTTPHeaders({ "x-shop-fixture": "error" });

    await form
      .getByRole("textbox", { name: "Имейл", exact: true })
      .fill("guest@example.com");
    await form.getByRole("button", { name: "Уведоми ме" }).click();

    await expect(form.getByRole("alert")).toContainText(
      "Не успяхме да ви запишем",
    );
    await expect(
      form.getByRole("textbox", { name: "Имейл", exact: true }),
    ).toHaveValue("guest@example.com");
  });
});
