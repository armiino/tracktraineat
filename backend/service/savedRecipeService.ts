import { SavedRecipeRepository } from "../adapter/port/SavedRecipeRepository";
import { RecipePort } from "../adapter/port/RecipePort";
import { SavedRecipeModel, SavedRecipeCreateInput } from "../model/SavedRecipe";

export function savedRecipeService(
  repo: SavedRecipeRepository,
  recipeProvider: RecipePort
) {
  return {
    async save(userId: string, spoonId: number): Promise<SavedRecipeModel> {
      let data;
      try {
        data = await recipeProvider.getRecipeDetails(spoonId);
      } catch (err: any) {
        const error = new Error("Rezept konnte nicht geladen werden");
        (error as any).code = err.code ?? "recipe_not_found";
        throw error;
      }

      if (!data) {
        const err: any = new Error("Rezept nicht gefunden");
        err.code = "recipe_not_found";
        throw err;
      }

      const recipe: SavedRecipeCreateInput = {
        userId,
        spoonId,
        title: data.title,
        image: data.image,
        calories: Math.round(data.calories),
        protein: Math.round(data.protein),
        fat: Math.round(data.fat),
        carbs: Math.round(data.carbs),
        ingredients: data.ingredients,
        instructions: data.instructions,
      };

      try {
        const saved = await repo.saveRecipe(recipe);
        return {
          ...saved,
          id: saved.id,
          createdAt: saved.createdAt,
        };
      } catch (err: any) {
        const wrapped = new Error("Speichern des Rezepts fehlgeschlagen");
        (wrapped as any).code = err.code ?? "save_recipe_failed";
        throw wrapped;
      }
    },

    async getAll(userId: string) {
      try {
        return await repo.getSavedRecipes(userId);
      } catch (err: any) {
        const wrapped = new Error(
          "Fehler beim Laden der gespeicherten Rezepte"
        );
        (wrapped as any).code = err.code ?? "load_saved_recipes_failed";
        throw wrapped;
      }
    },

    async delete(userId: string, spoonId: number) {
      try {
        await repo.deleteSavedRecipe(userId, spoonId);
      } catch (err: any) {
        const wrapped = new Error("Fehler beim Löschen des Rezepts");
        (wrapped as any).code = err.code ?? "saved_recipe_delete_failed";
        throw wrapped;
      }
    },
  };
}
