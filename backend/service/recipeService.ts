import { RecipePort } from '../port/RecipePort';
import { RecipeQueryDto } from '../dto/RecipeQueryDto';
import { userProfileService } from './userProfileService';
export type UserProfileService = ReturnType<typeof userProfileService>;

export const recipeService = (
  recipeProvider: RecipePort,
  userProfileService: UserProfileService
) => ({
  async getRecipesForUser(userId: string) {
    const profile = await userProfileService.getProfile(userId);
    if (!profile) throw new Error('Kein Profil vorhanden');

    const totalCalories = profile.calculateCaloriesProfile();
    const proteinTarget = profile.weight * (profile.goal === 'gainMuscle' ? 2 : 1.5);

    const recipes = await recipeProvider.searchRecipesByCaloriesAndProtein(
      totalCalories,
      proteinTarget,
      profile.dietType
    );

    return { totalCalories, targetProtein: proteinTarget, recipes };
  },

  async getMealPlan(userId: string, dto: RecipeQueryDto) {
    const profile = await userProfileService.getProfile(userId);
    if (!profile) throw new Error('Kein Profil vorhanden');

    const totalCalories = profile.calculateCaloriesProfile(dto.burned);
    const { mealsPerDay, mealDistribution, dietType } = dto;
    const proteinTarget = profile.weight * (profile.goal === 'gainMuscle' ? 2 : 1.5);
    const proteinPerMeal = proteinTarget / mealsPerDay;

    const meals: any = {};

    for (let i = 0; i < mealsPerDay; i++) {
      const caloriesForMeal = Math.round(totalCalories * mealDistribution[i]);

      const recipes = await recipeProvider.searchRecipesByCaloriesAndProtein(
        caloriesForMeal,
        proteinPerMeal,
        dietType
      );

      meals[`meal${i + 1}`] = recipes;
    }

    return { totalCalories, meals };
  }
});

export type RecipeService = ReturnType<typeof recipeService>;
