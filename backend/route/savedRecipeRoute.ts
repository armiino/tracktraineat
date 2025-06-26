import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { PostgresSavedRecipeAdapter } from '../adapter/PostgresSavedRecipeAdapter';
import { savedRecipeService } from '../service/savedRecipeService';
import { SavedRecipeController } from '../controller/SavedRecipeController';
import { SpoonacularAdapter } from '../adapter/spoonacularAdapter';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const adapter = new PostgresSavedRecipeAdapter(prisma);

const apiKey = process.env.SPOONACULAR_API_KEY!;
const spoonacular = new SpoonacularAdapter();
const service = savedRecipeService(adapter, spoonacular);

const controller = new SavedRecipeController(service);

router.post('/recipes/save', requireAuth, (req, res) => controller.saveRecipe(req, res));
router.get('/recipes/saved', requireAuth, (req, res) => controller.getRecipes(req, res));
router.delete('/recipes/:spoonId', requireAuth, (req, res) => controller.deleteRecipe(req, res));
router.get('/saved', requireAuth, (req, res) => controller.getRecipes(req, res));

export default router;
