import axios from "axios";
import { RecipePort } from "./port/RecipePort";

export class SpoonacularAdapter implements RecipePort {
  // private readonly apiKey: string | undefined = process.env.SPOONACULAR_API_KEY;
  private get apiKey(): string | undefined {
    return process.env.SPOONACULAR_API_KEY;
  }

  private readonly baseUrl = "https://api.spoonacular.com";

  private ensureApiKey() {
    if (!this.apiKey) {
      const err = new Error("API-Key fehlt") as any;
      err.code = "spoonacular_missing_key";
      throw err;
    }
  }

  private mapDietTypeToSpoonacular(dietType?: string): string | undefined {
    if (dietType === "vegan" || dietType === "vegetarian") {
      return dietType;
    }
    return undefined;
  }

  async searchRecipesByCaloriesAndProtein(
    calories: number,
    protein: number,
    dietType?: "vegan" | "vegetarian" | "omnivore",
    number: number = 10
  ): Promise<any[]> {
    this.ensureApiKey();
    const diet = this.mapDietTypeToSpoonacular(dietType);

    try {
      const response = await axios.get(
        `${this.baseUrl}/recipes/complexSearch`,
        {
          params: {
            diet,
            excludeIngredients:
              diet === "vegetarian" || diet === "vegan"
                ? "beef,pork,chicken,meat,ham,sausage,bacon"
                : undefined,
            minCalories: calories - 80,
            maxCalories: calories + 80,
            minProtein: protein - 10,
            maxProtein: protein + 20,
            number,
            addRecipeNutrition: true,
            apiKey: this.apiKey,
          },
        }
      );

      return response.data.results.map((r: any) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        calories: r.nutrition?.nutrients?.find(
          (n: any) => n.name === "Calories"
        )?.amount,
        protein: r.nutrition?.nutrients?.find((n: any) => n.name === "Protein")
          ?.amount,
        fat: r.nutrition?.nutrients?.find((n: any) => n.name === "Fat")?.amount,
        carbs: r.nutrition?.nutrients?.find(
          (n: any) => n.name === "Carbohydrates"
        )?.amount,
      }));
    } catch (err: any) {
      const status = err?.response?.status;
      const wrapped = new Error("Fehler bei Spoonacular-Anfrage") as any;

      if ([401, 402, 403].includes(status)) {
        wrapped.message = `${status}: Generierung der Rezepte fehlgeschlagen - API-Key überprüfen!`;
        wrapped.code = "spoonacular_auth_error";
      } else if (status === 404) {
        wrapped.message = `${status}: Keine Rezepte gefunden`;
        wrapped.code = "spoonacular_not_found";
      } else {
        wrapped.message = `${status ?? "unknown"}: Fehler von Spoonacular`;
        wrapped.code = "spoonacular_unknown_error";
      }

      throw wrapped;
    }
  }

  async getRecipeDetails(spoonId: number): Promise<any> {
    this.ensureApiKey();

    try {
      const { data } = await axios.get(
        `${this.baseUrl}/recipes/${spoonId}/information`,
        {
          params: {
            apiKey: this.apiKey,
            includeNutrition: true,
          },
        }
      );

      return {
        id: data.id,
        title: data.title,
        image: data.image,
        instructions: data.instructions,
        ingredients: data.extendedIngredients?.map((ing: any) => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
        })),
        calories: data.nutrition?.nutrients?.find(
          (n: any) => n.name === "Calories"
        )?.amount,
        protein: data.nutrition?.nutrients?.find(
          (n: any) => n.name === "Protein"
        )?.amount,
      };
    } catch (err: any) {
      const status = err?.response?.status;

      const wrapped = new Error("Fehler bei Spoonacular-Anfrage") as any;

      if ([401, 402, 403].includes(status)) {
        wrapped.message = `${status}: API-Key ungültig oder überschritten`;
        wrapped.code = "spoonacular_auth_error";
      } else if (status === 404) {
        wrapped.message = `${status}: Rezept nicht gefunden`;
        wrapped.code = "spoonacular_not_found";
      } else {
        wrapped.message = `${status ?? "unknown"}: Fehler von Spoonacular`;
        wrapped.code = "spoonacular_unknown_error";
      }

      throw wrapped;
    }
  }
}
