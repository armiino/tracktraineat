import { test, expect } from "@playwright/test";

const generateEmail = () => `user${Date.now()}@example.com`;

test("Benutzer kann sich registrieren, einloggen und ein Profil erstellen", async ({
  page,
}) => {
  const email = generateEmail();
  const password = "register";

  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Passwort" }).fill(password);
  await page.getByRole("button", { name: "Registrieren" }).click();

  await expect(page).toHaveURL(/.*login/);

  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Passwort" }).fill(password);
  await page.getByRole("button", { name: "Login" }).click();

  await page.waitForURL("**/dashboard");

  await page.waitForTimeout(1000);

  await page.getByRole("button", { name: /profil erstellen/i }).click();

  await page.getByPlaceholder("Alter").fill("29");
  await page.getByPlaceholder("Größe (cm)").fill("182");
  await page.getByPlaceholder("Gewicht (kg)").fill("72");
  await page.locator('select[name="gender"]').selectOption("male");
  await page.locator('select[name="activity"]').selectOption("medium");
  await page.locator('select[name="goal"]').selectOption("noChange");
  await page.locator('select[name="dietType"]').selectOption("vegetarian");

  await page.getByRole("button", { name: /profil speichern/i }).click();

  await expect(page.locator("text=Aktualisierung erfolgreich")).toBeVisible({
    timeout: 5000,
  });

  await page.waitForURL("**/dashboard");

  await expect(page.locator("text=Kein Profil gefunden")).toHaveCount(0);

  await expect(
    page.getByRole("heading", { name: "Track Smart, Eat Good" })
  ).toBeVisible();
});
