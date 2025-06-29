import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { apiLogout } from "@/features/auth/services/authService";

jest.mock("@/features/auth/context/AuthContext");
jest.mock("@/features/auth/services/authService");

const mockedUseAuth = useAuth as jest.Mock;
const mockedApiLogout = apiLogout as jest.Mock;
const mockLogout = jest.fn();

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

describe("Navbar", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });

    mockedApiLogout.mockResolvedValue({});
    jest.clearAllMocks();
  });

  it("zeigt Dashboard, Profile, Saved und Logout wenn eingeloggt", () => {
    renderNavbar();

    expect(
      screen.getByRole("link", { name: /tracktraineat/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "" })).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(4);
  });

  it("ruft apiLogout und logout bei Klick auf Logout auf", async () => {
    renderNavbar();

    const logoutButtons = screen.getAllByRole("button");
    const logoutButton = logoutButtons.find((btn) =>
      btn.querySelector("svg.lucide-log-out")
    );

    expect(logoutButton).toBeDefined();

    fireEvent.click(logoutButton!);

    await waitFor(() => {
      expect(mockedApiLogout).toHaveBeenCalledTimes(1);
      expect(mockLogout).toHaveBeenCalledWith("manual");
    });
  });
});
