import { savedRecipeService } from "../../../service/savedRecipeService";
import { RecipePort } from "../../../adapter/port/RecipePort";

const mockRepo = {
  saveRecipe: jest.fn(),
  getSavedRecipes: jest.fn(),
  deleteSavedRecipe: jest.fn(),
};

const mockRecipeProvider: RecipePort = {
  getRecipeDetails: jest.fn() as jest.Mock,
  searchRecipesByCaloriesAndProtein: jest.fn() as jest.Mock,
};

describe("savedRecipeService", () => {
  const service = savedRecipeService(mockRepo, mockRecipeProvider);
  const userId = "user-123";
  const spoonId = 456;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("speichert rezept nachdem get", async () => {
    const recipeDetails = {
      title: "Test Rezept",
      image: "img.jpg",
      calories: 500,
      protein: 30,
      fat: 20,
      carbs: 50,
      ingredients: ["item1"],
      instructions: "cook it",
    };
    const savedRecipe = { ...recipeDetails, id: "abc", createdAt: new Date() };

    (mockRecipeProvider.getRecipeDetails as jest.Mock).mockResolvedValue(
      recipeDetails
    );
    mockRepo.saveRecipe.mockResolvedValue(savedRecipe);

    const result = await service.save(userId, spoonId);

    expect(mockRecipeProvider.getRecipeDetails).toHaveBeenCalledWith(spoonId);
    expect(mockRepo.saveRecipe).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        spoonId,
        title: "Test Rezept",
      })
    );
    expect(result).toEqual(expect.objectContaining({ id: "abc" }));
  });

  it("createdat und id wird sichergestellt", async () => {
    const now = new Date();
    const recipeDetails = {
      title: "Test Rezept",
      image: "img.jpg",
      calories: 500,
      protein: 30,
      fat: 20,
      carbs: 50,
      ingredients: ["item1"],
      instructions: "cook it",
    };
    const savedRecipe = {
      ...recipeDetails,
      id: "generated-id",
      createdAt: now,
    };

    (mockRecipeProvider.getRecipeDetails as jest.Mock).mockResolvedValue(
      recipeDetails
    );
    mockRepo.saveRecipe.mockResolvedValue(savedRecipe);

    const result = await service.save(userId, spoonId);
    expect(result.id).toBe("generated-id");
    expect(result.createdAt).toBe(now);
  });

  it("fehler wenn rezept nicht gefunden", async () => {
    (mockRecipeProvider.getRecipeDetails as jest.Mock).mockResolvedValue(null);

    await expect(service.save(userId, spoonId)).rejects.toThrow(
      "Rezept nicht gefunden"
    );
  });

  it("throws when recipe fetch fails", async () => {
    (mockRecipeProvider.getRecipeDetails as jest.Mock).mockRejectedValue({
      code: "not_found",
    });

    await expect(service.save(userId, spoonId)).rejects.toThrow(
      "Rezept konnte nicht geladen werden"
    );
  });

  it("fehler wenn speichern fehlschlägt", async () => {
    const recipeDetails = {
      title: "Test Rezept",
      image: "img.jpg",
      calories: 500,
      protein: 30,
      fat: 20,
      carbs: 50,
      ingredients: ["item1"],
      instructions: "cook it",
    };

    (mockRecipeProvider.getRecipeDetails as jest.Mock).mockResolvedValue(
      recipeDetails
    );
    mockRepo.saveRecipe.mockRejectedValue({ code: "db_error" });

    await expect(service.save(userId, spoonId)).rejects.toThrow(
      "Speichern des Rezepts fehlgeschlagen"
    );
  });

  it("fehler wenn speichern ohne errorcode", async () => {
    const recipeDetails = {
      title: "Test Rezept ohne code",
      image: "img.jpg",
      calories: 500,
      protein: 30,
      fat: 20,
      carbs: 50,
      ingredients: ["item1"],
      instructions: "cook it",
    };

    (mockRecipeProvider.getRecipeDetails as jest.Mock).mockResolvedValue(
      recipeDetails
    );
    mockRepo.saveRecipe.mockRejectedValue(new Error("DB exploded"));

    try {
      await service.save(userId, spoonId);
    } catch (err: any) {
      expect(err.message).toBe("Speichern des Rezepts fehlgeschlagen");
      expect(err.code).toBe("save_recipe_failed");
    }
  });

  it("laden von saved recipes", async () => {
    const saved = [{ spoonId: 1 }, { spoonId: 2 }];
    mockRepo.getSavedRecipes.mockResolvedValue(saved);

    const result = await service.getAll(userId);
    expect(mockRepo.getSavedRecipes).toHaveBeenCalledWith(userId);
    expect(result).toBe(saved);
  });

  it("fehler während gespeicherte rezepte geladen werden", async () => {
    mockRepo.getSavedRecipes.mockRejectedValue({ code: "load_error" });

    await expect(service.getAll(userId)).rejects.toThrow(
      "Fehler beim Laden der gespeicherten Rezepte"
    );
  });

  it("rezept löschen", async () => {
    await service.delete(userId, spoonId);
    expect(mockRepo.deleteSavedRecipe).toHaveBeenCalledWith(userId, spoonId);
  });

  it("fehler während löschung", async () => {
    mockRepo.deleteSavedRecipe.mockRejectedValue({ code: "fail" });
    await expect(service.delete(userId, spoonId)).rejects.toThrow(
      "Fehler beim Löschen des Rezepts"
    );
  });

  it("fehler während löschung ohne code", async () => {
    mockRepo.deleteSavedRecipe.mockRejectedValue(new Error("irgendwas")); // no "code"

    try {
      await service.delete(userId, spoonId);
    } catch (err: any) {
      expect(err.message).toBe("Fehler beim Löschen des Rezepts");
      expect(err.code).toBe("saved_recipe_delete_failed");
    }
  });

  it("wirft default code während lsöchen", async () => {
    mockRepo.getSavedRecipes.mockRejectedValue(new Error("irgendwas"));

    try {
      await service.getAll(userId);
    } catch (err: any) {
      expect(err.message).toBe("Fehler beim Laden der gespeicherten Rezepte");
      expect(err.code).toBe("load_saved_recipes_failed");
    }
  });
});
