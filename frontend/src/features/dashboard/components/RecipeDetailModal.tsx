import { useEffect, useState } from "react";
import parse from "html-react-parser";
import { X, Check } from "lucide-react";
import { dashboardService } from "@/features/dashboard/services/dashboardService";
import { handleApiError } from "@/lib/handleApiError";
import { RecipeDetail } from "@/globalTypes/recipe";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

interface RecipeDetailModalProps {
  spoonId: number;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (usedCalories: number, usedProtein?: number) => void;
}

export default function RecipeDetailModal({
  spoonId,
  isOpen,
  onClose,
  onSave,
}: RecipeDetailModalProps) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !spoonId) return;
    setLoading(true);

    dashboardService
      .getRecipeDetailById(spoonId)
      .then(setRecipe)
      .catch((err) => {
        handleApiError(err, "Rezept konnte nicht geladen werden.");
        setRecipe(null);
      })
      .finally(() => setLoading(false));
  }, [spoonId, isOpen]);

  const handleSave = async () => {
    try {
      await dashboardService.saveRecipeToProfile(spoonId);
      if (onSave && recipe?.calories) {
        onSave(recipe.calories, recipe.protein);
      }
      onClose();
    } catch (err) {
      handleApiError(err, "Rezept konnte nicht gespeichert werden.");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50">
        <DialogPanel className="bg-white p-6 rounded max-w-lg w-full">
          {loading || !recipe ? (
            <p className="text-center text-gray-500">Lade Rezept...</p>
          ) : (
            <>
              <DialogTitle className="text-xl font-bold mb-2">
                {recipe.title}
              </DialogTitle>
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <div className="mb-2 text-gray-700 text-sm">
                {parse(recipe.instructions || "")}
              </div>

              <h4 className="font-semibold mt-4 mb-1">Zutaten:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-800">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index}>
                    {ing.amount} {ing.unit} {ing.name}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-sm text-gray-600">
                <p>Kalorien: {Math.round(recipe.calories)} kcal</p>
                <p>Protein: {Math.round(recipe.protein)} g</p>
              </div>

              <div className="flex justify-end mt-6 gap-2">
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                  title="Abbrechen"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 rounded-full bg-green-600 hover:bg-green-700 transition"
                  title="Speichern"
                >
                  <Check className="w-5 h-5 text-white" />
                </button>
              </div>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
