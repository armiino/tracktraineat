import { Request, Response } from "express";
import { validate } from "class-validator";
import { RecipeQueryDto } from "../dto/RecipeQueryDto";
import { RecipeService } from "../service/recipeService";
import { RecipeIdParamDto } from "../dto/RecipeIdParamDto";

export class RecipeController {
  // constructor(private readonly recipeService: ReturnType<typeof import('../service/recipeService').recipeService>) {}
  constructor(private readonly recipeService: RecipeService) {}
  async getRecipeDetails(req: Request, res: Response): Promise<void> {
    const dto = Object.assign(new RecipeIdParamDto(), {
      id: parseInt(req.params.id, 10),
    });

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({ code: "invalid_recipe_id" });
      return;
    }

    try {
      const details = await this.recipeService.getRecipeDetails(dto.id);
      res.json(details);
    } catch (error: any) {
      if (error.code === "spoonacular_missing_key") {
        res.status(500).json({ code: error.code, message: error.message });
      } else if (error.code === "spoonacular_auth_error") {
        res
          .status(502)
          .json({ code: error.code, message: "API-Zugriff verweigert." });
      } else if (error.code === "spoonacular_not_found") {
        res
          .status(404)
          .json({ code: error.code, message: "Rezept nicht gefunden." });
      } else {
        console.error("Fehler bei getRecipeDetails:", error);
        res.status(500).json({ code: "get_recipe_details_failed" });
      }
    }
  }

  async getRecipes(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;

    try {
      const recipes = await this.recipeService.getRecipesForUser(userId);
      res.status(200).json(recipes);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMealPlan(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id;

    const dto = Object.assign(new RecipeQueryDto(), req.body);

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({
        error: "Validation failed",
        details: errors.map((e) => ({
          field: e.property,
          constraints: e.constraints,
        })),
      });
      return;
    }

    try {
      const plan = await this.recipeService.getMealPlan(userId, dto);
      res.status(200).json(plan);
    } catch (error: any) {
      if (error.code === "profile_not_found") {
        res.status(404).json({ code: "profile_not_found" });
      } else if (error.code === "spoonacular_missing_key") {
        res.status(500).json({ code: error.code, message: error.message });
      } else {
        console.error("Fehler bei getMealPlan:", error);
        res.status(400).json({ code: "get_mealplan_failed" });
      }
    }
  }
}
