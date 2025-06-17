import express from 'express';
import { RecipeController } from '../controller/recipeController';
import { SpoonacularAdapter } from '../adapter/spoonacularAdapter';
import { PostgresUserProfileAdapter } from '../adapter/PostgresUserProfileAdapter';
import { userProfileService } from '../service/userProfileService';
import { recipeService } from '../service/recipeService';
import { requireAuth } from '../middleware/authMiddleware';

export const createRecipeRoute = () => {
  const userRepo = new PostgresUserProfileAdapter();
  const userSvc = userProfileService(userRepo);

  const recipeAdapter = new SpoonacularAdapter();
  const recipeSvc = recipeService(recipeAdapter, userSvc);

  const controller = new RecipeController(recipeSvc);

  const router = express.Router();

  router.get('/recipes', requireAuth, (req, res) => controller.getRecipes(req, res));
  router.post('/mealplan', requireAuth, (req, res) => controller.getMealPlan(req, res));

  return router;
};
