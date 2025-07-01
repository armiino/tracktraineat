---
status: "accepted"
date: 2025-04-30
decision-makers: [Armin Merdan]
consulted: []
informed: []
---

# Entscheidung für PostgreSQL mit Prisma als ORM

## Context and Problem Statement

Die Anwendung *TrackTrainEat* benötigt eine relationale Datenbank zur dauerhaften Speicherung von Benutzerkonten, Gesundheitsprofilen und Rezeptinformationen. Gleichzeitig soll die Datenzugriffsschicht typsicher, wartbar und erweiterbar bleiben. Ursprünglich wurde erwogen, SQL-Zugriffe direkt zu implementieren – die Migrationen und das Datenmodellmanagement hätten jedoch zusätzlichen manuellen Aufwand bedeutet.

## Decision Drivers

* Typensicherheit bei Datenbankzugriffen (z. B. DTO → DB-Modelle)
* Einfaches Management von Datenbankmigrationen
* Gute Dokumentation und Tooling
* Stabiler Betrieb im Docker-Container
* Relationale Abfragen (JOINs, Constraints) sind notwendig

## Considered Options

* PostgreSQL + Prisma (→ gewählt)
* PostgreSQL ohne ORM (raw SQL)
* MongoDB (→ hypothetisch als Vergleich, aber ungeeignet für relationales Modell)

## Decision Outcome

Chosen option: "PostgreSQL + Prisma", weil es Typsicherheit, gute Migrationswerkzeuge und klare Modellierung von Relationen in einem ORM vereint – ohne auf SQL-Niveau wechseln zu müssen.

### Consequences

* Gut, weil Prisma erleichtert das Anlegen, Migrieren und Verwalten von Datenmodellen erheblich
* Gut, weil PostgreSQL bietet ausgereifte Unterstützung für relationale Daten und Constraints
* Gut, weil durch Prisma wird die Codequalität erhöht (weniger Fehler bei DB-Zugriffen)
* schlecht, weil das initiale Setup von Prisma (generate, migrate, deploy) ist fehleranfällig und erfordert Disziplin
* Neutral, weil Prisma ist eine zusätzliche Abstraktionsschicht – bietet Komfort, aber limitiert bei Spezialfällen

### Confirmation

Die Entscheidung ist vollständig im Code abgebildet:  
- Die Datenbank läuft als Docker-Container (`tracktraineat-db`)
- Prisma wird als ORM verwendet und generiert automatisch Typschnittstellen
- Migrationen werden über `prisma migrate dev` und `prisma migrate deploy` verwaltet
- Prisma-Schema liegt unter `backend/generated/prisma/schema.prisma`

## Pros and Cons of the Options

### PostgreSQL + Prisma

* Gut, weil sehr gute Integration in TypeScript-Umgebungen
* Gut, weil explizite und versionierte Migrationsdateien
* Gut, weil einfache Erstellung von Models und Queries
* Neutral, weil Abstraktionskosten durch Prisma
* schlecht, weil Setup (z. B. beim Docker-Deploy) kann fragile sein (Migrationssynchronisierung)

### PostgreSQL ohne ORM (raw SQL)

* Gut, weil maximale Kontrolle über SQL und Query-Optimierung
* Gut, weil keine Abhängigkeit von zusätzlichem Tool (kleinerer Stack)
* schlecht, weil manuelles Migration-Handling notwendig
* schlecht, weil fehlende Typsicherheit und Wiederverwendbarkeit im Code
* schlecht, weil höherer Entwicklungs- und Wartungsaufwand

### MongoDB (hypothetisch)

* Gut, weil flexibel bei sich schnell ändernden Datenschemata
* schlecht, weil unstrukturierte Daten ungeeignet für relationales Domainmodell
* schlecht, weil JOINs und Constraints fehlen oder sind umständlich
* schlecht, weil Umstellung der gesamten Datenmodelllogik notwendig

## More Information

Diese Entscheidung ist eng verknüpft mit techstack und wird im Code durch Prisma-Dateien, Migrations-Setup und Datenbankzugriffe über Prisma-Client reflektiert.  

