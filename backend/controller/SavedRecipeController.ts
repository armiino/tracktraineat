import { Request, Response } from "express";
import { SaveRecipeRequestDto } from "../dto/SaveRecipeDto";
import { validate } from "class-validator";
import { RequestWithUser } from "../globalTypes/RequestWithUser";

export class SavedRecipeController {
  constructor(
    private readonly service: ReturnType<
      typeof import("../service/savedRecipeService").savedRecipeService
    >
  ) {}

  private getUserId(req: RequestWithUser): string | null {
    return req.user?.id ?? null;
  }

  async saveRecipe(req: RequestWithUser, res: Response): Promise<void> {
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
    } catch (err: any) {
      this.handleError(err, res, {
        recipe_already_saved: 409,
        recipe_not_found: 404,
        save_recipe_failed: 500,
      });
    }
  }

  async getRecipes(req: RequestWithUser, res: Response): Promise<void> {
    const userId = this.getUserId(req);

    if (!userId) {
      res.status(400).json({ code: "missing_user_id" });
      return;
    }

    try {
      const recipes = await this.service.getAll(userId);
      res.status(200).json(recipes);
    } catch (err: any) {
      this.handleError(err, res, {
        load_saved_recipes_failed: 500,
      });
    }
  }

  async deleteRecipe(req: RequestWithUser, res: Response): Promise<void> {
    const userId = this.getUserId(req);
    const spoonId = Number(req.params?.spoonId);

    if (!userId || isNaN(spoonId)) {
      res.status(400).json({ code: "invalid_input" });
      return;
    }

    try {
      await this.service.delete(userId, spoonId);
      res.status(204).send();
    } catch (err: any) {
      this.handleError(err, res, {
        saved_recipe_delete_failed: 500,
      });
    }
  }

  private handleError(
    err: any,
    res: Response,
    codeMap: { [code: string]: number }
  ): void {
    const code = err.code || "unknown_error";
    const status = codeMap[code] || 500;

    if (status === 500) {
      console.error("[Controller Error]", err);
    }

    res.status(status).json({ code });
  }
}
