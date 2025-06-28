import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createAppWithCustomRecipeRoute } from "./utils/customAppFactory";

const getRecipeDetailsMock = jest.fn();
const mockAdapter = {
  getRecipeDetails: getRecipeDetailsMock,
  searchRecipesByCaloriesAndProtein: jest.fn(), // nur für andere Fälle
};

const prisma = new PrismaClient();
let cookie: string[] = [];

const app = createAppWithCustomRecipeRoute(mockAdapter); // globale App

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret";
  await prisma.savedRecipe.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  const email = "testuser@details.com";

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
});

describe("GET /api/recipes/:id – SpoonacularAdapter Integration", () => {
  it("should return mapped recipe details from Spoonacular", async () => {
    getRecipeDetailsMock.mockResolvedValueOnce({
      id: 123456,
      title: "Mocked Pasta",
      image: "mocked.jpg",
      instructions: "Cook it",
      ingredients: [],
      calories: 400,
      protein: 25,
    });

    const res = await request(app)
      .get("/api/recipes/123456")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 123456,
      title: "Mocked Pasta",
      image: "mocked.jpg",
      instructions: "Cook it",
      ingredients: [],
      calories: 400,
      protein: 25,
    });
  });

  it("return 404 wenn Spoonacular returns 404", async () => {
    const err = new Error("Not found") as any;
    err.code = "spoonacular_not_found";
    getRecipeDetailsMock.mockRejectedValueOnce(err);

    const res = await request(app)
      .get("/api/recipes/999999")
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      code: "spoonacular_not_found",
      message: "Rezept nicht gefunden.",
    });
  });

  it("return 502 wenn API key is invalid", async () => {
    const err = new Error("API-Key ungültig") as any;
    err.code = "spoonacular_auth_error";
    getRecipeDetailsMock.mockRejectedValueOnce(err);

    const res = await request(app)
      .get("/api/recipes/111111")
      .set("Cookie", cookie);

    expect(res.status).toBe(502);
    expect(res.body).toEqual({
      code: "spoonacular_auth_error",
      message: "API-Zugriff verweigert.",
    });
  });

  it("return 400 wenn invalid id (not a number)", async () => {
    const res = await request(app)
      .get("/api/recipes/abc")
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("invalid_recipe_id");
  });

  it("return 401 wenn nicht authenticated", async () => {
    const res = await request(app).get("/api/recipes/123456");
    expect(res.status).toBe(401);
  });
});
