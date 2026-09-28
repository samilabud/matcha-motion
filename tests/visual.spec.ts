import { test, expect } from "@playwright/test";
import { ROUTES } from "./routes";

test.use({ reducedMotion: "reduce" });

for (const route of ROUTES) {
  test(`visual: ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
}
