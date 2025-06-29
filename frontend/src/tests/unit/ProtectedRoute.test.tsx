import { render, screen } from "@testing-library/react";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { useAuth } from "@/features/auth/context/AuthContext";
import { MemoryRouter } from "react-router-dom";

jest.mock("@/features/auth/context/AuthContext");

const mockedUseAuth = useAuth as jest.Mock;

const DummyChild = () => <div>Geheimer Inhalt</div>;

const renderProtectedRoute = () =>
  render(
    <MemoryRouter>
      <ProtectedRoute>
        <DummyChild />
      </ProtectedRoute>
    </MemoryRouter>
  );

describe("ProtectedRoute", () => {
  it("zeigt Ladeanzeige während des Ladevorgangs", () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });

    renderProtectedRoute();

    expect(screen.getByText(/lade authentifizierung/i)).toBeInTheDocument();
  });

  it("leitet auf /login weiter wenn nicht authentifiziert", () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    renderProtectedRoute();

    expect(screen.queryByText(/geheimer inhalt/i)).not.toBeInTheDocument();
  });

  it("zeigt Inhalte wenn authentifiziert", () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });

    renderProtectedRoute();

    expect(screen.getByText(/geheimer inhalt/i)).toBeInTheDocument();
  });
});
