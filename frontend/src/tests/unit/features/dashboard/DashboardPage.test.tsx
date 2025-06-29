import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import Dashboard from "@/features/dashboard/pages/DashboardPage";
import { useProfile } from "@/features/profile/context/ProfileContext";
import * as dashboardService from "@/features/dashboard/services/dashboardService";
import { BrowserRouter } from "react-router-dom";

jest.mock("@/features/profile/context/ProfileContext", () => ({
  useProfile: jest.fn(),
}));

jest.mock("@/features/dashboard/services/dashboardService", () => ({
  dashboardService: {
    generateMeals: jest.fn(),
  },
}));

jest.mock("@/lib/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

const resetMock = jest.fn();

jest.mock("@/features/dashboard/hook/useDailyNutrition", () => ({
  useDailyNutrition: () => ({
    value: 2000,
    setValue: jest.fn(),
    reset: resetMock,
  }),
}));

jest.mock(
  "@/features/dashboard/components/MealPlanForm",
  () => (props: any) =>
    (
      <div>
        <p>Formular geöffnet</p>
        <button
          onClick={() =>
            props.onGenerate({
              mealsPerDay: 1,
              mealDistribution: [100],
            })
          }
        >
          Generieren
        </button>
      </div>
    )
);

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("zeigt Ladezustand, wenn Profil geladen wird", () => {
    (useProfile as jest.Mock).mockReturnValue({ isLoading: true });
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    expect(screen.getByText(/lade dashboard/i)).toBeInTheDocument();
  });

  it("zeigt Hinweis, wenn kein Profil vorhanden ist", () => {
    (useProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      profile: null,
    });
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    expect(screen.getByText(/kein profil gefunden/i)).toBeInTheDocument();
  });

  it("öffnet und schließt das Mealplan-Formular", async () => {
    (useProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      profile: {},
    });
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const button = screen.getByRole("button", { name: /mealplan/i });
    fireEvent.click(button);
    expect(await screen.findByText(/formular geöffnet/i)).toBeInTheDocument();

    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText(/formular geöffnet/i)).not.toBeInTheDocument();
    });
  });

  it("generiert einen Mealplan und zeigt Warnungen", async () => {
    (useProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      profile: { dietType: "none" },
    });

    (
      dashboardService.dashboardService.generateMeals as jest.Mock
    ).mockResolvedValue({
      meals: {
        meal1: [
          {
            id: 1,
            title: "Testrezept",
            image: "test.jpg",
            calories: 400,
            protein: 20,
            source: null,
          },
        ],
      },
      warnings: ["Warnung 1"],
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /mealplan/i }));
    fireEvent.click(await screen.findByText(/generieren/i));

    await waitFor(() => {
      expect(screen.getByText(/testrezept/i)).toBeInTheDocument();
      expect(screen.getByText(/warnung 1/i)).toBeInTheDocument();
    });
  });

  it("setzt Kalorien und Protein zurück", () => {
    (useProfile as jest.Mock).mockReturnValue({
      isLoading: false,
      profile: {},
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByTitle(/kalorien zurücksetzen/i));
    fireEvent.click(screen.getByTitle(/protein zurücksetzen/i));
    expect(resetMock).toHaveBeenCalledTimes(2);
  });
});
