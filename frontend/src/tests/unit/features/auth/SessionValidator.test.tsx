import { render } from "@testing-library/react";
import SessionValidator from "@/features/auth/utils/SessionValidator";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLocation } from "react-router-dom";
import * as authService from "@/features/auth/services/authService";
import * as errorHandler from "@/lib/handleApiError";

jest.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
}));
jest.mock("@/features/auth/services/authService", () => ({
  validate: jest.fn(),
}));
jest.mock("@/lib/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

describe("SessionValidator", () => {
  const loginMock = jest.fn();
  const logoutMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      login: loginMock,
      logout: logoutMock,
    });
  });

  it("ruft login auf, wenn Sitzung gültig", async () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: "/dashboard" });
    (authService.validate as jest.Mock).mockResolvedValueOnce({
      data: { authenticated: true },
    });

    render(<SessionValidator />);

    await new Promise((r) => setTimeout(r, 0));

    expect(authService.validate).toHaveBeenCalled();
    expect(loginMock).toHaveBeenCalled();
    expect(logoutMock).not.toHaveBeenCalled();
  });

  it("ruft logout auf, wenn Sitzung ungültig", async () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: "/profile" });
    (authService.validate as jest.Mock).mockResolvedValueOnce({
      data: { authenticated: false },
    });

    render(<SessionValidator />);

    await new Promise((r) => setTimeout(r, 0));

    expect(authService.validate).toHaveBeenCalled();
    expect(logoutMock).toHaveBeenCalled();
  });

  it("zeigt Fehler, wenn validate() fehlschlägt", async () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: "/saved" });
    const err = new Error("server down");
    (authService.validate as jest.Mock).mockRejectedValueOnce(err);

    render(<SessionValidator />);

    await new Promise((r) => setTimeout(r, 0));

    expect(authService.validate).toHaveBeenCalled();
    expect(errorHandler.handleApiError).toHaveBeenCalledWith(
      err,
      expect.stringContaining("Verbindung")
    );
  });

  it("macht nichts, wenn Pfad nicht geschützt ist", async () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: "/public" });

    render(<SessionValidator />);

    await new Promise((r) => setTimeout(r, 0));

    expect(authService.validate).not.toHaveBeenCalled();
    expect(loginMock).not.toHaveBeenCalled();
    expect(logoutMock).not.toHaveBeenCalled();
  });
});
