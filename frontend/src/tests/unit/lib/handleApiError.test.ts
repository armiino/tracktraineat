import { handleApiError } from "@/lib/handleApiError";
import { toast } from "react-hot-toast";

jest.mock("react-hot-toast", () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe("handleApiError", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("zeigt Fehlermeldung bei Netzwerkfehler", () => {
    const error = { message: "Network Error" };
    handleApiError(error);
    expect(toast.error).toHaveBeenCalledWith(
      "Netzwerkfehler – bitte Verbindung prüfen."
    );
  });

  it("zeigt passende Fehlermeldung für Backend-Code", () => {
    const error = {
      response: {
        data: {
          code: "login_failed",
        },
      },
    };
    handleApiError(error);
    expect(toast.error).toHaveBeenCalledWith("Anmeldung fehlgeschlagen!");
  });

  it("zeigt Fehlermeldung bei Validation Error mit Details", () => {
    const error = {
      response: {
        status: 400,
        data: {
          details: [
            { constraints: { isEmail: "E-Mail ist ungültig." } },
            { constraints: { isNotEmpty: "Passwort darf nicht leer sein." } },
          ],
        },
      },
    };

    handleApiError(error);
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("E-Mail ist ungültig.")
    );
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Passwort darf nicht leer sein.")
    );
  });

  it("zeigt message aus Response", () => {
    const error = {
      response: {
        data: {
          message: "Ein Fehler ist aufgetreten.",
        },
      },
    };
    handleApiError(error);
    expect(toast.error).toHaveBeenCalledWith("Ein Fehler ist aufgetreten.");
  });

  it("zeigt fallbackMessage bei unbekanntem Fehler", () => {
    const error = {
      response: {
        status: 418,
        data: {},
      },
    };
    handleApiError(error, "Standardfehler");
    expect(toast.error).toHaveBeenCalledWith("Standardfehler");
  });
});
