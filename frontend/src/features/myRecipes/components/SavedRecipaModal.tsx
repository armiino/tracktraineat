import parse from "html-react-parser";
import { X } from "lucide-react";
import { RecipeDetail } from "@/globalTypes/recipe";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

interface SavedRecipe extends RecipeDetail {
  spoonId: number;
}

interface SavedRecipeModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly recipeData: SavedRecipe;
  readonly onDelete: (spoonId: number) => void;
}

export default function SavedRecipeModal({
  isOpen,
  onClose,
  recipeData,
}: SavedRecipeModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50">
        <DialogPanel className="bg-white p-6 rounded-xl max-w-lg w-full relative shadow-xl">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <DialogTitle className="text-xl font-bold mb-3">
            {recipeData.title}
          </DialogTitle>

          <img
            src={recipeData.image}
            alt={recipeData.title}
            className="w-full h-48 object-cover rounded mb-4"
          />

          <div className="mb-2 text-gray-700 text-sm">
            {parse(recipeData.instructions || "")}
          </div>

          <h4 className="font-semibold mt-4 mb-1">Zutaten:</h4>
          <ul className="list-disc pl-5 text-sm text-gray-800">
            {recipeData.ingredients.map((ing) => (
              <li key={ing.name}>
                {ing.amount} {ing.unit} {ing.name}
              </li>
            ))}
          </ul>

          <div className="mt-4 text-sm text-gray-600">
            <p>Kalorien: {recipeData.calories} kcal</p>
            <p>Protein: {recipeData.protein} g</p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
