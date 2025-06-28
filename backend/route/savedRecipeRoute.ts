import express from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { PostgresSavedRecipeAdapter } from "../adapter/PostgresSavedRecipeAdapter";
import { savedRecipeService } from "../service/savedRecipeService";
import { SavedRecipeController } from "../controller/SavedRecipeController";
import { SpoonacularAdapter } from "../adapter/spoonacularAdapter";
import { prisma } from "../prisma";

export function createSavedRecipeRoute(spoonacular: SpoonacularAdapter) {
  const router = express.Router();

  const adapter = new PostgresSavedRecipeAdapter(prisma);
  const service = savedRecipeService(adapter, spoonacular);
  const controller = new SavedRecipeController(service);

  router.post("/recipes/save", requireAuth, (req, res) =>
    controller.saveRecipe(req, res)
  );
  router.get("/recipes/saved", requireAuth, (req, res) =>
    controller.getRecipes(req, res)
  );
  router.delete("/recipes/:spoonId", requireAuth, (req, res) =>
    controller.deleteRecipe(req, res)
  );
  router.get("/saved", requireAuth, (req, res) =>
    controller.getRecipes(req, res)
  );

  return router;
}
