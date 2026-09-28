import { test, expect } from "@playwright/test";
import { ROUTES } from "./routes";

test.use({ reducedMotion: "reduce" });

for (const route of ROUTES) {
  test(`visual: ${route}`, async ({ page }) => {
    await page.addInitScript(() => {
      (window as { __SKIP_MOTION__?: boolean }).__SKIP_MOTION__ = true;
    });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
}
