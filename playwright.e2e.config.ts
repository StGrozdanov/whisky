import { defineConfig, devices } from "@playwright/test";

const e2ePort = 3001;
const localBaseURL = `http://127.0.0.1:${e2ePort}`;
const baseURL = process.env.BASE_URL ? process.env.BASE_URL : localBaseURL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run start -- --hostname 127.0.0.1 --port ${e2ePort}`,
        url: localBaseURL,
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
