import { SavedRecipeRepository } from "../adapter/port/SavedRecipeRepository";
import { RecipePort } from "../adapter/port/RecipePort";
import { SavedRecipeModel, SavedRecipeCreateInput } from "../model/SavedRecipe";
import { Prisma } from "@prisma/client";

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
        const knownCodes = ["spoonacular_auth_error", "spoonacular_not_found"];
        const code = knownCodes.includes(err.code)
          ? "save_recipe_failed"
          : "recipe_not_found";

        const error = new Error("Rezept konnte nicht geladen werden");
        (error as any).code = code;
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
        console.log("Repo.saveRecipe input:", recipe);
        return {
          ...saved,
          id: saved.id,
          createdAt: saved.createdAt,
        };
      } catch (err: any) {
        console.error("SAVE ERROR", err);

        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          const error = new Error("Rezept bereits gespeichert");
          (error as any).code = "recipe_already_saved";
          throw error;
        }

        const error = new Error("Speichern des Rezepts fehlgeschlagen");
        (error as any).code = "save_recipe_failed";
        throw error;
      }
    },

    async getAll(userId: string) {
      try {
        return await repo.getSavedRecipes(userId);
      } catch (err: any) {
        const error = new Error("Fehler beim Laden der gespeicherten Rezepte");
        (error as any).code = "load_saved_recipes_failed";
        throw error;
      }
    },

    async delete(userId: string, spoonId: number) {
      try {
        await repo.deleteSavedRecipe(userId, spoonId);
      } catch (err: any) {
        const error = new Error("Fehler beim Löschen des Rezepts");
        (error as any).code = "saved_recipe_delete_failed";
        throw error;
      }
    },
  };
}
