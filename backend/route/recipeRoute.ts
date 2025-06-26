import express from "express";
import { RecipeController } from "../controller/recipeController";
import { SpoonacularAdapter } from "../adapter/spoonacularAdapter";
import { PostgresUserProfileAdapter } from "../adapter/PostgresUserProfileAdapter";
import { userProfileService } from "../service/userProfileService";
import { recipeService } from "../service/recipeService";
import { requireAuth } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";

export const createRecipeRoute = () => {
  const prisma = new PrismaClient();
  //const adapter = new PostgresUserProfileAdapter(prisma);

  const userRepo = new PostgresUserProfileAdapter(prisma);
  const userSvc = userProfileService(userRepo);

  const apiKey = process.env.SPOONACULAR_API_KEY;
  const recipeProvider = new SpoonacularAdapter();
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
