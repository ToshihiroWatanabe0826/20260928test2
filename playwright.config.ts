import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "@playwright/test";

function localChromeForTesting(): string | undefined {
  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData) return undefined;
  const chromeRoot = path.join(localAppData, "copilot-browser-cache", "chrome");
  if (!existsSync(chromeRoot)) return undefined;
  for (const version of readdirSync(chromeRoot).sort().reverse()) {
    const candidate = path.join(chromeRoot, version, "chrome-win64", "chrome.exe");
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

const executablePath = process.env.PLAYWRIGHT_CHROME_PATH ?? localChromeForTesting();

export default defineConfig({
  testDir: "./tests/system",
  testMatch: "**/*.playwright.ts",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  outputDir: "test-results/playwright",
  use: {
    baseURL: "http://127.0.0.1:4174",
    headless: true,
    viewport: { width: 1280, height: 900 },
    launchOptions: executablePath ? { executablePath } : undefined,
    screenshot: "off",
    trace: "off"
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:4174/health",
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe"
  }
});
