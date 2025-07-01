
# Ausfallsichere Architektur

TrackTrainEat nutzt die externe Spoonacular API, um Rezepte und Nährwerte dynamisch zu beziehen. Da externe Dienste potenziell instabil oder begrenzt verfügbar sein können, ist es essenziell, diese Anbindung robust zu gestalten.

## Zielsetzung

Die Anbindung an Spoonacular soll:

- **Ausfallsicher** gegenüber Netzwerkfehlern, Timeouts oder temporären Ausfällen sein
- **Fehler verständlich** und differenziert zurückmelden
- **Testbar und austauschbar** bleiben (Mocking möglich)
- **Sauber gekapselt** in der Infrastruktur bleiben

---

## Technische Umsetzung

### 1. Ports & Adapter Pattern

Die Spoonacular-Kommunikation erfolgt über das Interface `RecipePort`, das von einem `SpoonacularAdapter` implementiert wird. Dadurch ist die eigentliche Logik (Service-Schicht) unabhängig von HTTP, axios oder der Spoonacular-Struktur.

```plaintext
[Service] → [RecipePort] → [SpoonacularAdapter] → [Spoonacular API]
````

Diese Entkopplung erhöht die Testbarkeit und erlaubt z. B. das Mocking des Ports für Unit- und Integrationstests.

---

### 2. Retry-Logik mit `axios-retry`

Der Adapter nutzt `axios-retry`, um automatische Wiederholungen bei temporären Fehlern (z. B. Netzwerkfehler, Rate-Limits) auszuführen:

```ts
import axiosRetry from "axios-retry";

axiosRetry(axios, {
  retries: 2,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => {
    const status = error?.response?.status;
    return (
      axiosRetry.isNetworkError(error) ||
      axiosRetry.isRetryableError(error) ||
      [400, 401, 402, 429, 500, 502, 503].includes(status)
    );
  },
  onRetry: (retryCount, error, requestConfig) => {
    console.log(`Retry #${retryCount} für Anfrage: ${requestConfig.url}`);
  },
});
```

Diese Wiederholungsstrategie schützt vor kurzzeitigen Instabilitäten und verbessert die User Experience.

---

### 3. Fehlerbehandlung und Logging

Der Adapter kapselt alle Fehler, ordnet sie semantisch ein und wirft sie mit einem einheitlichen Format zurück:

```ts
if ([401, 402, 403].includes(status)) {
  wrapped.message = `${status}: API-Key ungültig oder überschritten`;
  wrapped.code = "spoonacular_auth_error";
}
```

Dies ermöglicht differenziertes Verhalten im Service (z. B. eigene Fehlermeldungen, Monitoring, etc.).

---

### 4. Vorteile

* **Fehlerrobustheit:** Wiederholbare Fehler führen nicht sofort zum Abbruch.
* **Entkopplung:** Die Services können mit gemocktem Port getestet werden.
* **Skalierbarkeit:** Die Architektur erlaubt auch alternative Datenquellen.
* **Wartbarkeit:** Änderungen an der API erfordern nur Anpassungen im Adapter.

---

## Fazit

Durch den Einsatz von Retry-Logik, klaren Fehlercodes und die saubere Trennung zwischen Domäne und Infrastruktur erfüllt TrackTrainEat die Anforderungen an eine ausfallsichere Architektur.

Die Spoonacular-Anbindung ist nicht nur funktional, sondern auch fehlertolerant und testbar implementiert – ein zentrales Qualitätsmerkmal dieser Anwendung.

---

## zusätzliche Fehlerbehandlung im Frontend

Auch im Frontend von **TrackTrainEat** wird auf Ausfallsicherheit geachtet.
Dazu zählt insbesondere ein global definierter **Axios-Interceptor**, der auf bestimmte Fehlercodes und Netzwerkprobleme reagiert:

```ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.warn("Server nicht erreichbar.");
      return Promise.reject(new Error("Server nicht erreichbar."));
    }

    const status = error.response.status;

    if ((status === 401 || status === 403) && logoutHandler) {
      const reason: LogoutReason = status === 403 ? "expired" : "unauthorized";
      logoutHandler(reason);
    }

    if (status === 500) {
      toast.error("Interner Serverfehler. Bitte versuche es später erneut.");
    }

    return Promise.reject(new Error("Unbekannter Fehler"));
  }
);
```

### Funktionen dieses Mechanismus:

* **Netzwerkfehler-Erkennung:** Erkennt fehlende Serverantworten (z.B. Backend down - wenn das vorkommt gitb es kein Response..).
* **Session-Management:** Bei `401` (unauthorized) oder `403` (expired) wird ein globaler Logout ausgelöst.
* **User-Feedback:** Bei `500`-Fehlern zeigt ein `toast.error(...)` dem User verständliche Fehlermeldungen.
* **Globale Abdeckung:** Der Interceptor greift bei **allen Axios-Requests**, egal aus welchem Teil der Anwendung.

---
 Diese zusätzliche Fehlerbehandlung ergänzt die Retry-Strategien im Backend und stellt sicher, dass Benutzer auch bei Ausfällen ein sinnvolles Feedback erhalten oder korrekt abgemeldet werden.
