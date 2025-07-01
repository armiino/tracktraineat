

# Testkonzept und Testpyramide

Das Projekt **TrackTrainEat** implementiert eine vollständige Teststrategie nach dem Prinzip der **Testpyramide**. Diese umfasst:

*  **Unit-Tests** zur Prüfung einzelner Funktionen (isoliert und viel gemockt)
*  **Integrationstests** zur Überprüfung mehrerer Schichten (auch Penetrations-Test im Sinne eines Integrationstests)
*  **End-to-End-Tests (E2E)** für realistische User-Szenarien

Pipeline: zusätzlich sichert ein CI/CD-Prozess die Qualität und Konsistenz automatisch über GitHub Actions und SonarCloud.

---

## Testpyramide im Überblick
```markdown

      ████                ▲
     ██████               │  End-to-End-Tests (Playwright)
    ████████              │
   ██████████             │  Integrationstests (Jest + Supertest)
  ████████████            │
 ██████████████           │  Unit-Tests (Jest)
████████████████          ▼
```
---

##  Unit-Tests

| Bereich      | Tool(s)   | Inhalt/Beispiele                                                                                       |
| ------------ | --------- | ------------------------------------------------------------------------------------------------------ |
| **Backend**  | Jest      | - `authController.test.ts` (isolierter Controller)  <br> - `spoonacularAdapter.test.ts` (Mock der API) |
| **Frontend** | Jest, RTL | - Komponenten-Tests für zB `Navbar`, `LoginForm`, `ProfilePage usw.` <br> - Validierung mit Zod      |

---

## Integrationstests

| Bereich      | Tool(s)               | Inhalt/Beispiele                                                                                             |
| ------------ | --------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Backend**  | Jest, Supertest, Nock | - `auth.routes.test.ts` (Login/Register API mit DB) <br> - `profile.routes.test.ts` (Profil-Update über API) |
| **Frontend** | RTL + Axios-Mocking   | - (Unit-ebene) API-Calls werden simuliert <br> - Interaktion mit Formularen, Navigation, Komponenten-Zusammenspiel        |

---

##  End-to-End-Tests (E2E)

| Tool       | Inhalt/Beispiele                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Playwright | - Kompletter Login-Flow <br> - Nutzerprofil anlegen <br> - Rezepte generieren und speichern <br> - UI-Verhalten mit echter Datenbank |

**Läuft gegen echtes Backend & Datenbank via Docker Compose**

---

## CI/CD & Qualitätssicherung

| Bereich               | Tool(s)           | Beschreibung                                                          |
| --------------------- | ----------------- | --------------------------------------------------------------------- |
| **CI/CD**             | GitHub Actions    | Build, Test, Lint, Deploy pipeline                                    |
| **Testabdeckung**     | Jest Coverage     | > 80% (aktuell 87%) Testabdeckung im Frontend & Backend               |
| **Statische Analyse** | SonarCloud        | Keine offenen Warnungen, Issues, oder                |
| **Security /Pen-  Tests**    | Integrationstests | Absicherung authentifizierter Routen mit Tokens (Login, Rezepte etc.) |

---

## Zusammenfassung

* **Alle Schichten der Testpyramide sind vollständig umgesetzt**
* **Tests decken Kernfunktionalitäten und Sicherheitslogik ab**
* **Automatisierte Qualitätssicherung via CI/CD & statischer Analyse**
* **Modernes, robustes Testkonzept für langlebige Wartbarkeit**
