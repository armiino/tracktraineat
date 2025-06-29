import { test, expect } from '@playwright/test';

test('Startseite lädt und zeigt Titel', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/TrackTrainEat/i);
});
