import axios from "axios";
import axiosRetry from "axios-retry";
import MockAdapter from "axios-mock-adapter";
import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { SpoonacularAdapter } from "../../../adapter/spoonacularAdapter";
import { app } from "../../../app";

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

describe("SpoonacularAdapter", () => {
  it("fetch and map recipes", async () => {
    const mockAxios = new MockAdapter(axios);
    mockAxios.onGet(/complexSearch/).reply(200, recipeMockResponse.data);

    const adapter = new SpoonacularAdapter(axios);
    const result = await adapter.searchRecipesByCaloriesAndProtein(
      500,
      30,
      "omnivore",
      1
    );

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

    mockAxios.restore();
  });

  it("throws when API key is missing", async () => {
    const adapter = new SpoonacularAdapter();
    const originalKey = process.env.SPOONACULAR_API_KEY;
    delete process.env.SPOONACULAR_API_KEY;

    await expect(
      adapter.searchRecipesByCaloriesAndProtein(500, 30, "omnivore")
    ).rejects.toThrow("API-Key fehlt");

    process.env.SPOONACULAR_API_KEY = originalKey;
  });

  it("throws wrapped 404", async () => {
    const mockAxios = new MockAdapter(axios);
    mockAxios.onGet(/information/).reply(404);

    const adapter = new SpoonacularAdapter(axios);

    await expect(adapter.getRecipeDetails(99999)).rejects.toMatchObject({
      code: "spoonacular_not_found",
    });

    mockAxios.restore();
  });

  it("throws wrapped 403", async () => {
    const mockAxios = new MockAdapter(axios);
    mockAxios.onGet(/information/).reply(403);

    const adapter = new SpoonacularAdapter(axios);

    await expect(adapter.getRecipeDetails(1)).rejects.toMatchObject({
      code: "spoonacular_auth_error",
    });

    mockAxios.restore();
  });

  it("throws unknown error", async () => {
    const mockAxios = new MockAdapter(axios);
    mockAxios.onGet(/information/).reply(500);

    const adapter = new SpoonacularAdapter(axios);

    await expect(adapter.getRecipeDetails(1)).rejects.toMatchObject({
      code: "spoonacular_unknown_error",
    });

    mockAxios.restore();
  });

  it("ein retry und dann korrect", async () => {
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance as any, {
      retries: 2,
      retryDelay: () => 0,
    });

    const mock = new MockAdapter(axiosInstance);
    let callCount = 0;

    mock.onGet(/complexSearch/).reply(() => {
      callCount++;
      if (callCount === 1) {
        return [500];
      }
      return [200, recipeMockResponse.data];
    });

    const adapter = new SpoonacularAdapter(axiosInstance);

    const result = await adapter.searchRecipesByCaloriesAndProtein(
      500,
      30,
      "omnivore",
      1
    );

    expect(callCount).toBe(2);
    expect(result[0]).toMatchObject({
      id: 1,
      title: "Mock Recipe",
    });

    mock.restore();
  });
});
