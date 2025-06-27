import { SavedRecipeController } from "../../../controller/SavedRecipeController";
import { Request, Response } from "express";
import { validate } from "class-validator";

jest.mock("class-validator", () => {
  const actual = jest.requireActual("class-validator");
  return {
    ...actual,
    validate: jest.fn().mockResolvedValue([]),
  };
});

const mockService = {
  save: jest.fn(),
  getAll: jest.fn(),
  delete: jest.fn(),
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res as Response;
};

describe("SavedRecipeController", () => {
  let controller: SavedRecipeController;

  beforeEach(() => {
    controller = new SavedRecipeController(mockService as any);
    jest.clearAllMocks();
  });

  describe("saveRecipe", () => {
    it("gibt 400 zurück bei ungültiger Eingabe", async () => {
      (validate as jest.Mock).mockResolvedValueOnce([{ property: "spoonId" }]);
      const req = { user: { id: "user1" }, body: {} } as any as Request;
      const res = mockResponse();

      await controller.saveRecipe(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("gibt 201 zurück bei erfolgreichem Speichern", async () => {
      mockService.save.mockResolvedValueOnce({ id: 1 });
      const req = {
        user: { id: "user1" },
        body: { spoonId: 123 },
      } as any as Request;
      const res = mockResponse();

      await controller.saveRecipe(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("gibt 409 zurück wenn Rezept bereits gespeichert ist", async () => {
      const err = { code: "recipe_already_saved" };
      mockService.save.mockRejectedValueOnce(err);
      const req = {
        user: { id: "user1" },
        body: { spoonId: 123 },
      } as any as Request;
      const res = mockResponse();

      await controller.saveRecipe(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("gibt 500 zurück bei unbekanntem Fehler", async () => {
      const err = new Error("fail");
      mockService.save.mockRejectedValueOnce(err);
      const req = {
        user: { id: "user1" },
        body: { spoonId: 123 },
      } as any as Request;
      const res = mockResponse();

      await controller.saveRecipe(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
    it("gibt 404 zurück, wenn das Rezept nicht gefunden wird", async () => {
      const req = {
        user: { id: "user1" },
        body: { spoonId: 123 },
      } as any as Request;

      const res = mockResponse();

      const error = new Error("Not found") as any;
      error.code = "recipe_not_found";
      mockService.save.mockRejectedValueOnce(error);

      await controller.saveRecipe(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ code: "recipe_not_found" });
    });
  });

  describe("getRecipes", () => {
    it("gibt 400 zurück wenn userId fehlt", async () => {
      const req = {} as Request;
      const res = mockResponse();

      await controller.getRecipes(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("gibt gespeicherte Rezepte zurück", async () => {
      mockService.getAll.mockResolvedValueOnce([{ id: 1 }]);
      const req = { user: { id: "user1" } } as any as Request;
      const res = mockResponse();

      await controller.getRecipes(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });
    it("gibt 500 zurück, wenn das Laden der Rezepte fehlschlägt", async () => {
      const req = {
        user: { id: "user1" },
      } as any as Request;

      const res = mockResponse();

      mockService.getAll.mockRejectedValueOnce(new Error("DB Fehler"));

      await controller.getRecipes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: "load_saved_recipes_failed",
      });
    });
  });

  describe("deleteRecipe", () => {
    it("gibt 400 zurück bei ungültiger Eingabe", async () => {
      const req = {
        user: { id: "user1" },
        params: { spoonId: "abc" },
      } as any as Request;
      const res = mockResponse();

      await controller.deleteRecipe(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("gibt 204 zurück bei erfolgreichem Löschen", async () => {
      const req = {
        user: { id: "user1" },
        params: { spoonId: "123" },
      } as any as Request;
      const res = mockResponse();

      await controller.deleteRecipe(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("gibt 500 zurück bei Fehler", async () => {
      mockService.delete.mockRejectedValueOnce(new Error("fail"));
      const req = {
        user: { id: "user1" },
        params: { spoonId: "123" },
      } as any as Request;
      const res = mockResponse();

      await controller.deleteRecipe(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
