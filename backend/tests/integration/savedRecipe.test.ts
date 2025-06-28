const getRecipeDetailsMock = jest.fn();

jest.mock("../../adapter/spoonacularAdapter", () => {
  return {
    SpoonacularAdapter: jest.fn().mockImplementation(() => ({
      getRecipeDetails: getRecipeDetailsMock,
    })),
  };
});

import request from "supertest";
import { app } from "../../app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mockRecipe = {
  spoonId: 999999,
  title: "Mock Recipe",
  image: "https://image.url",
  instructions: "Cook it well.",
  ingredients: [
    { name: "rice", amount: 100, unit: "g" },
    { name: "beans", amount: 50, unit: "g" },
  ],
  calories: 500,
  protein: 25,
  fat: 10,
  carbs: 60,
};

let cookie: string[] = [];

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret";
  await prisma.savedRecipe.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  const email = "testuser@domain.com";

  await request(app).post("/auth/register").send({
    email,
    password: "Test1234!",
  });

  const loginRes = await request(app).post("/auth/login").send({
    email,
    password: "Test1234!",
  });

  const setCookie = loginRes.headers["set-cookie"];
  cookie = Array.isArray(setCookie) ? setCookie : [setCookie as string];

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

beforeEach(async () => {
  await prisma.savedRecipe.deleteMany();
  getRecipeDetailsMock.mockReset();
  getRecipeDetailsMock.mockResolvedValue(mockRecipe);
});

describe("SavedRecipe Integration", () => {
  it("should save a recipe", async () => {
    const res = await request(app)
      .post("/api/recipes/save")
      .set("Cookie", cookie)
      .send({ spoonId: mockRecipe.spoonId });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("spoonId", mockRecipe.spoonId);
  });

  it("gleiches rezept speichern möglich", async () => {
    const res = await request(app)
      .post("/api/recipes/save")
      .set("Cookie", cookie)
      .send({ spoonId: mockRecipe.spoonId });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("spoonId", mockRecipe.spoonId);
  });

  it(" get alle saved recipes", async () => {
    await request(app)
      .post("/api/recipes/save")
      .set("Cookie", cookie)
      .send({ spoonId: mockRecipe.spoonId });

    const res = await request(app)
      .get("/api/recipes/saved")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("spoonId", mockRecipe.spoonId);
  });

  it(" delete saved recipe", async () => {
    await request(app)
      .post("/api/recipes/save")
      .set("Cookie", cookie)
      .send({ spoonId: mockRecipe.spoonId });

    const res = await request(app)
      .delete(`/api/recipes/${mockRecipe.spoonId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(204);
  });

  it(" return 400er für invalid input", async () => {
    const res = await request(app)
      .post("/api/recipes/save")
      .set("Cookie", cookie)
      .send({ spoonId: "not_a_number" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("invalid_input");
  });

  it(" return 401 wenn  nicht authenticated", async () => {
    const res = await request(app).get("/api/recipes/saved");
    expect(res.status).toBe(401);
  });

  it("return 500 wenn Spoonacular throws known error", async () => {
    getRecipeDetailsMock.mockRejectedValueOnce(
      Object.assign(new Error("auth kaputt"), {
        code: "spoonacular_auth_error",
      })
    );

    const res = await request(app)
      .post("/api/recipes/save")
      .set("Cookie", cookie)
      .send({ spoonId: 123456 });

    expect(res.status).toBe(500);
    expect(res.body.code).toBe("save_recipe_failed");
  });

  it("return 404 wenn Spoonacular throws unknown error", async () => {
    getRecipeDetailsMock.mockRejectedValueOnce(
      Object.assign(new Error("404"), { code: "unbekannt" })
    );

    const res = await request(app)
      .post("/api/recipes/save")
      .set("Cookie", cookie)
      .send({ spoonId: 987654 });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("recipe_not_found");
  });

  it("500 if repo.saveRecipe throws", async () => {
    const uniqueSpoonId = Math.floor(Math.random() * 1e9);

    getRecipeDetailsMock.mockResolvedValueOnce({
      ...mockRecipe,
      spoonId: uniqueSpoonId,
    });

    const spy = jest
      .spyOn(
        require("../../adapter/PostgresSavedRecipeAdapter")
          .PostgresSavedRecipeAdapter.prototype,
        "saveRecipe"
      )
      .mockImplementationOnce(() => {
        throw new Error("Kaputter DB Call");
      });

    const res = await request(app)
      .post("/api/recipes/save")
      .set("Cookie", cookie)
      .send({ spoonId: uniqueSpoonId });

    expect(spy).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body.code).toBe("save_recipe_failed");

    spy.mockRestore();
  });
});
