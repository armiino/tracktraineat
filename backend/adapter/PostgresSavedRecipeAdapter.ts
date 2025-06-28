import { SavedRecipeRepository } from "./port/SavedRecipeRepository";
import { PrismaClient } from "@prisma/client";
import { SavedRecipeCreateInput } from "../model/SavedRecipe";

export class PostgresSavedRecipeAdapter implements SavedRecipeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveRecipe(data: SavedRecipeCreateInput) {
    return this.prisma.savedRecipe.create({
      data: {
        userId: data.userId,
        spoonId: data.spoonId,
        title: data.title,
        image: data.image,
        calories: Math.round(data.calories ?? 0),
        protein: Number(data.protein) || 0,
        fat: Number(data.fat) || 0,
        carbs: Number(data.carbs) || 0,
        ingredients: data.ingredients ?? [],
        instructions: data.instructions ?? "",
      },
    });
  }

  async getSavedRecipes(userId: string) {
    return this.prisma.savedRecipe.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteSavedRecipe(userId: string, spoonId: number): Promise<void> {
    await this.prisma.savedRecipe.deleteMany({
      where: { userId, spoonId },
    });
  }
}
