import { render, screen, fireEvent } from "@testing-library/react";
import SavedRecipeModal, {
  SavedRecipeModalProps,
} from "@/features/myRecipes/components/SavedRecipaModal";

const mockOnClose = jest.fn();

const mockRecipe = {
  spoonId: 12345,
  id: 1,
  title: "Test Rezept",
  image: "https://example.com/image.jpg",
  instructions: "<p>Zubereitungsschritte</p>",
  ingredients: [
    { name: "Haferflocken", amount: 50, unit: "g" },
    { name: "Milch", amount: 200, unit: "ml" },
  ],
  calories: 350,
  protein: 25,
  fat: 10,
  carbs: 45,
};

const defaultProps: SavedRecipeModalProps = {
  isOpen: true,
  onClose: mockOnClose,
  recipeData: mockRecipe,
};

describe("SavedRecipeModal", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("rendert korrekt mit übergebenen Rezeptdaten", () => {
    render(<SavedRecipeModal {...defaultProps} />);

    expect(screen.getByText("Test Rezept")).toBeInTheDocument();
    expect(screen.getByAltText("Test Rezept")).toHaveAttribute(
      "src",
      mockRecipe.image
    );
    expect(screen.getByText("Zubereitungsschritte")).toBeInTheDocument();
    expect(screen.getByText(/Haferflocken/)).toBeInTheDocument();
    expect(screen.getByText(/Milch/)).toBeInTheDocument();
    expect(screen.getByText(/350 kcal/)).toBeInTheDocument();
    expect(screen.getByText(/25 g/)).toBeInTheDocument();
  });

  it("ruft onClose auf, wenn auf X geklickt wird", () => {
    render(<SavedRecipeModal {...defaultProps} />);

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
