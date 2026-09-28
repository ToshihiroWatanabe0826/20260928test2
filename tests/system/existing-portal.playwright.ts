import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const evidenceDirectory = path.resolve("docs/system-test/evidence");

async function waitForPortal(page: Page): Promise<void> {
  await expect(page.locator("#load-state")).toBeHidden();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
}

async function screenshot(page: Page, fileName: string): Promise<void> {
  await page.screenshot({
    path: path.join(evidenceDirectory, fileName),
    fullPage: true
  });
}

test.beforeAll(() => {
  mkdirSync(evidenceDirectory, { recursive: true });
});

test("ST-001〜ST-002 FAQとお知らせを確認する", async ({ page }) => {
  await page.goto("/#knowledge");
  await waitForPortal(page);
  await page.locator("#faq-search").fill("VPN 接続");
  await expect(page.locator("#faq-count")).toHaveText("1件のナレッジ");
  await expect(page.locator("#faq-list .faq-card")).toHaveCount(1);
  await page.locator("#faq-list summary").click();
  await expect(page.locator("#faq-list .article-steps li")).not.toHaveCount(0);

  await page.locator('[data-nav="notices"]').click();
  await expect(page.locator("#notice-list details")).toHaveCount(3);
  await page.locator("#notice-category").selectOption("account");
  await expect(page.locator("#notice-list details")).toHaveCount(1);
  await page.locator("#notice-list summary").click();
  await expect(page.locator("#notice-list details")).toHaveAttribute("open", "");
  await screenshot(page, "baseline-faq-notices.png");
});

test("ST-003〜ST-006 解決ナビから相談メールを準備する", async ({ page }) => {
  const writeRequests: string[] = [];
  page.on("request", (request) => {
    if (!["GET", "HEAD"].includes(request.method())) writeRequests.push(request.url());
  });
  await page.goto("/#troubleshoot");
  await waitForPortal(page);

  const initialHeading = await page.locator("#guide-step h2").textContent();
  await page.locator("#guide-step button").first().click();
  await expect(page.locator("#guide-back")).toBeEnabled();
  await page.locator("#guide-back").click();
  await expect(page.locator("#guide-step h2")).toHaveText(initialHeading ?? "");
  await page.locator("#guide-step button").first().click();
  await page.locator("#guide-reset").click();
  await expect(page.locator("#guide-step h2")).toHaveText(initialHeading ?? "");

  while (await page.locator("#guide-step .actions").count() === 0) {
    await page.locator("#guide-step button").first().click();
  }
  await page.getByRole("button", { name: "関連するFAQを読む" }).click();
  await expect(page.locator('[data-panel="knowledge"]')).toBeVisible();
  await expect(page.locator("#faq-list details[open]")).toHaveCount(1);

  await page.locator('[data-nav="troubleshoot"]').click();
  await page.locator("#guide-reset").click();
  while (await page.locator("#guide-step .actions").count() === 0) {
    await page.locator("#guide-step button").first().click();
  }
  await page.getByRole("button", { name: "確認結果を付けて相談" }).click();
  await expect(page.locator('[data-panel="contact"]')).toBeVisible();
  await expect(page.locator("#mail-details")).toHaveValue(/解決ナビの確認結果/);

  await page.locator("#mail-title").fill("VPN相談");
  await page.locator("#mail-details").fill("確認した手順と結果を共有します。");
  await page.getByRole("button", { name: "メール下書きを作成" }).click();
  await expect(page.locator("#draft-output")).toBeVisible();
  await expect(page.locator("#draft-subject")).toHaveValue(/VPN相談/);
  await expect(page.locator("#open-mail")).toHaveAttribute("href", /^mailto:/);
  await page.getByRole("button", { name: "件名・本文をコピー" }).click();
  await expect(page.locator("#copy-feedback")).not.toBeEmpty();
  expect(writeRequests).toEqual([]);

  await page.locator("#mail-title").fill(" ");
  await page.getByRole("button", { name: "メール下書きを作成" }).click();
  await expect(page.locator("#mail-error")).toBeVisible();
  await screenshot(page, "baseline-guide-contact.png");
});

test("ST-007〜ST-015 エラー復旧・ARIA・レスポンシブ・テーマを確認する", async ({
  page
}) => {
  let failPortalRequest = true;
  await page.route("**/api/portal", async (route) => {
    if (failPortalRequest) {
      failPortalRequest = false;
      await route.abort();
      return;
    }
    await route.continue();
  });
  await page.goto("/#knowledge");
  await expect(page.locator("#retry-load")).toBeVisible();
  await page.getByRole("button", { name: "再読み込み" }).click();
  await waitForPortal(page);

  await page.emulateMedia({ colorScheme: "dark" });
  await page.setViewportSize({ width: 550, height: 800 });
  await page.goto("/?scoutTheme=dark#knowledge");
  await waitForPortal(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#faq-count")).toHaveAttribute("aria-live", "polite");
  await expect(page.locator("#mail-error")).toHaveAttribute("role", "alert");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await screenshot(page, "baseline-quality.png");
});
