import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import { BrowserRouter } from "react-router-dom";
import * as authService from "@/features/auth/services/authService";
import * as toastModule from "react-hot-toast";
import * as errorHandler from "@/lib/handleApiError";

jest.mock("@/features/auth/services/authService", () => ({
  register: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

const renderRegister = () =>
  render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  );

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("zeigt Validierungsfehler bei leerem Formular", async () => {
    renderRegister();

    fireEvent.click(screen.getByRole("button", { name: /registrieren/i }));

    await waitFor(() => {
      expect(toastModule.toast.error).toHaveBeenCalledWith(
        expect.stringContaining("E-Mail")
      );
    });
  });

  it("führt Registrierung durch und zeigt Erfolgsmeldung", async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({});

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/passwort/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /registrieren/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        email: "test@mail.com",
        password: "123456",
      });

      expect(toastModule.toast.success).toHaveBeenCalledWith(
        "Registrierung erfolgreich!"
      );
    });
  });

  it("behandelt API-Fehler korrekt", async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce(
      new Error("Fehler")
    );

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/passwort/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /registrieren/i }));

    await waitFor(() => {
      expect(errorHandler.handleApiError).toHaveBeenCalled();
    });
  });
});
