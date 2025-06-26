import { Request, Response } from "express";
import { SaveRecipeRequestDto } from "../dto/SaveRecipeDto";
import { validate } from "class-validator";

export class SavedRecipeController {
  constructor(
    private readonly service: ReturnType<
      typeof import("../service/savedRecipeService").savedRecipeService
    >
  ) {}

  private getUserId(req: Request): string | null {
    return (req as any).user?.id ?? null;
  }

  async saveRecipe(req: Request, res: Response): Promise<void> {
    const userId = this.getUserId(req);

    const dto = new SaveRecipeRequestDto();
    Object.assign(dto, req.body);

    const errors = await validate(dto);
    if (!userId || errors.length > 0) {
      res.status(400).json({ code: "invalid_input" });
      return;
    }

    try {
      const saved = await this.service.save(userId, dto.spoonId);
      res.status(201).json(saved);
    } catch (error: any) {
      if (error.code === "recipe_already_saved") {
        res.status(409).json({ code: "recipe_already_saved" });
      } else if (error.code === "recipe_not_found") {
        res.status(404).json({ code: "recipe_not_found" });
      } else {
        res.status(500).json({ code: "save_recipe_failed" });
      }
    }
  }

  async getRecipes(req: Request, res: Response): Promise<void> {
    const userId = this.getUserId(req);

    if (!userId) {
      res.status(400).json({ code: "missing_user_id" });
      return;
    }

    try {
      const recipes = await this.service.getAll(userId);
      res.json(recipes);
    } catch (error: any) {
      res.status(500).json({ code: "load_saved_recipes_failed" });
    }
  }

  async deleteRecipe(req: Request, res: Response): Promise<void> {
    const userId = this.getUserId(req);
    const spoonId = Number(req.params?.spoonId);

    if (!userId || isNaN(spoonId)) {
      res.status(400).json({ code: "invalid_input" });
      return;
    }

    try {
      await this.service.delete(userId, spoonId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ code: "saved_recipe_delete_failed" });
    }
  }
}
