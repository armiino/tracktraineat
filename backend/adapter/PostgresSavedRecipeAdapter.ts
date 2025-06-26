import { SavedRecipeRepository } from "./port/SavedRecipeRepository";
import { PrismaClient, Prisma } from "@prisma/client";
import { SavedRecipeCreateInput } from "../model/SavedRecipe";

export class PostgresSavedRecipeAdapter implements SavedRecipeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveRecipe(data: SavedRecipeCreateInput) {
    try {
      return await this.prisma.savedRecipe.create({
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
    } catch (err) {
      this.handleDbError(err, "Fehler beim Speichern des Rezepts");
    }
  }

  async getSavedRecipes(userId: string) {
    try {
      return await this.prisma.savedRecipe.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch (err) {
      this.handleDbError(err, "Fehler beim Laden der gespeicherten Rezepte");
    }
  }

  async deleteSavedRecipe(userId: string, spoonId: number) {
    try {
      await this.prisma.savedRecipe.deleteMany({
        where: { userId, spoonId },
      });
    } catch (err) {
      this.handleDbError(err, "Fehler beim Löschen des Rezepts");
    }
  }

  private handleDbError(err: unknown, message: string): never {
    console.error(`[DB Error] ${message}:`, err);

    const error = new Error(message) as any;

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        error.code = "recipe_already_saved";
      } else {
        error.code = "db_query_error";
      }
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
      error.code = "db_not_available";
    } else {
      error.code = "db_unknown_error";
    }

    throw error;
  }
}
