// src/pages/SavedRecipes.tsx
import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useNavigate } from "react-router-dom";
import SavedRecipeModal from "../components/SavedRecipaModal";
import { BookOpenCheck, Trash2 } from "lucide-react";
import { SavedRecipe } from "@/globalTypes/recipe";
import { handleApiError } from "@/lib/handleApiError";
import { savedRecipeService } from "../services/savedRecipeService";

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSavedRecipes = async () => {
    try {
      const res = await savedRecipeService.getAll();
      setRecipes(res.data);
    } catch (err) {
      handleApiError(err, "Fehler beim Laden der gespeicherten Rezepte.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (spoonId: number) => {
    try {
      await savedRecipeService.delete(spoonId);
      setRecipes((prev) => prev.filter((r) => r.spoonId !== spoonId));
    } catch (err) {
      handleApiError(err, "Fehler beim Löschen der gespeicherten Rezepte.");
    }
  };

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-10">
      <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-sm border border-neutral-200 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3 text-neutral-900 border-b border-neutral-300 pb-4">
          <BookOpenCheck className="w-7 h-7" />
          Meine Rezepte
        </h1>

        {loading ? (
          <p className="text-center text-gray-600">
            Lade gespeicherte Rezepte...
          </p>
        ) : recipes.length === 0 ? (
          <p className="text-center text-gray-600">
            Keine gespeicherten Rezepte gefunden.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
                onClick={() => {
                  setSelectedRecipe(recipe);
                  setIsModalOpen(true);
                }}
              >
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <h4 className="text-lg font-semibold text-center mb-1">
                  {recipe.title}
                </h4>
                <p className="text-sm text-gray-700 mb-1">
                  {recipe.calories} kcal
                </p>
                <p className="text-sm text-gray-700 mb-1">{recipe.protein} g</p>
                <p className="text-xs text-gray-500">
                  {new Date(recipe.createdAt).toLocaleString()}
                </p>

                <div className="mt-auto pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // verhindert Modal-Öffnung(öffnen sich normal on cklick)
                      deleteRecipe(recipe.spoonId);
                    }}
                    className="mx-auto block text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 underline hover:text-blue-800"
          >
            Zurück zum Dashboard
          </button>
        </div>
        {selectedRecipe && (
          <SavedRecipeModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedRecipe(null);
            }}
            recipeData={selectedRecipe}
            onDelete={deleteRecipe}
          />
        )}
      </div>
    </div>
  );
}
