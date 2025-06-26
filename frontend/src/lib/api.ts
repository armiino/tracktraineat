import axios from "axios";
import { toast } from "react-hot-toast";

type LogoutReason = "unauthorized" | "expired" | "manual" | undefined;

let logoutHandler: ((reason?: LogoutReason) => void) | null = null;

export const registerSessionHandler = (
  handler: (reason?: LogoutReason) => void
) => {
  logoutHandler = handler;
};

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

//interceptor global-> fängt definierte codes ab
api.interceptors.response.use(
  (response) => response,
  (error) => {
    //netzwerkfehler wie backend down liefert kein objekt und der response ist leer.. auch kein statuscode
    if (!error.response) {
      console.warn("Server nicht erreichbar.");
      // toast.error("Keine Verbindung zum Server.");
      return Promise.reject(error);
    }

    const status = error.response.status;

    //401 und 403 soll Logout-Handler triggern -> rauswurf
    if ((status === 401 || status === 403) && logoutHandler) {
      console.log("Interceptor triggert logout mit status: ", status);
      const reason: LogoutReason = status === 403 ? "expired" : "unauthorized";
      logoutHandler(reason);
    }

    //500er soll nur toast anzeigen ohne logout
    if (status === 500) {
      toast.error("Interner Serverfehler. Bitte versuche es später erneut.");
    }

    return Promise.reject(error);
  }
);

export default api;
