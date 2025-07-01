---
status: "accepted"
date: 2025-06-30
decision-makers: [Armin Merdan]
consulted: []
informed: []
---

# Anwendung einer hexagonalen Architektur (Ports & Adapters)

## Context and Problem Statement

Die Anwendung *TrackTrainEat* erfordert eine modulare und testbare Backend-Architektur, die Geschäftslogik, Web-API, Datenzugriff und externe Services klar voneinander trennt.  
Das Ziel war eine langfristig wartbare Struktur mit möglichst geringer Kopplung an Frameworks wie Express oder Prisma – insbesondere im Hinblick auf die Alleinentwicklung, künftige Erweiterbarkeit und testbare Services.

## Decision Drivers

* Entkopplung von Infrastruktur und Domäne
* Testbarkeit und Austauschbarkeit (Mocking, Unit-Tests)
* Klare Verantwortlichkeitstrennung (z. B. Controller vs. Service vs. Adapter)
* Modularität und Lesbarkeit für langfristige Wartung
* Vorbereitung auf Erweiterungen oder Technologie-Änderungen (z. B. alternative API oder DB)

## Considered Options

* **Hexagonale Architektur (Ports & Adapters)** (→ gewählt)
* Klassisches **MVC** mit Logik in Controllern und direkten Prisma-Zugriffen
* Vollständige **Clean Architecture** nach Uncle Bob (mit Interactors, UseCases etc.)

## Decision Outcome

Chosen option: "Hexagonale Architektur (Ports & Adapters)", weil sie eine gute Balance aus Struktur, Verantwortlichkeitstrennung und pragmatischer Umsetzbarkeit bietet – ohne den Overhead und die Komplexität einer vollständigen Clean Architecture.

### Consequences

* Gut, weil die Geschäftslogik ist unabhängig von Express oder Prisma testbar
* Gut, weil die Datenzugriffsschicht ist durch Interfaces abstrahiert und austauschbar
* Gut, weil die Struktur erlaubt skalierbare Erweiterungen (neue Services, externe APIs etc.)
* Neutral, weil es sich um eine pragmatisch reduzierte Version von Clean Architecture handelt
* Schlecht, weil der initiale Aufbau mit Interfaces, Adaptern und Struktur mehr Aufwand bedeutet

### Confirmation

Die Implementierung folgt durchgängig dem Muster:

- **Controller** übernehmen nur Routing, Validierung und delegieren an Services
- **Services** enthalten ausschließlich Domänenlogik, frei von technischen Abhängigkeiten
- **Ports** (zB. `SavedRecipeRepository`, `UserProfilePort`) abstrahieren den Zugriff
- **Adapter** (zB. `PostgresUserProfileAdapter`, `SpoonacularAdapter`) implementieren die Ports
- **Prisma und Express** sind vollständig gekapselt in Adapter- bzw. Infrastruktur-Schichten

Das Backend zeigt damit einen konsistenten, hexagonal inspirierten Aufbau mit klarer Trennung – wie etwa im `UserProfileService`, im Rezeptmodul und bei der Authentifizierung sichtbar.

## Pros and Cons of the Options

### Hexagonale Architektur (Ports & Adapters)

* Gut, weil Testbarkeit, Lesbarkeit und Erweiterbarkeit gewährleistet sind
* Gut, weil technische Abhängigkeiten einfach austauschbar sind
* Gut, weil jede Schicht klar abgegrenzt ist (Controller ↔ Service ↔ Adapter)
* Neutral, weil etwas strukturierter als nötig für kleine Projekte
* Schlecht, weil zusätzliche Abstraktion anfangs mehr Zeit kostet

### Klassisches MVC

* Gut, weil einfacher Start und schnellere Umsetzung in kleinen Teams
* Schlecht, weil Logik und Datenzugriffe oft vermischt werden
* Schlecht, weil direkte Kopplung an Prisma, Express etc. Testbarkeit erschwert
* Schlecht, weil langfristig schwerer wartbar und modular erweiterbar

### Clean Architecture

* Gut, weil maximale Trennung und hohe Skalierbarkeit
* Schlecht, weil hoher konzeptioneller Overhead für kleine/mittlere Projekte
* Schlecht, weil viele Layer, auch wenn nur leicht genutzte UseCases vorhanden wären

## More Information

Die Architektur ist stark an die hexagonale Struktur angelehnt, aber pragmatisch umgesetzt:  
Auf explizite UseCases oder Presenter-Schichten wird bewusst verzichtet, um unnötige Komplexität zu vermeiden.  
Der Fokus liegt auf einer **isolierten, gut testbaren Domäne**, sauber getrennten Verantwortlichkeiten und einer **klaren Adapterstruktur**.
