
# Installation & Start – *TrackTrainEat*

Willkommen bei der Anwendung **TrackTrainEat** (PostgreSQL + Express/Node.js + Prisma + Vite/React).

---

## Voraussetzungen

Installiert:

- [Docker](https://www.docker.com/) + Docker Compose
- Node.js optional falls lokal weiter entwickelt wird.
---

## Projektstruktur (Auszug)

```
tracktraineat/
│
├── backend/
│   ├── Dockerfile
│   ├── prisma/
│         ├── schema.prisma
│         └── migrations/
│   
│
├── frontend/
│   ├── Dockerfile
│   └── src/
│
├── docker-compose.yml
├── .env.docker
└── README.md / install.md (install.md liegt in docs)
```

---

## .env.docker Beispiel

Erstelle eine Datei namens `.env.docker` im Root:

copy paste auch möglich, nur der spoonacular API-Key muss getauscht werden.

```env
# PostgreSQL DB
POSTGRES_USER=postgresUser
POSTGRES_PASSWORD=defaultPassword
POSTGRES_DB=tracktraineatDB

# Prisma + Backend
DATABASE_URL=postgresql://postgresUser:defaultPassword@tracktraineat-db-dev:5432/tracktraineatDB
JWT_SECRET=geheimertokenkey
SPOONACULAR_API_KEY=dein_api_key_hier_muss_ausgetauscht_werden
```

---

## Starten des Projekts mit Docker

```bash
docker-compose up --build
```

Das wird:

1. die PostgreSQL-Datenbank starten (`tracktraineat-db-dev`)
2. den Backend-Container bauen und starten
3. Prisma-Migrationen anwenden & Client generieren (step ist wichtig beim ersten Build)
4. den Frontend-Container starten

Sobald alle Container laufen:

- Backend: [http://localhost:8000](http://localhost:8000)
- Frontend: [http://localhost:5173](http://localhost:5173)

Bei lokaler entwicklung und Nutzung ohne docker muss im backend Ordner eine .env angelegt werden!!
---

## Datenbank

Die PostgreSQL-Daten werden in einem Docker-Volume (`pgdata`) gespeichert. Der Container verwendet Umgebungsvariablen aus `.env.docker`.

Die Datenbank wird bei jedem Start geprüft und alle vorhandenen **Prisma-Migrationen automatisch angewendet** (`npx prisma migrate deploy`).

---

## Backend: Besonderheiten

**Backend-Startprozess (automatisiert im Container):**

```bash
npx prisma generate          # Generiert Prisma Client
npx prisma migrate deploy    # Wendet Migrationen an
npm run dev                  # Startet Backend über ts-node
```

→ Diese Befehle laufen bei jedem Container-Start automatisch und sind nötig, sonst müsste man das manuell einmal machen!

---

## Container stoppen

```bash
docker-compose down
```

Optional mit Volume löschen:

```bash
docker-compose down -v
```

---

## Tipps für die Entwicklung

- Willst du Code im Backend live testen?  
  → Änderungen im `./backend` Ordner werden durch Volume-Mounting übernommen.

- Du kannst auch lokal entwickeln ohne Docker, wenn du willst – dann brauchst du `npm install`, eine lokale PostgreSQL-Instanz und `DATABASE_URL` in einer `.env`, die im backend Ordner hinterlegt wird. In diesem ist auch eine Docker-Compose.yml die den Rest macht. Die Datenbank wird aber erst korrekt laufen wenn diese Befehle ausgeführt wurden:

```bash
npx prisma generate          # Generiert Prisma Client
npx prisma migrate deploy    # Wendet Migrationen an
npm run dev                  # Startet Backend über ts-node
```
und natürich die Start Skripte:

```bash
cd backend/ npm run dev
cd frontend/ npm run dev
```

---


## Probleme?

- **.env.docker?** → API-Key gesetzt? 
- **Fehlende Tabellen**? Stelle sicher, dass alle Migrationen im `prisma/migrations/` Verzeichnis korrekt sind.
- **Frontend lädt nicht?** Warte etwas nach dem Start – Vite braucht ein paar Sekunden.

---

## Setup-Test

> Du weißt, dass alles funktioniert, wenn du...

- ... die TrackTrainEat-App auf `localhost:5173` erreichbar ist
- ... das Frontend erscheint (Frontend läuft)
- ... du einen User registrieren kannst (DB läuft - Backend läuft)

---
