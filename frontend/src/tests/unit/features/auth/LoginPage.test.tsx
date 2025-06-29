import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import * as authService from "@/features/auth/services/authService";
import * as toastModule from "react-hot-toast";
import * as errorHandler from "@/lib/handleApiError";
import { useAuth } from "@/features/auth/context/AuthContext";

jest.mock("@/features/auth/context/AuthContext");
jest.mock("@/features/auth/services/authService");
jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("@/lib/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ login: jest.fn() });
  });

  const renderLogin = () =>
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

  it("zeigt Validierungsfehler bei leerem Formular", async () => {
    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(toastModule.toast.error).toHaveBeenCalledWith(
        expect.stringContaining("E-Mail")
      );
    });
  });

  it("führt Login durch bei gültigen Eingaben", async () => {
    const loginMock = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ login: loginMock });
    (authService.login as jest.Mock).mockResolvedValueOnce({});

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/passwort/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: "test@mail.com",
        password: "123456",
      });
      expect(loginMock).toHaveBeenCalled();
      expect(toastModule.toast.success).toHaveBeenCalledWith(
        "Login erfolgreich"
      );
    });
  });

  it("zeigt Fehler bei fehlgeschlagenem Login", async () => {
    (authService.login as jest.Mock).mockRejectedValueOnce(new Error("fail"));

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/passwort/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(errorHandler.handleApiError).toHaveBeenCalled();
    });
  });
});
