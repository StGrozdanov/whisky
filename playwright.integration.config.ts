import { defineConfig, devices } from "@playwright/test";

const integrationPort = 3001;
const localBaseURL = `http://127.0.0.1:${integrationPort}`;

export default defineConfig({
  testDir: "./integration",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: localBaseURL,
    trace: "on-first-retry",
    extraHTTPHeaders: {
      "x-shop-fixture": "mixed",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.CI
      ? `npm run start -- --hostname 127.0.0.1 --port ${integrationPort}`
      : `npm run dev -- --hostname 127.0.0.1 --port ${integrationPort}`,
    url: localBaseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      SHOP_FIXTURE: "mixed",
    },
  },
});
