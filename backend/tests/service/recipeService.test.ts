import { recipeService } from '../../service/recipeService';
import { RecipeQueryDto } from '../../dto/RecipeQueryDto';

const mockProfile = {
  weight: 80,
  goal: 'gainMuscle',
  dietType: 'omnivore',
  calculateCaloriesProfile: jest.fn(() => 2400)
};

//mock für recipePort
const mockRecipeProvider = {
  searchRecipesByCaloriesAndProtein: jest.fn()
};

//mock für UserProfileService
const mockUserProfileService = {
  getProfile: jest.fn(),
  createProfile: jest.fn(),
  updateProfile: jest.fn()
};

//service erstellen
const service = recipeService(mockRecipeProvider, mockUserProfileService);

describe('recipeService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // alle mocks zurücksetzen
  });

  test('getRecipesForUser-> gibt Rezepte zurück', async () => {
    mockUserProfileService.getProfile.mockResolvedValue(mockProfile);
    mockRecipeProvider.searchRecipesByCaloriesAndProtein.mockResolvedValue([{ title: 'Chicken' }]);

    const result = await service.getRecipesForUser('user123');

    expect(result.totalCalories).toBe(2400);
    expect(result.targetProtein).toBe(160); //80 * 2
    expect(result.recipes).toEqual([{ title: 'Chicken' }]);
  });

  test('getMealPlan -> erstellt Mahlzeitenplan', async () => {
    const dto = new RecipeQueryDto();
    dto.mealsPerDay = 3;
    dto.mealDistribution = [0.3, 0.4, 0.3];
    dto.burned = 200;
    dto.dietType = 'omnivore';

    mockUserProfileService.getProfile.mockResolvedValue(mockProfile);
    mockProfile.calculateCaloriesProfile.mockReturnValue(1800);
    mockRecipeProvider.searchRecipesByCaloriesAndProtein.mockResolvedValue([{ id: 1 }]);

    const plan = await service.getMealPlan('user123', dto);

    expect(plan.totalCalories).toBe(1800);
    expect(Object.keys(plan.meals)).toHaveLength(3);
    expect(plan.meals.meal1).toEqual([{ id: 1 }]);
  });

  test('getRecipesForUser -> wirft Fehler bei fehlendem Profil', async () => {
    mockUserProfileService.getProfile.mockResolvedValue(null);

    await expect(service.getRecipesForUser('user123')).rejects.toThrow('Kein Profil vorhanden');
  });
});
