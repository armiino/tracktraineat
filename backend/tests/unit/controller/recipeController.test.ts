import { RecipeController } from "../../../controller/recipeController";
import { Request, Response } from "express";
import { validate } from "class-validator";

jest.mock("class-validator", () => {
  const actual = jest.requireActual("class-validator");
  return {
    ...actual,
    validate: jest.fn().mockResolvedValue([]),
  };
});

const mockRecipeService = {
  getRecipeDetails: jest.fn(),
  getRecipesForUser: jest.fn(),
  getMealPlan: jest.fn(),
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe("RecipeController", () => {
  let controller: RecipeController;

  beforeEach(() => {
    controller = new RecipeController(mockRecipeService as any);
    jest.clearAllMocks();
  });

  describe("getRecipeDetails", () => {
    it("gibt 400 zurück bei ungültiger ID", async () => {
      (validate as jest.Mock).mockResolvedValueOnce([{ property: "id" }]);

      const req = { params: { id: "abc" } } as unknown as Request;
      const res = mockResponse();

      await controller.getRecipeDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("gibt Rezeptdetails zurück", async () => {
      mockRecipeService.getRecipeDetails.mockResolvedValueOnce({
        id: 1,
        title: "Test",
      });
      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await controller.getRecipeDetails(req, res);
      expect(res.json).toHaveBeenCalledWith({ id: 1, title: "Test" });
    });
    it("gibt 500 zurück bei spoonacular_missing_key", async () => {
      const err = { code: "spoonacular_missing_key", message: "Missing key" };
      mockRecipeService.getRecipeDetails.mockRejectedValueOnce(err);

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await controller.getRecipeDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: "spoonacular_missing_key",
        message: "Missing key",
      });
    });

    it("gibt 502 zurück bei spoonacular_auth_error", async () => {
      const err = { code: "spoonacular_auth_error", message: "Invalid key" };
      mockRecipeService.getRecipeDetails.mockRejectedValueOnce(err);

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await controller.getRecipeDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(502);
    });

    it("gibt 502 zurück bei spoonacular_auth_error", async () => {
      const err = { code: "spoonacular_auth_error", message: "Unauthorized" };
      mockRecipeService.getRecipeDetails.mockRejectedValueOnce(err);

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await controller.getRecipeDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith({
        code: "spoonacular_auth_error",
        message: "API-Zugriff verweigert.",
      });
    });

    it("gibt 404 zurück bei spoonacular_not_found Fehler", async () => {
      const err = { code: "spoonacular_not_found" };
      mockRecipeService.getRecipeDetails.mockRejectedValueOnce(err);

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      await controller.getRecipeDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        code: "spoonacular_not_found",
        message: "Rezept nicht gefunden.",
      });
    });
    it("gibt 500 zurück bei unbekanntem Fehler", async () => {
      const err = new Error("Unerwarteter Fehler");
      mockRecipeService.getRecipeDetails.mockRejectedValueOnce(err);

      const req = { params: { id: "1" } } as unknown as Request;
      const res = mockResponse();

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await controller.getRecipeDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: "get_recipe_details_failed",
      });

      consoleSpy.mockRestore();
    });
  });

  describe("getRecipes", () => {
    it("gibt gespeicherte Rezepte zurück", async () => {
      mockRecipeService.getRecipesForUser.mockResolvedValueOnce([{ id: 1 }]);
      const req = { user: { id: "user1" } } as any as Request;
      const res = mockResponse();

      await controller.getRecipes(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it("gibt 400 zurück bei Fehler", async () => {
      mockRecipeService.getRecipesForUser.mockRejectedValueOnce(
        new Error("fail")
      );
      const req = { user: { id: "user1" } } as any as Request;
      const res = mockResponse();

      await controller.getRecipes(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    it("gibt 401 zurück wenn userId fehlt", async () => {
      const req = {} as any as Request;
      const res = mockResponse();
    
      await controller.getRecipes(req, res);
    
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ code: "profile_not_found" });
    });
    
  });

  describe("getMealPlan", () => {
    it("gibt 400 zurück bei ungültiger Eingabe", async () => {
      (validate as jest.Mock).mockResolvedValueOnce([{ property: "goal" }]);

      const req = { user: { id: "user1" }, body: {} } as any as Request;
      const res = mockResponse();

      await controller.getMealPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("gibt Meal Plan zurück", async () => {
      mockRecipeService.getMealPlan.mockResolvedValueOnce({ meals: [] });

      const req = { user: { id: "user1" }, body: {} } as any as Request;
      const res = mockResponse();

      await controller.getMealPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ meals: [] });
    });
    it("gibt 500 zurück bei spoonacular_missing_key", async () => {
      const err = { code: "spoonacular_missing_key", message: "Fehlender Key" };
      mockRecipeService.getMealPlan.mockRejectedValueOnce(err);

      const req = { user: { id: "user1" }, body: {} } as any as Request;
      const res = mockResponse();

      await controller.getMealPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: "spoonacular_missing_key",
        message: "Fehlender Key",
      });
    });
    it("gibt 404 zurück bei profile_not_found Fehler", async () => {
      const err = { code: "profile_not_found" };
      mockRecipeService.getMealPlan.mockRejectedValueOnce(err);

      const req = { user: { id: "user1" }, body: {} } as any as Request;
      const res = mockResponse();

      await controller.getMealPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ code: "profile_not_found" });
    });
    it("gibt 400 zurück bei unbekanntem Fehler in getMealPlan", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});

      const err = new Error("Unbekannter Fehler");
      mockRecipeService.getMealPlan.mockRejectedValueOnce(err);

      const req = { user: { id: "user1" }, body: {} } as any as Request;
      const res = mockResponse();

      await controller.getMealPlan(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ code: "get_mealplan_failed" });
    });
    it("gibt 401 zurück wenn userId fehlt", async () => {
      const req = { body: {} } as any as Request;
      const res = mockResponse();
    
      await controller.getMealPlan(req, res);
    
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ code: "profile_not_found" });
    });
    
  });
});
