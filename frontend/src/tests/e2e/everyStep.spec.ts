import { test, expect } from '@playwright/test';

const generateEmail = () => `user${Date.now()}@example.com`;
const password = 'test1234';

test('Kompletter Flow: Registrierung → Profil → Mealplan → Rezept speichern & löschen', async ({ page }) => {
  const email = generateEmail();

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Passwort' }).fill(password);
  await page.getByRole('button', { name: 'Registrieren' }).click();

  await expect(page).toHaveURL(/.*login/);

  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Passwort' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(1000); //wegam toaster nötig

  await page.getByRole('button', { name: /profil erstellen/i }).click();
  await page.getByPlaceholder('Alter').fill('30');
  await page.getByPlaceholder('Größe (cm)').fill('180');
  await page.getByPlaceholder('Gewicht (kg)').fill('75');
  await page.locator('select[name="gender"]').selectOption('male');
  await page.locator('select[name="activity"]').selectOption('high');
  await page.locator('select[name="goal"]').selectOption('gainMuscle');
  await page.locator('select[name="dietType"]').selectOption('omnivore');
  await page.getByRole('button', { name: /profil speichern/i }).click();

  // warten auf Toast "Aktualisierung erfolgreich"
  const toast = page.locator('[role="status"]', { hasText: 'Aktualisierung erfolgreich' });
  await expect(toast).toBeVisible({ timeout: 5000 });

  try {
    await toast.click({ timeout: 1000 }); // falls schließbar (eig nicht möglich)
  } catch {
    // ignorieren weil hier gabs probleme wegen dem toast
  }

  await page.waitForURL('**/dashboard');

  await page.getByRole('button', { name: 'Mealplan' }).click();
  await page.getByLabel(/Anzahl Mahlzeiten pro Tag/i).selectOption('4');
  await page.getByRole('button', { name: /rezepte generieren/i }).click();

  const recipeCard = page.locator('[data-testid^="recipe-card-"]').first();
  await expect(recipeCard).toBeVisible({ timeout: 10000 });

  const recipeTitle = await recipeCard.locator('h4').textContent();
  await recipeCard.getByRole('button', { name: /rezept/i }).click();

  await page.getByRole('button', { name: /speichern/i }).click();

  await page.getByRole('link', { name: /saved recipes/i }).click();
  await page.waitForURL('**/saved');

await page.getByRole('button', { name: new RegExp(recipeTitle ?? '', 'i') }).click();
const dialog = page.getByRole('dialog');
await expect(dialog).toBeVisible({ timeout: 10000 });

await dialog.locator('button').first().click();

await expect(dialog).toHaveCount(0);

});
