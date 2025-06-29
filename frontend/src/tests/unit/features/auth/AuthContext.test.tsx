import React from "react";
import { render, waitFor, act, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/features/auth/context/AuthContext";
import { validate } from "@/features/auth/services/authService";
import { registerSessionHandler } from "@/lib/api";
import { MemoryRouter } from "react-router-dom";

jest.mock("@/features/auth/services/authService", () => ({
  validate: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  registerSessionHandler: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const TestComponent = () => {
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="auth">{isAuthenticated ? "true" : "false"}</p>
      <p data-testid="loading">{isLoading ? "true" : "false"}</p>
      <button onClick={login}>Login</button>
      <button onClick={() => logout("manual")}>Logout</button>
    </div>
  );
};

const renderWithProvider = (initialPath = "/dashboard") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </MemoryRouter>
  );

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initialisiert isAuthenticated aus validate()", async () => {
    (validate as jest.Mock).mockResolvedValue({
      data: { authenticated: true },
    });

    const { getByTestId } = renderWithProvider();

    await waitFor(() => {
      expect(getByTestId("auth").textContent).toBe("true");
      expect(getByTestId("loading").textContent).toBe("false");
    });
  });

  it("setzt isAuthenticated auf false bei Fehler", async () => {
    (validate as jest.Mock).mockRejectedValue(new Error("fail"));

    const { getByTestId } = renderWithProvider();

    await waitFor(() => {
      expect(getByTestId("auth").textContent).toBe("false");
      expect(getByTestId("loading").textContent).toBe("false");
    });
  });

  it("führt login korrekt aus", async () => {
    (validate as jest.Mock).mockResolvedValue({
      data: { authenticated: false },
    });

    const { getByText, getByTestId } = renderWithProvider();

    fireEvent.click(getByText("Login"));

    expect(getByTestId("auth").textContent).toBe("true");
  });

  it("führt logout korrekt aus", async () => {
    (validate as jest.Mock).mockResolvedValue({
      data: { authenticated: true },
    });

    const { getByText, getByTestId } = renderWithProvider();

    fireEvent.click(getByText("Logout"));

    expect(getByTestId("auth").textContent).toBe("false");

    expect(mockNavigate).toHaveBeenCalledWith("/login", {
      replace: true,
      state: { info: "logout" },
    });
  });

  it("redirectet bei geschützter Route nach 401", async () => {
    let registeredCallback: any;

    (validate as jest.Mock).mockResolvedValue({
      data: { authenticated: true },
    });

    (registerSessionHandler as jest.Mock).mockImplementation((cb) => {
      registeredCallback = cb;
    });

    renderWithProvider("/dashboard");

    await waitFor(() => expect(registeredCallback).toBeDefined());

    await act(() => registeredCallback("unauthorized"));

    expect(mockNavigate).toHaveBeenCalledWith("/login", {
      replace: true,
      state: { error: "unauthorized" },
    });
  });

  it("redirectet nicht bei öffentlicher Route nach 401", async () => {
    let registeredCallback: any;

    (validate as jest.Mock).mockResolvedValue({
      data: { authenticated: true },
    });

    (registerSessionHandler as jest.Mock).mockImplementation((cb) => {
      registeredCallback = cb;
    });

    renderWithProvider("/about");

    await waitFor(() => expect(registeredCallback).toBeDefined());

    await act(() => registeredCallback("expired"));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
