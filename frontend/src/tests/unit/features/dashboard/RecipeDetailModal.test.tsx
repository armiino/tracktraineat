import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RecipeDetailModal from "@/features/dashboard/components/RecipeDetailModal";
import { dashboardService } from "@/features/dashboard/services/dashboardService";
import { handleApiError } from "@/lib/handleApiError";

jest.mock("@/features/dashboard/services/dashboardService", () => ({
  dashboardService: {
    getRecipeDetailById: jest.fn(),
    saveRecipeToProfile: jest.fn(),
  },
}));

jest.mock("@/lib/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

const mockRecipe = {
  title: "Testrezept",
  image: "test.jpg",
  instructions: "<p>Zubereitung...</p>",
  ingredients: [
    { name: "Reis", amount: 200, unit: "g" },
    { name: "Hähnchen", amount: 150, unit: "g" },
  ],
  calories: 600,
  protein: 45,
  fat: 20,
  carbs: 50,
};

describe("RecipeDetailModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("zeigt Ladezustand und lädt Rezeptdaten", async () => {
    (dashboardService.getRecipeDetailById as jest.Mock).mockResolvedValueOnce(
      mockRecipe
    );

    render(
      <RecipeDetailModal spoonId={123} isOpen={true} onClose={jest.fn()} />
    );

    expect(screen.getByText(/lade rezept/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Testrezept")).toBeInTheDocument();
      expect(screen.getByText(/Reis/)).toBeInTheDocument();
      expect(screen.getByText(/600 kcal/)).toBeInTheDocument();
    });
  });

  it("ruft handleApiError auf bei Fehler beim Laden", async () => {
    const error = new Error("Ladefehler");
    (dashboardService.getRecipeDetailById as jest.Mock).mockRejectedValueOnce(
      error
    );

    render(
      <RecipeDetailModal spoonId={123} isOpen={true} onClose={jest.fn()} />
    );

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        error,
        "Rezept konnte nicht geladen werden."
      );
    });
  });

  it("speichert Rezept und ruft onSave & onClose auf", async () => {
    const mockOnSave = jest.fn();
    const mockOnClose = jest.fn();

    (dashboardService.getRecipeDetailById as jest.Mock).mockResolvedValueOnce(
      mockRecipe
    );
    (dashboardService.saveRecipeToProfile as jest.Mock).mockResolvedValueOnce(
      {}
    );

    render(
      <RecipeDetailModal
        spoonId={456}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => screen.getByText("Testrezept"));

    fireEvent.click(screen.getByRole("button", { name: /speichern/i }));

    await waitFor(() => {
      expect(dashboardService.saveRecipeToProfile).toHaveBeenCalledWith(456);
      expect(mockOnSave).toHaveBeenCalledWith(600, 45);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("zeigt Fehler beim Speichern", async () => {
    const error = new Error("Speicherfehler");

    (dashboardService.getRecipeDetailById as jest.Mock).mockResolvedValueOnce(
      mockRecipe
    );
    (dashboardService.saveRecipeToProfile as jest.Mock).mockRejectedValueOnce(
      error
    );

    render(
      <RecipeDetailModal spoonId={456} isOpen={true} onClose={jest.fn()} />
    );

    await waitFor(() => screen.getByText("Testrezept"));

    fireEvent.click(screen.getByRole("button", { name: /speichern/i }));

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        error,
        "Rezept konnte nicht gespeichert werden."
      );
    });
  });
});
