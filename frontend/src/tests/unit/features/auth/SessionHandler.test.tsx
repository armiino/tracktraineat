import { render } from "@testing-library/react";
import SessionHandler from "@/features/auth/utils/SessionHandler";
import { useAuth } from "@/features/auth/context/AuthContext";
import { registerSessionHandler } from "@/lib/api";
import { useNavigate, useLocation } from "react-router-dom";

// Mocks
jest.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));
jest.mock("@/lib/api", () => ({
  registerSessionHandler: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe("SessionHandler", () => {
  const logoutMock = jest.fn();
  const navigateMock = jest.fn();
  const mockLocation = { pathname: "/dashboard" };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ logout: logoutMock });
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);
    (useLocation as jest.Mock).mockReturnValue(mockLocation);
  });

  it("registriert den Logout-Handler und navigiert bei geschütztem Pfad", () => {
    let callback: (reason?: string) => void = () => {};

    (registerSessionHandler as jest.Mock).mockImplementation((cb) => {
      callback = cb;
    });

    render(<SessionHandler />);

    callback("expired");

    expect(logoutMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/login", {
      replace: true,
      state: { error: "expired" },
    });
  });

  it("navigiert nicht, wenn Pfad nicht geschützt ist", () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: "/public" });

    let callback: (reason?: string) => void = () => {};
    (registerSessionHandler as jest.Mock).mockImplementation((cb) => {
      callback = cb;
    });

    render(<SessionHandler />);
    callback("unauthorized");

    expect(logoutMock).toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
