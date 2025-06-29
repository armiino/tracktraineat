import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import SavedRecipes from "@/features/myRecipes/pages/SavedRecipesPage";
import { savedRecipeService } from "@/features/myRecipes/services/savedRecipeService";
import { handleApiError } from "@/lib/handleApiError";
import { BrowserRouter } from "react-router-dom";

jest.mock("@/features/myRecipes/services/savedRecipeService", () => ({
  savedRecipeService: {
    getAll: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/lib/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

const mockRecipes = [
  {
    spoonId: 123,
    title: "Test Rezept",
    image: "test.jpg",
    calories: 500,
    protein: 40,
    createdAt: new Date().toISOString(),
  },
];

describe("SavedRecipes Logik", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lädt gespeicherte Rezepte beim Mount", async () => {
    (savedRecipeService.getAll as jest.Mock).mockResolvedValueOnce({
      data: mockRecipes,
    });

    render(
      <BrowserRouter>
        <SavedRecipes />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(savedRecipeService.getAll).toHaveBeenCalled();
      expect(screen.getByText("Test Rezept")).toBeInTheDocument();
    });
  });

  it("löscht ein Rezept und entfernt es aus der Liste", async () => {
    (savedRecipeService.getAll as jest.Mock).mockResolvedValueOnce({
      data: mockRecipes,
    });
    (savedRecipeService.delete as jest.Mock).mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <SavedRecipes />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Rezept")).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId("delete-button-123");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(savedRecipeService.delete).toHaveBeenCalledWith(123);
      expect(screen.queryByText("Test Rezept")).not.toBeInTheDocument();
    });
  });

  it("behandelt Fehler beim Laden", async () => {
    (savedRecipeService.getAll as jest.Mock).mockRejectedValueOnce(
      new Error("Fehler beim Laden")
    );

    render(
      <BrowserRouter>
        <SavedRecipes />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining("Fehler beim Laden")
      );
    });
  });
});
