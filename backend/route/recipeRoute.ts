import express from 'express';
import { RecipeController } from '../controller/recipeController';
import { SpoonacularAdapter } from '../adapter/spoonacularAdapter';
import { recipeService } from '../service/recipeService';
import { requireAuth } from '../middleware/authMiddleware';

export const createRecipeRoute = () => {
  const adapter = new SpoonacularAdapter();
  const service = recipeService(adapter);
  const controller = new RecipeController(service);

  const router = express.Router();

  router.get('/recipes', requireAuth, (req, res) => controller.getRecipes(req, res));
  router.post('/mealplan', requireAuth, (req, res) => controller.getMealPlan(req, res));

  return router;
};
