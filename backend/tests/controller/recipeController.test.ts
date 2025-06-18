import { RecipeController } from '../../controller/recipeController';
import { RecipeQueryDto } from '../../dto/RecipeQueryDto';
import { Request, Response } from 'express';

describe('RecipeController', () => {
  let controller: RecipeController;
  let mockRecipeService: any;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeAll(() => {
    // verhindert console.error spam bei erwarteten Fehlern-> nur zum cleanup
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    mockRecipeService = {
      getRecipesForUser: jest.fn(),
      getMealPlan: jest.fn(),
    };

    controller = new RecipeController(mockRecipeService);

    mockReq = {
        body: {},
        user: { id: 'user-id-123' },
      } as unknown as Request;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('getRecipes', () => {
    it('liefert Rezepte zurück', async () => {
      mockRecipeService.getRecipesForUser.mockResolvedValue({ test: true });

      await controller.getRecipes(mockReq as Request, mockRes as Response);

      expect(mockRecipeService.getRecipesForUser).toHaveBeenCalledWith('user-id-123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ test: true });
    });

    it('behandelt Fehler korrekt', async () => {
      mockRecipeService.getRecipesForUser.mockRejectedValue(new Error('Fehler'));

      await controller.getRecipes(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Fehler' });
    });
  });

  describe('getMealPlan', () => {
    it('liefert einen Mealplan für ein gültiges Profil', async () => {
      const mealPlan = {
        totalCalories: 1800,
        meals: {
          meal1: [{ id: 1 }],
          meal2: [{ id: 2 }],
          meal3: [{ id: 3 }],
        },
      };

      mockRecipeService.getMealPlan.mockResolvedValue(mealPlan);

      mockReq.body = {
        mealsPerDay: 3,
        mealDistribution: [0.3, 0.4, 0.3],
        burned: 200,
        dietType: 'omnivore',
      };

      await controller.getMealPlan(mockReq as Request, mockRes as Response);

      expect(mockRecipeService.getMealPlan).toHaveBeenCalledWith(
        'user-id-123',
        expect.any(RecipeQueryDto)
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mealPlan);
    });

    it('behandelt Validierungsfehler', async () => {
      mockReq.body = {
        mealsPerDay: -1, //hier fehler
        mealDistribution: [],
        burned: null,
        dietType: 'omnivore',
      };

      await controller.getMealPlan(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
        })
      );
    });

    it('behandelt Fehler im Service korrekt', async () => {
      mockReq.body = {
        mealsPerDay: 3,
        mealDistribution: [0.3, 0.4, 0.3],
        burned: 200,
        dietType: 'omnivore',
      };

      mockRecipeService.getMealPlan.mockRejectedValue(new Error('Fehler im Service'));

      await controller.getMealPlan(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Fehler im Service' });
    });
  });
});
