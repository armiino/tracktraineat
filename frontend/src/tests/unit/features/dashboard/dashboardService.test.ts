import { dashboardService } from "@/features/dashboard/services/dashboardService";
import api from "@/lib/api";

jest.mock("@/lib/api", () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

describe("dashboardService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getCalorieCalculation: ruft korrekt /api/calculateProfile auf und gibt Daten zurück", async () => {
    const mockData = {
      bmr: 1500,
      tdee: 2000,
      totalCalories: 2100,
      totalProtein: 120,
    };
    (api.post as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await dashboardService.getCalorieCalculation();

    expect(api.post).toHaveBeenCalledWith("/api/calculateProfile");
    expect(result).toEqual(mockData);
  });

  it("generateMeals: sendet korrektes Payload an /api/mealplan", async () => {
    const input = {
      mealsPerDay: 3,
      mealDistribution: [0.3, 0.4, 0.3],
      burned: 100,
      dietType: "vegetarian",
    };
    const mockResponse = { meals: {}, warnings: [] };
    (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

    const result = await dashboardService.generateMeals(input);

    expect(api.post).toHaveBeenCalledWith("/api/mealplan", input);
    expect(result).toEqual(mockResponse);
  });

  it("getRecipeDetailById: ruft Rezept-Detail-API korrekt auf", async () => {
    const spoonId = 123;
    const mockRecipe = { id: 123, title: "Pasta", calories: 500 };
    (api.get as jest.Mock).mockResolvedValue({ data: mockRecipe });

    const result = await dashboardService.getRecipeDetailById(spoonId);

    expect(api.get).toHaveBeenCalledWith(`/api/recipes/${spoonId}`);
    expect(result).toEqual(mockRecipe);
  });

  it("saveRecipeToProfile: sendet korrekt spoonId an /api/recipes/save", async () => {
    const spoonId = 456;
    const mockResponse = { success: true };
    (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

    const result = await dashboardService.saveRecipeToProfile(spoonId);

    expect(api.post).toHaveBeenCalledWith("/api/recipes/save", { spoonId });
    expect(result).toEqual(mockResponse);
  });
});
