export interface SavedRecipeModel {
  id: string;
  userId: string;
  spoonId: number;
  title: string;
  image: string;
  calories: number;
  protein: number;
  fat?: number;
  carbs?: number;
  ingredients: any;
  instructions: string;
  createdAt: Date;
}
export type SavedRecipeCreateInput = Omit<SavedRecipeModel, "id" | "createdAt">;
