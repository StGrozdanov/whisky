import { expect, type Page, test } from "@playwright/test";

// Logins seeded by the `accounts` Identity fixture; links use predictable
// tokens (`verify-email:<email>`, `reset-password:<email>`).
const MEMBER = {
  email: "member@fixture.test",
  password: "fixture-member-password",
};
const UNVERIFIED_EMAIL = "unverified@fixture.test";
const SHOPKEEPER = {
  email: "shopkeeper@fixture.test",
  password: "fixture-shopkeeper-password",
};

function uniqueEmail(label: string): string {
  return `${label}-${Date.now()}-${Math.round(Math.random() * 1e6)}@example.com`;
}

async function signIn(
  page: Page,
  path: string,
  formName: string,
  credentials: { email: string; password: string },
) {
  await page.goto(path);
  const form = page.getByRole("form", { name: formName });
  await form.getByLabel("Имейл").fill(credentials.email);
  await form.getByLabel("Парола").fill(credentials.password);
  await form.getByRole("button", { name: "Вход" }).click();
  return form;
}

async function register(
  page: Page,
  fields: { email: string; password: string },
) {
  await page.goto("/account/register");
  const form = page.getByRole("form", { name: "Регистрация" });
  await form.getByRole("textbox", { name: "Име", exact: true }).fill("Мария");
  await form.getByLabel("Фамилия").fill("Иванова");
  await form.getByLabel("Имейл").fill(fields.email);
  await form.getByLabel(/^Парола/).fill(fields.password);
  await form.getByLabel("Повторете паролата").fill(fields.password);
  await form.getByRole("button", { name: "Създай акаунт" }).click();
  return form;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("whiskyfinder.ageConfirmed", "true");
  });
});

test.describe("Customer Account", () => {
  test("the header Account link asks a guest to sign in", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Акаунт" }).click();

    await expect(page).toHaveURL(/\/account\/sign-in$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Вход" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("main")
        .getByRole("button", { name: /Google|Facebook|Apple/ }),
    ).toHaveCount(0);
  });

  test("registration requires first and last name and a long enough password", async ({
    page,
  }) => {
    await page.goto("/account/register");
    const form = page.getByRole("form", { name: "Регистрация" });
    await form.getByLabel(/^Парола/).fill("short");
    await form.getByLabel("Повторете паролата").fill("shorter");
    await form.getByRole("button", { name: "Създай акаунт" }).click();

    await expect(form.getByText("Паролите не съвпадат.")).toBeVisible();
    await expect(form.getByText("Моля, въведете име.")).toBeVisible();
    await expect(form.getByText("Моля, въведете фамилия.")).toBeVisible();
    await expect(form.getByText("Моля, въведете имейл.")).toBeVisible();
    await expect(
      form.getByText("Паролата трябва да е поне 8 знака.", { exact: true }),
    ).toBeVisible();
  });

  test("a new Account signs in only after its email is verified", async ({
    page,
  }) => {
    const email = uniqueEmail("register");
    const password = "glenfarclas-15";

    await register(page, { email, password });
    await expect(
      page.getByRole("status").filter({ hasText: email }),
    ).toBeVisible();

    const form = await signIn(page, "/account/sign-in", "Вход в акаунта", {
      email,
      password,
    });
    await expect(
      form.getByRole("alert").filter({ hasText: "не сте потвърдили" }),
    ).toBeVisible();

    await page.goto(`/account/verify-email?token_hash=verify-email:${email}`);
    await page.getByRole("button", { name: "Потвърди имейла" }).click();

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByText("Мария Иванова")).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test("a used verification link is refused", async ({ page }) => {
    const email = uniqueEmail("reused-link");
    await register(page, { email, password: "glenfarclas-15" });
    await page.goto(`/account/verify-email?token_hash=verify-email:${email}`);
    await page.getByRole("button", { name: "Потвърди имейла" }).click();
    await expect(page).toHaveURL(/\/account$/);

    await page.goto(`/account/verify-email?token_hash=verify-email:${email}`);
    await page.getByRole("button", { name: "Потвърди имейла" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: "невалиден" }),
    ).toBeVisible();
  });

  test("an unverified Account is told to verify its email", async ({
    page,
  }) => {
    const form = await signIn(page, "/account/sign-in", "Вход в акаунта", {
      email: UNVERIFIED_EMAIL,
      password: MEMBER.password,
    });

    await expect(
      form.getByRole("alert").filter({ hasText: "не сте потвърдили" }),
    ).toBeVisible();
  });

  test("a wrong password keeps the email and clears the password", async ({
    page,
  }) => {
    const form = await signIn(page, "/account/sign-in", "Вход в акаунта", {
      email: MEMBER.email,
      password: "not-the-password",
    });

    await expect(
      form.getByRole("alert").filter({ hasText: "Грешен имейл или парола." }),
    ).toBeVisible();
    await expect(form.getByLabel("Имейл")).toHaveValue(MEMBER.email);
    await expect(form.getByLabel("Парола")).toHaveValue("");
  });

  test("a Member signs in, sees their Account and logs out", async ({
    page,
  }) => {
    await signIn(page, "/account/sign-in", "Вход в акаунта", MEMBER);

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByText("Иван Петров")).toBeVisible();

    await page.getByRole("button", { name: "Изход" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/account");
    await expect(page).toHaveURL(/\/account\/sign-in$/);
  });

  test("an email with a verified Account cannot register again", async ({
    page,
  }) => {
    const form = await register(page, {
      email: MEMBER.email,
      password: "another-password-1",
    });

    await expect(
      form.getByText("Вече има акаунт с този имейл.", { exact: false }),
    ).toBeVisible();
    await expect(form.getByLabel("Имейл")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("an invalid form is checked in the browser without a request", async ({
    page,
  }) => {
    await page.goto("/account/sign-in");
    const posts: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST") {
        posts.push(request.url());
      }
    });
    const form = page.getByRole("form", { name: "Вход в акаунта" });
    await form.getByLabel("Имейл").fill("member@");
    await form.getByRole("button", { name: "Вход" }).click();

    await expect(
      form.getByText("Моля, въведете валиден имейл адрес."),
    ).toBeVisible();
    await expect(form.getByText("Моля, въведете парола.")).toBeVisible();
    await expect(form.getByLabel("Имейл")).toBeFocused();
    expect(posts).toEqual([]);
  });

  test("typing into a field clears its error and the sign-in failure", async ({
    page,
  }) => {
    const form = await signIn(page, "/account/sign-in", "Вход в акаунта", {
      email: MEMBER.email,
      password: "not-the-password",
    });
    const failure = form
      .getByRole("alert")
      .filter({ hasText: "Грешен имейл или парола." });
    await expect(failure).toBeVisible();

    await form.getByLabel("Парола").fill("x");
    await expect(failure).toHaveCount(0);

    await form.getByLabel("Имейл").fill("");
    await form.getByLabel("Парола").fill("");
    await form.getByRole("button", { name: "Вход" }).click();
    await expect(form.getByText("Моля, въведете имейл.")).toBeVisible();
    await form.getByLabel("Имейл").fill("m");
    await expect(form.getByText("Моля, въведете имейл.")).toHaveCount(0);
    await expect(form.getByText("Моля, въведете парола.")).toBeVisible();
  });

  test("the Account pages are not indexable", async ({ page }) => {
    for (const path of ["/account/sign-in", "/account/register"]) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
    }
  });

  test("an auth provider failure shows a retryable error", async ({ page }) => {
    await page.goto("/account/sign-in");
    await page.setExtraHTTPHeaders({ "x-identity-fixture": "error" });
    const form = page.getByRole("form", { name: "Вход в акаунта" });
    await form.getByLabel("Имейл").fill(MEMBER.email);
    await form.getByLabel("Парола").fill(MEMBER.password);
    await form.getByRole("button", { name: "Вход" }).click();

    await expect(
      form.getByRole("alert").filter({ hasText: "опитайте отново" }),
    ).toBeVisible();
  });
});

test.describe("password recovery", () => {
  test("a Member sets a new password from the emailed link", async ({
    page,
  }) => {
    const email = uniqueEmail("recover");
    await register(page, { email, password: "old-password-1" });
    await page.goto(`/account/verify-email?token_hash=verify-email:${email}`);
    await page.getByRole("button", { name: "Потвърди имейла" }).click();
    await page.getByRole("button", { name: "Изход" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/account/sign-in");
    await page.getByRole("link", { name: "Забравена парола" }).click();
    const request = page.getByRole("form", { name: "Забравена парола" });
    await request.getByLabel("Имейл").fill(email);
    await request.getByRole("button", { name: "Изпрати линк" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "смените паролата си" }),
    ).toBeVisible();

    await page.goto(
      `/account/reset-password?token_hash=reset-password:${email}`,
    );
    const reset = page.getByRole("form", { name: "Нова парола" });
    await reset.getByLabel(/^Нова парола/).fill("new-password-1");
    await reset.getByLabel("Повторете новата парола").fill("new-password-1");
    await reset.getByRole("button", { name: "Запази паролата" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Паролата е сменена" }),
    ).toBeVisible();

    await signIn(page, "/account/sign-in", "Вход в акаунта", {
      email,
      password: "new-password-1",
    });
    await expect(page).toHaveURL(/\/account$/);
  });

  test("an unknown recovery link is refused", async ({ page }) => {
    await page.goto("/account/reset-password?token_hash=made-up");
    const reset = page.getByRole("form", { name: "Нова парола" });
    await reset.getByLabel(/^Нова парола/).fill("new-password-1");
    await reset.getByLabel("Повторете новата парола").fill("new-password-1");
    await reset.getByRole("button", { name: "Запази паролата" }).click();

    await expect(
      reset.getByRole("alert").filter({ hasText: "Поискайте нов линк" }),
    ).toBeVisible();
  });
});

test.describe("Shopkeeper access", () => {
  test("the back office asks a guest to sign in", async ({ page }) => {
    await page.goto("/back-office");

    await expect(page).toHaveURL(/\/back-office\/sign-in$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("the Shopkeeper signs into the back office and out again", async ({
    page,
  }) => {
    await signIn(page, "/back-office/sign-in", "Вход в бек офиса", SHOPKEEPER);

    await expect(page).toHaveURL(/\/back-office$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Бек офис" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Изход" }).click();
    await expect(page).toHaveURL(/\/back-office\/sign-in$/);
    await page.goto("/back-office");
    await expect(page).toHaveURL(/\/back-office\/sign-in$/);
  });

  test("a Member cannot open the back office", async ({ page }) => {
    await signIn(page, "/account/sign-in", "Вход в акаунта", MEMBER);
    await expect(page).toHaveURL(/\/account$/);

    await page.goto("/back-office");
    await expect(page).toHaveURL(/\/back-office\/sign-in$/);

    const form = await signIn(
      page,
      "/back-office/sign-in",
      "Вход в бек офиса",
      MEMBER,
    );
    await expect(
      form.getByRole("alert").filter({ hasText: "Грешен имейл или парола." }),
    ).toBeVisible();
  });

  test("the Shopkeeper has no Customer Account", async ({ page }) => {
    await signIn(page, "/back-office/sign-in", "Вход в бек офиса", SHOPKEEPER);
    await expect(page).toHaveURL(/\/back-office$/);

    await page.goto("/account");
    await expect(page).toHaveURL(/\/account\/sign-in$/);

    const form = await signIn(
      page,
      "/account/sign-in",
      "Вход в акаунта",
      SHOPKEEPER,
    );
    await expect(
      form.getByRole("alert").filter({ hasText: "Грешен имейл или парола." }),
    ).toBeVisible();
  });
});
