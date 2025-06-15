import axios from 'axios';
import { RecipePort } from '../port/RecipePort';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

export class SpoonacularAdapter implements RecipePort {
  async searchRecipesByCaloriesAndProtein(
    calories: number,
    protein: number,
    dietType?: 'vegan' | 'vegetarian' | 'pescetarian' | 'omnivore'
  ): Promise<any[]> {
    const response = await axios.get(`${BASE_URL}/recipes/findByNutrients`, {
      params: {
        minCalories: calories - 100,
        maxCalories: calories + 100,
        minProtein: protein - 5,
        number: 5,
        apiKey: SPOONACULAR_API_KEY,
        diet: dietType !== 'omnivore' ? dietType : undefined,
      },
    });

    return response.data;
  }
}
