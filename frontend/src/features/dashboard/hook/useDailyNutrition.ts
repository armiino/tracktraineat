import { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboardService";
import { handleApiError } from "@/lib/handleApiError";

export function useDailyNutrition(type: "calories" | "protein" = "calories") {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const remainingKey = `remaining${capitalize(type)}`;
    const dailyKey = `daily${capitalize(type)}`;
    const resetKey = `${type}ResetDate`;

    const stored = localStorage.getItem(remainingKey);
    const resetDate = localStorage.getItem(resetKey) === today;

    if (resetDate && stored) {
      setValue(Number(stored));
      return;
    }

    (async () => {
      try {
        const { totalCalories, totalProtein } =
          await dashboardService.getCalorieCalculation();

        const newVal = type === "calories" ? totalCalories : totalProtein;

        setValue(newVal);
        localStorage.setItem(remainingKey, newVal.toString());
        localStorage.setItem(dailyKey, newVal.toString());
        localStorage.setItem(resetKey, today);
      } catch (err) {
        handleApiError(err, `Fehler beim Laden von ${type}.`);
      }
    })();
  }, [type]);

  const reset = async () => {
    try {
      const { totalCalories, totalProtein } =
        await dashboardService.getCalorieCalculation();

      const newVal = type === "calories" ? totalCalories : totalProtein;

      setValue(newVal);
      localStorage.setItem(`remaining${capitalize(type)}`, newVal.toString());
      localStorage.setItem(`daily${capitalize(type)}`, newVal.toString());
      localStorage.setItem(`${type}ResetDate`, new Date().toDateString());
    } catch (err) {
      handleApiError(err, `Fehler beim Zurücksetzen von ${type}.`);
    }
  };

  return {
    value,
    setValue,
    reset,
  };
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
