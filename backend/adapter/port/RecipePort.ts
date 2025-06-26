export interface RecipePort {
    searchRecipesByCaloriesAndProtein(
      calories: number,
      protein: number,
      dietType?: 'vegan' | 'vegetarian' | 'pescetarian' | 'omnivore',
      number?: number
    ): Promise<any[]>;
    getRecipeDetails(spoonId: number): Promise<any>;
  }
  