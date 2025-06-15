export interface RecipePort {
    searchRecipesByCaloriesAndProtein(
      calories: number,
      protein: number,
      dietType?: 'vegan' | 'vegetarian' | 'pescetarian' | 'omnivore'
    ): Promise<any[]>;
  }
  