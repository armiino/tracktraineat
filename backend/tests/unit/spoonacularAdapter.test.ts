import axios from "axios";
import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { SpoonacularAdapter } from "../../adapter/spoonacularAdapter";
import { app } from "../../app";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const prisma = new PrismaClient();

const email = "adapteruser@domain.com";
let cookie: string[] = [];

const recipeMockResponse = {
  data: {
    results: [
      {
        id: 1,
        title: "Mock Recipe",
        image: "mock.jpg",
        nutrition: {
          nutrients: [
            { name: "Calories", amount: 400 },
            { name: "Protein", amount: 30 },
            { name: "Fat", amount: 10 },
            { name: "Carbohydrates", amount: 60 },
          ],
        },
      },
    ],
  },
};

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret";
  process.env.SPOONACULAR_API_KEY = "testkey";
  process.env.NODE_ENV = "test";

  await prisma.savedRecipe.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post("/auth/register").send({
    email,
    password: "Test1234!",
  });

  const login = await request(app).post("/auth/login").send({
    email,
    password: "Test1234!",
  });

  const setCookie = login.headers["set-cookie"];
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

beforeEach(() => {
  process.env.SPOONACULAR_API_KEY = "testkey";
  mockedAxios.get.mockResolvedValue(recipeMockResponse);
  jest.clearAllMocks();
});

afterEach(() => {
  process.env.SPOONACULAR_API_KEY = "testkey";
});

describe("SpoonacularAdapter", () => {
  it("fetch and map recipes", async () => {
    const adapter = new SpoonacularAdapter();
    const result = await adapter.searchRecipesByCaloriesAndProtein(
      500,
      30,
      "omnivore",
      1
    );

    expect(mockedAxios.get).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 1,
      title: "Mock Recipe",
      image: "mock.jpg",
      calories: 400,
      protein: 30,
      fat: 10,
      carbs: 60,
    });
  });
  // eslint-disable-next-line jest/expect-expect
  it(" throw wenn API key is missing", async () => {
    expect.assertions(1);
    const adapter = new SpoonacularAdapter();

    const originalKey = process.env.SPOONACULAR_API_KEY;
    delete process.env.SPOONACULAR_API_KEY;

    await expect(
      adapter.searchRecipesByCaloriesAndProtein(500, 30, "omnivore")
    ).rejects.toThrow("API-Key fehlt");

    process.env.SPOONACULAR_API_KEY = originalKey;
  });
  // eslint-disable-next-line jest/expect-expect
  it("throw wrapped 404", async () => {
    expect.assertions(1); // ✅ Neu hinzugefügt
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 404 },
    });

    const adapter = new SpoonacularAdapter();
    await expect(adapter.getRecipeDetails(99999)).rejects.toMatchObject({
      code: "spoonacular_not_found",
    });
  });
  // eslint-disable-next-line jest/expect-expect
  it("throw wrapped 403", async () => {
    expect.assertions(1);
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 403 },
    });

    const adapter = new SpoonacularAdapter();
    await expect(adapter.getRecipeDetails(1)).rejects.toMatchObject({
      code: "spoonacular_auth_error",
    });
  });
  // eslint-disable-next-line jest/expect-expect
  it("throw unknown error", async () => {
    expect.assertions(1);
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 500 },
    });

    const adapter = new SpoonacularAdapter();
    await expect(adapter.getRecipeDetails(1)).rejects.toMatchObject({
      code: "spoonacular_unknown_error",
    });
  });
});
