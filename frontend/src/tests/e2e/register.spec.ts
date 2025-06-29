import { test, expect } from '@playwright/test';

test('Benutzer kann sich erfolgreich registrieren', async ({ page }) => {
  // Zufällige E-Mail generieren damitt nicht zufällig doppelt 
  const email = `user_${Date.now()}@test.de`;
  const password = 'Test1234!';

  await page.goto('http://localhost:5173/');

  await page.getByRole('link', { name: /register/i }).click();

  await page.getByRole('textbox', { name: /email/i }).fill(email);
  await page.getByRole('textbox', { name: /passwort/i }).fill(password);

  await page.getByRole('button', { name: /registrieren/i }).click();

  await expect(page).toHaveURL(/login|profile|dashboard/i);

  await expect(page.locator('body')).toContainText(/login|profil/i);
});
