import { recipeService } from "../../../service/recipeService";
import { RecipeQueryDto } from "../../../dto/RecipeQueryDto";
import { UserProfileService } from "../../../service/recipeService";

const mockRecipeProvider = {
  searchRecipesByCaloriesAndProtein: jest.fn(),
  getRecipeDetails: jest.fn(),
};

const mockUserProfileService: UserProfileService = {
  getProfile: jest.fn() as jest.Mock,
  createProfile: jest.fn() as jest.Mock,
  updateProfile: jest.fn() as jest.Mock,
};

const createService = () =>
  recipeService(mockRecipeProvider, mockUserProfileService);

describe("recipeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRecipesForUser", () => {
    it("fehler wenn kein profil gefunden", async () => {
      (mockUserProfileService.getProfile as jest.Mock).mockResolvedValue(null);

      const service = createService();
      await expect(service.getRecipesForUser("user123")).rejects.toThrow(
        "Kein Profil vorhanden"
      );
    });

    it("returns recipes mit korrekten kcal und protein", async () => {
      const mockProfile = {
        weight: 80,
        goal: "gainMuscle",
        dietType: "vegetarian",
        calculateCaloriesProfile: jest.fn().mockReturnValue(2500),
      };
      (mockUserProfileService.getProfile as jest.Mock).mockResolvedValue(
        mockProfile
      );
      mockRecipeProvider.searchRecipesByCaloriesAndProtein.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      const service = createService();
      const result = await service.getRecipesForUser("user123");

      expect(mockProfile.calculateCaloriesProfile).toHaveBeenCalled();
      expect(
        mockRecipeProvider.searchRecipesByCaloriesAndProtein
      ).toHaveBeenCalledWith(2500, 160, "vegetarian");
      expect(result.recipes).toHaveLength(2);
    });
  });

  describe("getMealPlan", () => {
    it("fehler wenn kein profil gefunden", async () => {
      (mockUserProfileService.getProfile as jest.Mock).mockResolvedValue(null);
      const service = createService();

      await expect(
        service.getMealPlan("user123", {
          burned: 0,
          mealsPerDay: 1,
          mealDistribution: [1.0],
          dietType: "vegan",
        })
      ).rejects.toThrow("Kein Profil vorhanden");
    });

    it("returns ein mealplan mit einer mahlzeit", async () => {
      const mockProfile = {
        weight: 70,
        goal: "loseFat",
        dietType: "vegan",
        calculateCaloriesProfile: jest.fn().mockReturnValue(2000),
      };
      (mockUserProfileService.getProfile as jest.Mock).mockResolvedValue(
        mockProfile
      );

      mockRecipeProvider.searchRecipesByCaloriesAndProtein.mockResolvedValue([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);

      const dto: RecipeQueryDto = {
        burned: 0,
        mealsPerDay: 1,
        mealDistribution: [1.0],
        dietType: "vegan",
      };

      const service = createService();
      const result = await service.getMealPlan("user123", dto);

      expect(mockProfile.calculateCaloriesProfile).toHaveBeenCalledWith(0);
      expect(
        mockRecipeProvider.searchRecipesByCaloriesAndProtein
      ).toHaveBeenCalled();
      expect(result.meals.meal1).toBeDefined();
      expect(Array.isArray(result.meals.meal1)).toBe(true);
    });

    it("warnings wenn keine rezepte gelifert werden", async () => {
      const mockProfile = {
        weight: 70,
        goal: "gainMuscle",
        dietType: "vegan",
        calculateCaloriesProfile: jest.fn().mockReturnValue(2400),
      };
      (mockUserProfileService.getProfile as jest.Mock).mockResolvedValue(
        mockProfile
      );

      mockRecipeProvider.searchRecipesByCaloriesAndProtein
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 10 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const dto: RecipeQueryDto = {
        burned: 0,
        mealsPerDay: 1,
        mealDistribution: [1.0],
        dietType: "vegan",
      };

      const service = createService();
      const result = await service.getMealPlan("user123", dto);

      expect(mockProfile.calculateCaloriesProfile).toHaveBeenCalledWith(0);
      expect(result.meals).toHaveProperty("meal1a");
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("warning wenn keine proteine verwendet wurden für die suche", async () => {
      const mockProfile = {
        weight: 60,
        goal: "loseFat",
        dietType: "vegan",
        calculateCaloriesProfile: jest.fn().mockReturnValue(1800),
      };
      (mockUserProfileService.getProfile as jest.Mock).mockResolvedValue(
        mockProfile
      );

      mockRecipeProvider.searchRecipesByCaloriesAndProtein
        .mockResolvedValueOnce([]) 
        .mockResolvedValueOnce([]) 
        .mockResolvedValueOnce([{ id: 101 }]); 

      const dto: RecipeQueryDto = {
        burned: 0,
        mealsPerDay: 1,
        mealDistribution: [1.0],
        dietType: "vegan",
      };

      const service = createService();
      const result = await service.getMealPlan("user123", dto);

      expect(result.meals).toHaveProperty("meal1a");
      expect(result.warnings.some((w) => w.includes("ohne Proteinziel"))).toBe(
        true
      );
    });
  });

  describe("getRecipeDetails", () => {
    it("provider mit korrekter spoonID", async () => {
      mockRecipeProvider.getRecipeDetails.mockResolvedValue({ id: 123 });
      const service = createService();

      const result = await service.getRecipeDetails(123);

      expect(mockRecipeProvider.getRecipeDetails).toHaveBeenCalledWith(123);
      expect(result).toEqual({ id: 123 });
    });
  });
  it("berechnet Proteinziel mit Faktor 1.5 bei nicht gainMuscle", async () => {
    const mockProfile = {
      weight: 80,
      goal: "loseFat", // nicht "gainMuscle"
      dietType: "vegan",
      calculateCaloriesProfile: jest.fn().mockReturnValue(2200),
    };
    (mockUserProfileService.getProfile as jest.Mock).mockResolvedValue(
      mockProfile
    );
  
    mockRecipeProvider.searchRecipesByCaloriesAndProtein.mockResolvedValue([]);
  
    const service = createService();
    const result = await service.getRecipesForUser("user123");
  
    expect(
      mockRecipeProvider.searchRecipesByCaloriesAndProtein
    ).toHaveBeenCalledWith(2200, 120, "vegan"); // 80 * 1.5 = 120
  });
  it("setzt dietType auf 'omnivore' wenn dto.dietType nicht vorhanden ist", async () => {
    const mockProfile = {
      weight: 75,
      goal: "gainMuscle",
      dietType: "vegan", // wird hier ignoriert
      calculateCaloriesProfile: jest.fn().mockReturnValue(2500),
    };
    (mockUserProfileService.getProfile as jest.Mock).mockResolvedValue(
      mockProfile
    );
  
    mockRecipeProvider.searchRecipesByCaloriesAndProtein.mockResolvedValue([
      { id: 1 }, { id: 2 }, { id: 3 },
    ]);
  
    const service = createService();
    const result = await service.getMealPlan("user123", {
      burned: 0,
      mealsPerDay: 1,
      mealDistribution: [1.0],
      dietType: undefined, 
    });
  
    expect(
      mockRecipeProvider.searchRecipesByCaloriesAndProtein
    ).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), "omnivore", expect.any(Number));
  });
  
  it("verwendet Fallback-Teilverteilung für kleine Mahlzeiten", async () => {
    const mockProfile = {
      weight: 50,
      goal: "noChange",
      dietType: "vegan",
      calculateCaloriesProfile: jest.fn().mockReturnValue(1400),
    };
    (mockUserProfileService.getProfile as jest.Mock).mockResolvedValue(
      mockProfile
    );
  
    mockRecipeProvider.searchRecipesByCaloriesAndProtein
      .mockResolvedValueOnce([]) 
      .mockResolvedValue([]); 
  
    const service = createService();
    const result = await service.getMealPlan("user123", {
      burned: 0,
      mealsPerDay: 1,
      mealDistribution: [1.0],
      dietType: "vegan",
    });
  
    expect(result.warnings.length).toBeGreaterThan(0);
  });
    
});
