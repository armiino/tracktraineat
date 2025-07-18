import { RecipePort } from "../adapter/port/RecipePort";
import { RecipeQueryDto } from "../dto/RecipeQueryDto";
import { userProfileService } from "./userProfileService";
export type UserProfileService = ReturnType<typeof userProfileService>;

type DietType = "vegan" | "vegetarian" | "pescetarian" | "omnivore";

export const recipeService = (
  recipeProvider: RecipePort,
  userProfileService: UserProfileService
) => ({
  async getRecipesForUser(userId: string) {
    const profile = await userProfileService.getProfile(userId);
    if (!profile) {
      const err = new Error("Kein Profil vorhanden") as any;
      err.code = "profile_not_found";
      throw err;
    }

    const totalCalories = profile.calculateCaloriesProfile();
    const proteinTarget =
      profile.weight * (profile.goal === "gainMuscle" ? 2 : 1.5);

    const recipes = await recipeProvider.searchRecipesByCaloriesAndProtein(
      totalCalories,
      proteinTarget,
      profile.dietType as DietType
    );

    return { totalCalories, targetProtein: proteinTarget, recipes };
  },

  async getMealPlan(userId: string, dto: RecipeQueryDto) {
    const profile = await userProfileService.getProfile(userId);
    if (!profile) {
      const err = new Error("Kein Profil vorhanden") as any;
      err.code = "profile_not_found";
      throw err;
    }

    const totalCalories = profile.calculateCaloriesProfile(dto.burned);
    const { mealDistribution } = dto;
    const dietType: DietType = dto.dietType ?? "omnivore";
    const proteinTarget =
      profile.weight * (profile.goal === "gainMuscle" ? 2 : 1.5);

    const usedRecipeIds = new Set<number>();
    const groups = groupMealDistribution(mealDistribution);
    const meals: Record<string, any[]> = {};
    const warnings: string[] = [];

    for (const [shareKey, indices] of Object.entries(groups)) {
      const share = parseInt(shareKey) / 1000;
      const caloriesForMeal = Math.round(totalCalories * share);
      const proteinForMeal = Math.round(proteinTarget * share);
      const wantedRecipes = indices.length * 3;

      let recipes = await recipeProvider.searchRecipesByCaloriesAndProtein(
        caloriesForMeal,
        proteinForMeal,
        dietType,
        wantedRecipes
      );

      recipes = recipes.filter((r) => !usedRecipeIds.has(r.id));
      recipes.forEach((r) => usedRecipeIds.add(r.id));
      const recipeGroups = groupRecipes(recipes, 3, indices.length);

      for (let i = 0; i < indices.length; i++) {
        const idx = indices[i];
        const group = recipeGroups[i] || [];

        if (group.length > 0) {
          meals[`meal${idx + 1}`] = group.map((r) => ({
            ...r,
            source: "standard",
          }));
        } else {
          await handleFallbacks({
            idx,
            caloriesForMeal,
            proteinForMeal,
            dietType,
            recipeProvider,
            usedRecipeIds,
            meals,
            warnings,
          });
        }
      }
    }

    return {
      totalCalories,
      targetProtein: proteinTarget,
      meals,
      warnings,
    };
  },

  async getRecipeDetails(spoonId: number) {
    return recipeProvider.getRecipeDetails(spoonId);
  },
});

function groupMealDistribution(mealDistribution: number[]) {
  const groups: Record<number, number[]> = {};
  mealDistribution.forEach((share, idx) => {
    const key = Math.round(share * 1000);
    if (!groups[key]) groups[key] = [];
    groups[key].push(idx);
  });
  return groups;
}

function groupRecipes(recipes: any[], size: number, count: number) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(recipes.slice(i * size, i * size + size));
  }
  return result;
}

async function handleFallbacks({
  idx,
  caloriesForMeal,
  proteinForMeal,
  dietType,
  recipeProvider,
  usedRecipeIds,
  meals,
  warnings,
}: {
  idx: number;
  caloriesForMeal: number;
  proteinForMeal: number;
  dietType: "vegan" | "vegetarian" | "pescetarian" | "omnivore";
  recipeProvider: RecipePort;
  usedRecipeIds: Set<number>;
  meals: Record<string, any[]>;
  warnings: string[];
}) {
  const parts = caloriesForMeal > 1500 ? [0.4, 0.35, 0.25] : [0.6, 0.4];
  const fallbackLabels = ["a", "b", "c"];

  for (let j = 0; j < parts.length; j++) {
    const calSplit = Math.round(caloriesForMeal * parts[j]);
    const protSplit = Math.round(proteinForMeal * parts[j]);

    let splitRecipes = await recipeProvider.searchRecipesByCaloriesAndProtein(
      calSplit,
      protSplit,
      dietType,
      3
    );

    splitRecipes = splitRecipes
      .filter((r) => !usedRecipeIds.has(r.id))
      .map((r) => ({
        ...r,
        source: "fallbackWithProtein",
        splitRatio: parts[j],
      }));
    splitRecipes.forEach((r) => usedRecipeIds.add(r.id));

    if (splitRecipes.length === 0) {
      splitRecipes = await recipeProvider.searchRecipesByCaloriesAndProtein(
        calSplit,
        0,
        dietType,
        3
      );

      splitRecipes = splitRecipes
        .filter((r) => !usedRecipeIds.has(r.id))
        .map((r) => ({
          ...r,
          source: "fallbackNoProtein",
          splitRatio: parts[j],
        }));
      splitRecipes.forEach((r) => usedRecipeIds.add(r.id));

      if (splitRecipes.length > 0) {
        warnings.push(
          `Mahlzeit ${idx + 1}${
            fallbackLabels[j]
          } wurde ohne Proteinziel erstellt.`
        );
      }
    }

    if (splitRecipes.length > 0) {
      meals[`meal${idx + 1}${fallbackLabels[j]}`] = splitRecipes;
    } else {
      warnings.push(
        `Für Mahlzeit ${idx + 1}${
          fallbackLabels[j]
        } konnten keine Rezepte gefunden werden.`
      );
    }
  }
}

export type RecipeService = ReturnType<typeof recipeService>;
