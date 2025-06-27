import {
  SavedRecipeModel,
  SavedRecipeCreateInput,
} from "../../model/SavedRecipe";

export interface SavedRecipeRepository {
  saveRecipe(data: SavedRecipeCreateInput): Promise<SavedRecipeModel>;
  getSavedRecipes(userId: string): Promise<SavedRecipeModel[]>;
  deleteSavedRecipe(userId: string, spoonId: number): Promise<void>;
}
