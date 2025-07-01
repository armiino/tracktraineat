---
status: "accepted"
date: 2025-04-30
decision-makers: [Armin Merdan]
consulted: []
informed: []
---

# Entscheidung für den Technologie-Stack

## Context and Problem Statement

Für die Umsetzung von *TrackTrainEat* wurde ein vollständiger Fullstack-Technologie-Stack benötigt. Ziel war es, eine moderne Webanwendung mit interaktivem Benutzer-Frontend und klar strukturiertem Backend zu realisieren – inklusive externer API-Anbindung und persistenter Datenhaltung. Die eingesetzten Technologien sollten wartbar, dockerisierbar, typisiert und lokal einfach betreibbar sein.

## Decision Drivers

* TypeScript in Frontend und Backend für durchgängige Typisierung
* Gute Dokumentation, große Community und produktive Erfahrung mit den Tools
* Möglichkeit zur klaren Trennung von Verantwortlichkeiten
* Einfache lokale Entwicklung und vollständige Dockerisierung
* Integration mit einer externen REST-API (Spoonacular)

## Considered Options

* React + Vite (Frontend) + Node.js / Express + Prisma (Backend) + PostgreSQL
* Express + Vanilla JS Frontend (abgelehnt)
* React + Node.js ohne ORM (abgelehnt)

## Decision Outcome

Chosen option: "React + Vite + Node.js / Express + Prisma + PostgreSQL", weil dieser Stack alle funktionalen, strukturellen und betrieblichen Anforderungen erfüllt, vollständig typisiert ist und lokale Entwicklung mit Docker Compose ermöglicht.

### Consequences

* Gut, weil die Frontend- und Backendmodule sind klar getrennt und unabhängig entwickelbar
* Gut, weil Prisma ermöglicht Typsicherheit und klare Migrationsverwaltung bei gleichzeitiger Kontrolle über das Datenmodell
* Gut, weil die Dockerisierung erlaubt einfache Umgebungskonfiguration und Wiederholbarkeit (Dev & Prod)
* Schlecht, weil Vite/React + Express müssen separat gestartet und synchronisiert werden (z. B. Ports, Cross-Origin)
* Schlecht, weil initial höherer Setup-Aufwand im Vergleich zu einem Monolithen

### Confirmation

Die Entscheidung ist vollständig im Projektcode umgesetzt. Das Frontend liegt als Feature-basierte React-Vite-Anwendung vor, das Backend basiert auf einer Express-Applikation mit Prisma ORM und PostgreSQL. Beide sind per Dockerfile dockerisiert, über `docker-compose.yml` gemeinsam orchestrierbar und via REST-API verbunden.

## Pros and Cons of the Options

### React + Vite + Express + Prisma + PostgreSQL

* Gut, weil moderne Frontendstruktur mit schnellem Dev-Server (Vite)
* Gut, weil modulare, wartbare Backendstruktur mit typisierten Prisma-DB-Zugriffen
* Gut, weil unterstützt lokale Entwicklung und Containerbetrieb (Docker)
* Schlecht, weil Cross-Origin-Kommunikation muss manuell berücksichtigt werden (Cookies, Ports)

### React + Vite + Express + PostgreSQL (ohne ORM)

* Good, because maximale Kontrolle über SQL und DB-Design
* Bad, because höherer Entwicklungsaufwand bei Queries, Validation und Migrationen
* Bad, because fehlende Typsicherheit bei Datenbankzugriffen
