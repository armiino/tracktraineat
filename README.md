# Track Train Eat

Diese Readme dient aktuell als erläuterung der Idee und um Feinheiten zu dokumentieren

Auf Read The Docs ist alles Dokumentiert von Install anleitung bishin zur arc42 doc!
Read the docs für mehr Infos nutzen!

🔗 [TrackTrainEat – Read the Docs](https://tracktraineat.readthedocs.io/en/latest/)

## Grundidee

Jeder hat früher oder später im Leben das Ziel abzunehmen, zuzunehmen oder Muskeln aufzubauen. Diese 3 Ziele werden neben dem harten Training aber hauptsächlich in der Küche erreicht. Das Hauptproblem ist, dass man oft nicht weiss wie viel kalorien man noch zu sich nehmen muss. Und wenn man das weiss, fehlt es an ideen die genau den Kaloriengehalt decken.


Das Ziel von **Track Train Eat** ist es, leckere und personalisierte Rezepte zu generieren die abgestimmt sind auf Vorlieben und einzunehmenden Kalorien um den Haushalt zu decken. 

---

##  Projektidee

**Track Train Eat** ist eine Webanwendung, die:

-  den **Kalorienbedarf** auf Basis persönlicher Daten berechnet
-  **verbrannte Kalorien** (manuell oder später via Strava) berücksichtigt
-  passende **Mahlzeiten und Rezepte vorschlägt** (hier sollte man angeben können worauf man Lust hat zB. Reis..)
-  sich an persönlichen Zielen orientiert: **Abnehmen**, **Halten** oder **Muskelaufbau**
-  die Vorschläge über eine **externe API (Spoonacular oder eine andere noch nicht evaluierte)** bezieht
-  eine **Datenbank zur Speicherung** von Nutzerprofilen und Rezepten nutzt
-  eine klare Trennung von Backend und Frontend einhält
-  vollständig **dockerisiert, testbar und CI/CD-fähig** ist

---

## geplante Features 

-  Kalorienrechner (zB. Mifflin-St Jeor-Formel + Aktivitätsfaktor + Ziel)
-  Einbindung der Spoonacular API für Rezeptvorschläge
-  Benutzerregistrierung & Login (JWT-basiert)
-  Caching von Rezepten in eigener Datenbank (muss noch geklärt werden wie - Docker usw..)
-  Favoriten, Tagespläne, Ernährungstagebuch usw erstmal optional
-  Strava-Integration für automatische Trainingsdaten und zusätlichen kalorienverbrauch (aber auch optional für Zukunft)

---

## Tech Stack (erste Überlegung)

| Bereich      | Technologie                |
|--------------|----------------------------|
| **Frontend** | React.js                   |
| **Backend**  | Node.js + Express          |
| **Datenbank**| PostgreSQL (Docker)        |
| **API**      | Spoonacular                |
| **Auth**     | noch unklar evtl. JWT      |
| **Testing**  | Vorschlag Jest             |
| **CI/CD**    | GitHub Actions             |
| **Deployment** | Docker + Docker Compose |

---

##  Qualitätssicherung

Vorgabe:

-  Unit Tests & Integrationstests
-  e2e Tests 
-  CI-Pipeline via GitHub Actions
-  Penetration- & Zugriffstests (Auth)
-  Lasttests (Stressverhalten)
-  Dokumentation via arc42 & ReadTheDocs
-  ADRs für wichtige ProjektEntscheidungen

- auf GitHub öffentlich und in einer README sind die Schrite zum starten beschrieben (aktuell noch nicht)
---

## Ziel der Anwendung

Ein System, das sportlich motivierten Menschen hilft, **besser zu essen**, **bewusst zu trainieren** und **ihre Ziele datenbasiert zu erreichen** – ohne zu raten, ohne zu googlen, einfach und effizient.
test

---



