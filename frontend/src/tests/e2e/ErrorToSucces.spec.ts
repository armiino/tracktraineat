import { test, expect } from "@playwright/test";

const generateEmail = () => `user${Date.now()}@example.com`;
const password = "test1234";

test("Recovery Flow: Fehlerhafte Eingaben und Korrekturen bis zum vollständigen Abschluss", async ({
  page,
}) => {
  const email = generateEmail();

  //registrieren
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Passwort" }).fill(password);
  await page.getByRole("button", { name: "Registrieren" }).click();
  await expect(page).toHaveURL(/.*login/);

  // einloggen
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Passwort" }).fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL("**/dashboard");
  await page.waitForTimeout(1000);

  // profil erstellen (absichtlich unvollständig)
  await page.getByRole("button", { name: /profil erstellen/i }).click();
  await page.getByPlaceholder("Alter").fill("30");
  await page.getByPlaceholder("Größe (cm)").fill("180");
  await page.getByPlaceholder("Gewicht (kg)").fill("75");
  await page.locator('select[name="gender"]').selectOption("male");
  await page.locator('select[name="activity"]').selectOption("high");
  await page.locator('select[name="dietType"]').selectOption("omnivore");
  //(goal fehlt absichtlich
  await page.getByRole("button", { name: /profil speichern/i }).click();

  // Fehlertext sollte erscheinen
  await expect(page.locator("text=Bitte Ziel wählen")).toBeVisible();

  // Ziel korrigieren & Profil speichern
  await page.locator('select[name="goal"]').selectOption("gainMuscle");
  await page.getByRole("button", { name: /profil speichern/i }).click();

  // Toast "Aktualisierung erfolgreich"
  const toast = page.locator('[role="status"]', {
    hasText: "Aktualisierung erfolgreich",
  });
  await expect(toast).toBeVisible({ timeout: 5000 }); //nötig weil der immer bissl da ist

  try {
    await toast.click({ timeout: 1000 });
  } catch {}

  await page.waitForURL("**/dashboard");

  // Mealplan öffnen
  await page.getByRole("button", { name: "Mealplan" }).click();

  // Verteilung falsch..
  await page.getByLabel(/Anzahl Mahlzeiten pro Tag/i).selectOption("3");
  await page.locator("#meal-distribution-0").fill("30");
  await page.locator("#meal-distribution-1").fill("30");
  await page.locator("#meal-distribution-2").fill("30");
  await page.getByRole("button", { name: /rezepte generieren/i }).click();

  await expect(
    page.locator("text=Die Summe der Prozentwerte muss genau 100% ergeben.")
  ).toBeVisible();

  // korrigiern
  await page.locator("#meal-distribution-0").fill("40");
  await page.locator("#meal-distribution-1").fill("30");
  await page.locator("#meal-distribution-2").fill("30");
  await page.getByRole("button", { name: /rezepte generieren/i }).click();

  const recipeCard = page.locator('[data-testid^="recipe-card-"]').first();
  await expect(recipeCard).toBeVisible({ timeout: 10000 });

  const recipeTitle = await recipeCard.locator("h4").textContent();
  await recipeCard.getByRole("button", { name: /rezept/i }).click();

  await page.getByRole("button", { name: /speichern/i }).click();

  await page.getByRole("link", { name: /saved recipes/i }).click();
  await page.waitForURL("**/saved");

  await page
    .getByRole("button", { name: new RegExp(recipeTitle ?? "", "i") })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 10000 });

  await dialog.locator("button").first().click();
  await expect(dialog).toHaveCount(0);

  const deleteButton = page.getByTestId(/^delete-button-/).first();
  await deleteButton.click();
  await expect(deleteButton).toHaveCount(0);
});
