import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MealPlanForm from "../components/MealPlanForm";
import RecipeDetailModal from "../components/RecipeDetailModal";
import { useProfile } from "@/features/profile/context/ProfileContext";
import { dashboardService } from "../services/dashboardService";
import { handleApiError } from "@/lib/handleApiError";
import { useDailyNutrition } from "../hook/useDailyNutrition";
import type { Recipe } from "@/globalTypes/recipe";
import {
  Utensils,
  Info,
  RotateCcw,
  Flame,
  BookOpenText,
  Sprout,
  Drumstick,
} from "lucide-react";
import InfoModal from "../components/InfoModal";

export default function Dashboard() {
  const [showMealForm, setShowMealForm] = useState(false);
  const [recipes, setRecipes] = useState<{ [key: string]: Recipe[] }>({});
  const [selectedSpoonId, setSelectedSpoonId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { profile, isLoading } = useProfile();

  const {
    value: calories,
    setValue: setCalories,
    reset: resetCalories,
  } = useDailyNutrition("calories");

  const {
    value: protein,
    setValue: setProtein,
    reset: resetProtein,
  } = useDailyNutrition("protein");

  const handleMealPlanRequest = async (data: {
    mealsPerDay: number;
    mealDistribution: number[];
  }) => {
    try {
      const distribution = data.mealDistribution.map((v) => v / 100);
      const response = await dashboardService.generateMeals({
        mealsPerDay: data.mealsPerDay,
        mealDistribution: distribution,
        burned: 0,
        dietType: profile?.dietType || "none",
      });
      setRecipes(response.meals || {});
      setWarnings(response.warnings || []);
    } catch (err) {
      handleApiError(err, "Mealplan konnte nicht generiert werden.");
      setRecipes({});
      setWarnings([
        "Beim Generieren des Mealplans ist ein Fehler aufgetreten.",
      ]);
    } finally {
      setShowMealForm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mt-20 text-gray-600">Lade Dashboard...</div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-100 px-4 py-10">
        <div className="max-w-xl mx-auto bg-white/70 backdrop-blur-sm border border-neutral-200 rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-neutral-900">
            Kein Profil gefunden
          </h2>
          <p className="mb-4 text-gray-600">
            Bitte lege dein Profil an, um zu starten.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Profil erstellen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-10">
      <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-sm border border-neutral-200 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-neutral-900">
          Track Smart, Eat Good
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {calories !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-neutral-100 text-neutral-800 text-center p-6 rounded-xl shadow-md border border-neutral-200"
            >
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2 text-neutral-900">
                  <Flame className="w-6 h-6 text-amber-500" />
                  Kalorien
                  <Flame className="w-6 h-6 text-amber-500" />
                </h2>
              </div>
              <div className="text-4xl font-bold mb-1">
                {Math.round(calories)} kcal
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-6 mt-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      (calories /
                        (Number(localStorage.getItem("dailyCalories")) || 1)) *
                        100,
                      100
                    )}%`,
                  }}
                  transition={{ duration: 1 }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                Verbleibend von{" "}
                {Math.round(
                  Number(localStorage.getItem("dailyCalories") || "0")
                )}{" "}
                kcal
              </p>

              <button
                onClick={resetCalories}
                className="mt-4 inline-flex items-center justify-center p-2 rounded-full hover:bg-neutral-200 transition"
                title="Kalorien zurücksetzen"
              >
                <RotateCcw className="w-6 h-6 text-neutral-700 hover:text-neutral-900" />
              </button>
            </motion.div>
          )}

          {protein !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-neutral-100 text-neutral-800 text-center p-6 rounded-xl shadow-md border border-neutral-200"
            >
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2 text-neutral-900">
                  <Drumstick className="w-6 h-6 text-indigo-400" />
                  Proteinbedarf
                  <Sprout className="w-6 h-6 text-indigo-400" />
                </h2>
              </div>
              <div className="text-4xl font-bold mb-1">
                {Math.round(protein)} g
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-6 mt-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      (protein /
                        (Number(localStorage.getItem("dailyProtein")) || 1)) *
                        100,
                      100
                    )}%`,
                  }}
                  transition={{ duration: 1 }}
                  className="h-full bg-indigo-400 rounded-full"
                />
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                Verbleibend von{" "}
                {Math.round(
                  Number(localStorage.getItem("dailyProtein") || "0")
                )}{" "}
                g
              </p>

              <button
                onClick={resetProtein}
                className="mt-4 inline-flex items-center justify-center p-2 rounded-full hover:bg-neutral-200 transition"
                title="Protein zurücksetzen"
              >
                <RotateCcw className="w-6 h-6 text-neutral-700 hover:text-neutral-900" />
              </button>
            </motion.div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 mb-6">
          <button
            onClick={() => setShowMealForm(!showMealForm)}
            className="bg-neutral-200 text-neutral-800 font-semibold px-5 py-2 rounded-xl hover:bg-neutral-300 transition"
          >
            {showMealForm ? (
              "Formular schließen"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Utensils className="w-5 h-5" />
                Mealplan
              </span>
            )}
          </button>

          <button
            onClick={() => setShowInfoModal(true)}
            className="flex items-center gap-1 text-sm text-black hover:underline"
          >
            <Info className="w-4 h-4" />
            Info
          </button>
        </div>

        <AnimatePresence>
          {showMealForm && (
            <motion.div
              key="mealForm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <MealPlanForm onGenerate={handleMealPlanRequest} />
            </motion.div>
          )}
        </AnimatePresence>

        {Object.entries(recipes).length > 0 && (
          <div className="mt-10 space-y-8">
            {Object.keys(recipes)
              .sort((a, b) => {
                const [ma, pa = ""] =
                  a.match(/^meal(\d+)([a-z]?)$/i)?.slice(1) || [];
                const [mb, pb = ""] =
                  b.match(/^meal(\d+)([a-z]?)$/i)?.slice(1) || [];
                return parseInt(ma) - parseInt(mb) || pa.localeCompare(pb);
              })
              .map((mealKey) => {
                const meals = recipes[mealKey];
                const match = mealKey.match(/^meal(\d+)([a-z]?)$/i);
                const mealNumber = match ? match[1] : mealKey;
                const mealPart =
                  match && match[2] ? match[2].toUpperCase() : "";
                const sourceLabel = meals.length > 0 ? meals[0]?.source : null;

                let infoText = "";
                if (sourceLabel === "fallbackWithProtein") {
                  infoText = `Hinweis: Diese Teilmahlzeit enthält ca. ${
                    mealPart === "A" ? "60%" : mealPart === "B" ? "40%" : "30%"
                  } des Kalorien-/Protein-Ziels, da die Gesamtmenge zu groß war.`;
                } else if (sourceLabel === "fallbackNoProtein") {
                  infoText = `Hinweis: Diese Teilmahlzeit enthält ca. ${
                    mealPart === "A" ? "60%" : mealPart === "B" ? "40%" : "30%"
                  } des Kalorien-Ziels, jedoch ohne Protein-Ziel, da keine passenden Rezepte gefunden wurden.`;
                }

                return (
                  <div key={mealKey}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-neutral-200 text-neutral-700">
                          <Utensils className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-800">
                          Mahlzeit {mealNumber}
                          {mealPart && (
                            <span className="ml-1 text-base text-neutral-500">
                              ({mealPart})
                            </span>
                          )}
                        </h3>
                      </div>
                    </div>

                    {infoText && (
                      <p className="text-sm text-yellow-600 mb-4 ml-12">
                        {infoText}
                      </p>
                    )}

                    {meals.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {meals.map((recipe) => (
                          <div
                            key={recipe.id}
                            className="bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-xl shadow-sm p-4 flex flex-col justify-between items-center hover:shadow-md transition h-full"
                          >
                            <img
                              src={recipe.image}
                              alt={recipe.title}
                              className="w-full h-40 object-cover rounded mb-3"
                            />
                            <h4 className="text-lg font-semibold text-center mb-1 text-neutral-900">
                              {recipe.title}
                            </h4>
                            <div className="text-sm text-neutral-600 mb-2 text-center">
                              <p>
                                <strong>Kalorien:</strong>{" "}
                                {Math.round(recipe.calories)} kcal
                              </p>
                              <p>
                                <strong>Protein:</strong>{" "}
                                {Math.round(recipe.protein)} g
                              </p>
                            </div>
                            <div className="mt-auto w-full flex justify-center">
                              <button
                                onClick={() => {
                                  setSelectedSpoonId(recipe.id);
                                  setIsModalOpen(true);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-neutral-100 text-neutral-800 rounded-full hover:bg-neutral-200 transition shadow-sm"
                              >
                                <BookOpenText className="w-4 h-4" />
                                Rezept
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600 mt-4 ml-12">
                        Für diese Mahlzeit konnten keine Rezepte gefunden
                        werden. Bitte überprüfe die Verteilung.
                      </div>
                    )}
                  </div>
                );
              })}

            {warnings.length > 0 && (
              <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 mt-10 p-5 rounded-xl">
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  ⚠️ Hinweise zur Zusammenstellung
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
      {selectedSpoonId !== null && (
        <RecipeDetailModal
          spoonId={selectedSpoonId}
          isOpen={isModalOpen}
          onClose={() => {
            setSelectedSpoonId(null);
            setIsModalOpen(false);
          }}
          onSave={(usedCalories: number, usedProtein?: number) => {
            if (calories !== null && !isNaN(usedCalories)) {
              const newCalories = calories - usedCalories;
              setCalories(newCalories);
              localStorage.setItem("remainingCalories", newCalories.toString());
            }

            if (
              protein !== null &&
              usedProtein !== undefined &&
              !isNaN(usedProtein)
            ) {
              const newProtein = protein - usedProtein;
              setProtein(newProtein);
              localStorage.setItem("remainingProtein", newProtein.toString());
            }
          }}
        />
      )}
    </div>
  );
}
