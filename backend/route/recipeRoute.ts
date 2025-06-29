import express from "express";
import { RecipeController } from "../controller/recipeController";
import { SpoonacularAdapter } from "../adapter/spoonacularAdapter";
import { PostgresUserProfileAdapter } from "../adapter/PostgresUserProfileAdapter";
import { userProfileService } from "../service/userProfileService";
import { recipeService, UserProfileService } from "../service/recipeService";
import { requireAuth } from "../middleware/authMiddleware";
import { prisma } from "../prisma";
import { RecipePort } from "../adapter/port/RecipePort";

export const createRecipeRoute = (
  customRecipeProvider?: RecipePort,
  customUserProfileService?: UserProfileService
) => {
  const recipeProvider = customRecipeProvider ?? new SpoonacularAdapter();

  const userRepo = new PostgresUserProfileAdapter(prisma);
  const userSvc = customUserProfileService ?? userProfileService(userRepo);

  const recipeSvc = recipeService(recipeProvider, userSvc);
  const controller = new RecipeController(recipeSvc);

  const router = express.Router();

  router.get("/recipes", requireAuth, (req, res) =>
    controller.getRecipes(req, res)
  );
  router.post("/mealplan", requireAuth, (req, res) =>
    controller.getMealPlan(req, res)
  );
  router.get("/recipes/:id", requireAuth, (req, res) =>
    controller.getRecipeDetails(req, res)
  );

  return router;
};
