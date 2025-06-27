import { toast } from "react-hot-toast";

const errorMap: Record<string, string> = {
  email_taken: "Diese E-Mail-Adresse wird bereits verwendet.",
  register_failed:
    "Registrierung fehlgeschlagen. Bitte später erneut versuchen.",
  invalid_credentials: "E-Mail oder Passwort sind falsch.",
  login_failed: "Anmeldung fehlgeschlagen!",
  logout_failed: "Abmeldung fehlgeschlagen!",
  profile_not_found: "Kein Profil gefunden – bitte erst erstellen.",
  calculate_profile_failed: "Profil konnte nicht berechnet werden.",
  get_recipes_failed: "Rezepte konnten nicht geladen werden.",
  get_mealplan_failed: "Essensplan konnte nicht generiert werden.",
  get_recipe_details_failed: "Details konnten nicht geladen werden.",
  missing_recipe_id: "Rezept-ID fehlt.",
  unknown_recipe_error: "Unbekannter Fehler beim Abrufen der Rezepte.",
  recipe_already_saved: "Dieses Rezept hast du bereits gespeichert.",
  recipe_not_found: "Rezept wurde nicht gefunden.",
  save_recipe_failed: "Rezept konnte nicht gespeichert werden.",
  load_saved_recipes_failed:
    "Gespeicherte Rezepte konnten nicht geladen werden.",
  saved_recipe_delete_failed: "Rezept konnte nicht gelöscht werden.",
  create_profile_failed: "Profil konnte nicht erstellt werden.",
  update_profile_failed: "Profil konnte nicht aktualisiert werden.",
  get_profile_failed: "Profil konnte nicht geladen werden.",
  validation_failed: "Eingaben sind ungültig.",
  db_not_available:
    "Datenbank nicht erreichbar – bitte später erneut versuchen.",
  db_query_error: "Fehler bei der Datenbankabfrage.",
  db_unknown_error: "Unbekannter Datenbankfehler.",
  spoonacular_auth_error: "Fehler bei der Rezeptgenerierung – API-Key prüfen.",
  spoonacular_quota_exceeded:
    "API-Limit überschritten – bitte später erneut versuchen.",
  spoonacular_request_failed: "Rezeptdaten konnten nicht geladen werden.",
  no_token: "Du bist nicht angemeldet.",
  invalid_token: "Deine Sitzung ist abgelaufen oder ungültig.",

  invalid_input: "Eingabe ungültig.",
  spoonacular_missing_key: "API KEY FEHLT!"
};

export function handleApiError(
  error: any,
  fallbackMessage = "Ein Fehler ist aufgetreten."
) {
  const res = error?.response;

  // Netzwerk/CORS Fehler.. kein response vorhanden und immer untersschiedliche "error meldungen"
  if (
    !res ||
    error.message?.includes("Network Error") ||
    error.code === "ERR_NETWORK" ||
    error.code === "NS_ERROR_CONNECTION_REFUSED" ||
    error.toString().includes("Failed to fetch") ||
    error.toString().includes("CORS")
  ) {
    toast.error("Netzwerkfehler – bitte Verbindung prüfen.");
    return;
  }

  // Code vom Backend (zB res.data.code = "profile_not_found")
  const backendCode = res.data?.code;
  if (backendCode && typeof backendCode === "string" && errorMap[backendCode]) {
    toast.error(errorMap[backendCode]);
    return;
  }

  //validation error (z.B. von class-validator oder so)
  if (res.status === 400 && Array.isArray(res.data?.details)) {
    const messages = res.data.details
      .map((d: any) => Object.values(d.constraints ?? {}).join(", "))
      .join("\n");
    toast.error(messages ?? "Ungültige Eingaben.");
    return;
  }

  if (typeof res.data?.error === "string") {
    toast.error(res.data.error);
    return;
  }

  if (typeof res.data?.message === "string") {
    toast.error(res.data.message);
    return;
  }

  //Interner Serverfehler 500er
  if (res.status >= 500) {
    toast.error("Serverfehler – bitte später erneut versuchen.");
    return;
  }

  //falls nichts greift.. fallback
  toast.error(fallbackMessage);
}
