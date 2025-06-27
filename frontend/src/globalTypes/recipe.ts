export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  calories: number;
  protein: number;
  source?: "original" | "fallbackWithProtein" | "fallbackNoProtein";
  splitRatio?: number;
}

export interface RecipeDetail extends Recipe {
  fat: number;
  carbs: number;
  instructions: string;
  ingredients: Ingredient[];
}

export interface SavedRecipe extends RecipeDetail {
  spoonId: number;
  createdAt: string;
}
