import React, { useState } from "react";
import { Utensils, BarChart3 } from "lucide-react";
import { validateDistribution } from "@/features/dashboard/validation/validateDistribution";

interface MealPlanFormProps {
  onGenerate: (data: {
    mealsPerDay: number;
    mealDistribution: number[];
  }) => void;
}

export default function MealPlanForm({
  onGenerate,
}: Readonly<MealPlanFormProps>) {
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [distribution, setDistribution] = useState([40, 30, 30]);
  const [error, setError] = useState("");

  const handleMealCountChange = (value: number) => {
    setMealsPerDay(value);
    const defaultDistributions: Record<number, number[]> = {
      2: [50, 50],
      3: [40, 30, 30],
      4: [25, 25, 25, 25],
    };
    setDistribution(defaultDistributions[value] || []);
  };

  const handleChange = (index: number, value: number) => {
    const updated = [...distribution];
    updated[index] = value > 70 ? 70 : value;
    setDistribution(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errorMessage = validateDistribution(distribution);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setError("");
    onGenerate({ mealsPerDay, mealDistribution: distribution });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/70 backdrop-blur-sm border border-gray-200 p-6 rounded-2xl shadow-md max-w-xl mx-auto mb-10"
    >
      <h3 className="text-2xl font-bold mb-5 text-center text-gray-800 flex items-center justify-center gap-2">
        <Utensils className="w-6 h-6 text-gray-700" />
        Mealplan erstellen
      </h3>

      <label
        htmlFor="mealCount"
        className="block mb-2 font-medium text-gray-700"
      >
        Anzahl Mahlzeiten pro Tag (2–4)
      </label>
      <select
        id="mealCount"
        value={mealsPerDay}
        onChange={(e) => handleMealCountChange(Number(e.target.value))}
        className="w-full p-3 border border-gray-300 rounded-xl mb-5 focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        <option value={2}>2 Mahlzeiten</option>
        <option value={3}>3 Mahlzeiten</option>
        <option value={4}>4 Mahlzeiten</option>
      </select>

      <label className="block mb-2 font-medium text-gray-700" htmlFor={`meal-0`}>
  Verteilung der Mahlzeiten (%)
</label>
<div className={`grid grid-cols-${mealsPerDay} gap-3 mb-2`}>
  {Array.from({ length: mealsPerDay }).map((_, index) => {
    const inputId = `meal-distribution-${index}`;
    return (
      <div key={inputId} className="w-full">
        <label htmlFor={inputId} className="sr-only">
          Mahlzeit {index + 1}
        </label>
        <input
          id={inputId}
          type="number"
          min={0}
          max={70}
          step={mealsPerDay === 4 ? 1 : 10}
          value={distribution[index] ?? 0}
          onChange={(e) => handleChange(index, Number(e.target.value))}
          className="w-full p-3 border border-gray-300 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
    );
  })}
</div>



      <p className="text-center text-sm text-gray-500 mb-4">
        Aktuelle Summe:{" "}
        <strong>{distribution.reduce((a, b) => a + b, 0)}%</strong>
      </p>

      {error && (
        <p className="text-red-600 text-sm mb-4 text-center font-medium">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-neutral-800 text-white py-3 rounded-xl hover:bg-neutral-700 transition-colors duration-200 font-semibold flex items-center justify-center gap-2"
      >
        <BarChart3 className="w-5 h-5" />
        Rezepte generieren
      </button>
    </form>
  );
}
