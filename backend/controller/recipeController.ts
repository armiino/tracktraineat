import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { RecipeQueryDto } from '../dto/RecipeQueryDto';
import { RecipeService } from '../service/recipeService';

export class RecipeController {
 // constructor(private readonly recipeService: ReturnType<typeof import('../service/recipeService').recipeService>) {}
 constructor(private readonly recipeService: RecipeService) {}
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

    const dto = new RecipeQueryDto();
    dto.mealsPerDay = req.body.mealsPerDay;
    dto.mealDistribution = req.body.mealDistribution;
    dto.burned = req.body.burned;
    dto.dietType = req.body.dietType;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.map(e => ({
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
      res.status(400).json({ error: error.message });
    }
  }
}
