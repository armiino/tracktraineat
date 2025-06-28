import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createAppWithCustomRecipeRoute } from "./utils/customAppFactory";

const searchRecipesMock = jest.fn();
const mockAdapter = {
  getRecipeDetails: jest.fn(),
  searchRecipesByCaloriesAndProtein: searchRecipesMock,
};

const prisma = new PrismaClient();
let cookie: string[] = [];

const app = createAppWithCustomRecipeRoute(mockAdapter);

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret";

  await prisma.savedRecipe.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  const email = "mealplan@test.com";

  await request(app).post("/auth/register").send({
    email,
    password: "Test1234!",
  });

  const loginRes = await request(app).post("/auth/login").send({
    email,
    password: "Test1234!",
  });

  const rawCookie = loginRes.headers["set-cookie"];
  cookie = Array.isArray(rawCookie) ? rawCookie : [rawCookie];

  await request(app).post("/api/profile").set("Cookie", cookie).send({
    weight: 75,
    height: 180,
    age: 25,
    gender: "male",
    activity: "medium",
    goal: "gainMuscle",
    dietType: "omnivore",
  });
});

afterAll(async () => {
  await prisma.savedRecipe.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

beforeEach(() => {
  jest.clearAllMocks();

  let idCounter = 1;

  searchRecipesMock.mockImplementation((cal, prot, diet, number = 10) => {
    const recipes = Array.from({ length: number }, () => ({
      id: idCounter++,
      title: `Mocked Recipe ${idCounter}`,
      image: "mock.jpg",
      calories: cal,
      protein: prot,
      fat: 20,
      carbs: 40,
    }));
    return Promise.resolve(recipes);
  });
});

describe("POST /api/mealplan", () => {
  it("return meal plan mit grouped recipes", async () => {
    const res = await request(app)
      .post("/api/mealplan")
      .set("Cookie", cookie)
      .set("Content-Type", "application/json")
      .send({
        mealDistribution: [0.4, 0.3, 0.3],
        mealsPerDay: 3,
        burned: 0,
        dietType: "omnivore",
      });

    const mealKeys = Object.keys(res.body.meals);

    const hasMealGroup = (groupNum: number): boolean =>
      mealKeys.some((key) => key.startsWith(`meal${groupNum}`));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("meals");
    expect(res.body.totalCalories).toBeGreaterThan(0);
    expect(res.body.targetProtein).toBeGreaterThan(0);
    expect(hasMealGroup(1)).toBe(true);
    expect(hasMealGroup(2)).toBe(true);
    expect(hasMealGroup(3)).toBe(true);
  });

  it("return 400 wenn validation fails", async () => {
    const res = await request(app)
      .post("/api/mealplan")
      .set("Cookie", cookie)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation failed");
  });

  it("return 401 wenn user is not authenticated", async () => {
    const res = await request(app)
      .post("/api/mealplan")
      .send({
        mealDistribution: [0.5, 0.5],
        mealsPerDay: 2,
        burned: 150,
        dietType: "omnivore",
      });

    expect(res.status).toBe(401);
  });

  it("return 404 wenn profile is missing", async () => {
    await request(app).post("/auth/register").send({
      email: "noprof@test.com",
      password: "Test1234!",
    });

    const login = await request(app).post("/auth/login").send({
      email: "noprof@test.com",
      password: "Test1234!",
    });

    const cookieNoProfile = login.headers["set-cookie"];

    const res = await request(app)
      .post("/api/mealplan")
      .set("Cookie", cookieNoProfile)
      .send({
        mealDistribution: [0.4, 0.3, 0.3],
        mealsPerDay: 3,
        burned: 200,
        dietType: "omnivore",
      });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ code: "profile_not_found" });
  });
  it("should return fallback meals and warnings if no standard recipes are found", async () => {
    searchRecipesMock.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        id: 1,
        title: "Fallback 1",
        image: "f.jpg",
        calories: 300,
        protein: 15,
        fat: 10,
        carbs: 30,
      },
      {
        id: 2,
        title: "Fallback 2",
        image: "f.jpg",
        calories: 300,
        protein: 15,
        fat: 10,
        carbs: 30,
      },
      {
        id: 3,
        title: "Fallback 3",
        image: "f.jpg",
        calories: 300,
        protein: 15,
        fat: 10,
        carbs: 30,
      },
    ]);

    const res = await request(app)
      .post("/api/mealplan")
      .set("Cookie", cookie)
      .send({
        mealDistribution: [0.4],
        mealsPerDay: 1,
        burned: 0,
        dietType: "omnivore",
      });

    expect(res.status).toBe(200);
    expect(Object.keys(res.body.meals)).toContain("meal1a");
    expect(res.body.warnings.length).toBeGreaterThan(0);
    expect(res.body.totalCalories).toBeGreaterThan(0);
  });
});
describe("GET /api/recipes/:id", () => {
  it("return 400 wenn ID is invalid", async () => {
    const res = await request(app)
      .get("/api/recipes/abc")
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("invalid_recipe_id");
  });

  it("return 404 if recipe is not found", async () => {
    mockAdapter.getRecipeDetails.mockRejectedValueOnce(
      Object.assign(new Error(), {
        code: "spoonacular_not_found",
        message: "Recipe not found",
      })
    );

    const res = await request(app)
      .get("/api/recipes/99999")
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("spoonacular_not_found");
  });

  it("return recipe details wenn gefunden", async () => {
    mockAdapter.getRecipeDetails.mockResolvedValueOnce({
      id: 42,
      title: "Mocked Detail",
      image: "mock.jpg",
      calories: 500,
      protein: 20,
    });

    const res = await request(app).get("/api/recipes/42").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Mocked Detail");
  });
});
describe("GET /api/recipes", () => {
  it("return recipes für authenticated user mit profile", async () => {
    searchRecipesMock.mockResolvedValue(
      Array.from({ length: 3 }, (_, i) => ({
        id: i + 1,
        title: `Recipe ${i + 1}`,
        image: "img.jpg",
        calories: 500,
        protein: 30,
        fat: 10,
        carbs: 50,
      }))
    );

    const res = await request(app).get("/api/recipes").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.recipes).toBeDefined();
    expect(Array.isArray(res.body.recipes)).toBe(true);
    expect(res.body.totalCalories).toBeGreaterThan(0);
    expect(res.body.targetProtein).toBeGreaterThan(0);
  });

  it("return 404 wenn profile is missing", async () => {
    await request(app).post("/auth/register").send({
      email: "noprofile2@test.com",
      password: "Test1234!",
    });

    const login = await request(app).post("/auth/login").send({
      email: "noprofile2@test.com",
      password: "Test1234!",
    });

    const cookieNoProfile = login.headers["set-cookie"];

    const res = await request(app)
      .get("/api/recipes")
      .set("Cookie", cookieNoProfile);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Kein Profil/i);
  });

  it("return 401 wenn not authenticated", async () => {
    const res = await request(app).get("/api/recipes");

    expect(res.status).toBe(401);
  });

  it("return 500 wenn spoonacular key fehlt", async () => {
    mockAdapter.getRecipeDetails.mockImplementation(() => {
      const err = new Error("API-Key fehlt");
      (err as any).code = "spoonacular_missing_key";
      throw err;
    });

    const res = await request(app)
      .get("/api/recipes/123")
      .set("Cookie", cookie);

    expect(res.status).toBe(500);
    expect(res.body.code).toBe("spoonacular_missing_key");
  });

  it("return 502 wenn spoonacular auth fails", async () => {
    mockAdapter.getRecipeDetails.mockImplementation(() => {
      const err = new Error("Zugriff verweigert");
      (err as any).code = "spoonacular_auth_error";
      throw err;
    });

    const res = await request(app)
      .get("/api/recipes/123")
      .set("Cookie", cookie);

    expect(res.status).toBe(502);
    expect(res.body.code).toBe("spoonacular_auth_error");
  });
  it("return 400 wenn unknown error in getRecipeDetails", async () => {
    mockAdapter.getRecipeDetails.mockImplementation(() => {
      throw new Error("Unexpected failure");
    });

    const res = await request(app)
      .get("/api/recipes/123")
      .set("Cookie", cookie);

    expect(res.status).toBe(500);
    expect(res.body.code).toBe("get_recipe_details_failed");
  });
});
