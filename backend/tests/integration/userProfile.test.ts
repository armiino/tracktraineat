import request from "supertest";
import { app } from "../../app";
import { PostgresUserProfileAdapter } from "../../adapter/PostgresUserProfileAdapter";
import { prisma } from "../../prisma";

describe("UserProfile Integration", () => {
  let cookie: string[] = [];

  beforeAll(async () => {
    process.env.JWT_SECRET = "testsecret";
    console.log("TEST-DATABASE:", process.env.DATABASE_URL);

    await prisma.savedRecipe.deleteMany();
    await prisma.user.deleteMany();

    await request(app).post("/auth/register").send({
      email: "testuser123@domain.com",
      password: "Test1234!",
    });

    const loginRes = await request(app).post("/auth/login").send({
      email: "testuser123@domain.com",
      password: "Test1234!",
    });

    const setCookie = loginRes.headers["set-cookie"];
    cookie = Array.isArray(setCookie) ? setCookie : [setCookie as string];
  });

  afterAll(async () => {
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("create  user profile", async () => {
    const res = await request(app)
      .post("/api/profile")
      .set("Cookie", cookie)
      .send({
        weight: 75,
        height: 180,
        age: 25,
        gender: "male",
        activity: "medium",
        goal: "gainMuscle",
        dietType: "omnivore",
      });

    expect(res.status).toBe(201);
    expect(res.body.weight).toBe(75);
  });

  it("return 409 wenn profile already exists", async () => {
    await request(app).post("/api/profile").set("Cookie", cookie).send({
      weight: 75,
      height: 180,
      age: 25,
      gender: "male",
      activity: "medium",
      goal: "gainMuscle",
      dietType: "omnivore",
    });

    const res = await request(app)
      .post("/api/profile")
      .set("Cookie", cookie)
      .send({
        weight: 75,
        height: 180,
        age: 25,
        gender: "male",
        activity: "medium",
        goal: "gainMuscle",
        dietType: "omnivore",
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("profile_already_existing");
  });

  it("get  user profile", async () => {
    const res = await request(app).get("/api/profile").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.age).toBe(25);
  });

  it("update user profile", async () => {
    const res = await request(app)
      .put("/api/profile")
      .set("Cookie", cookie)
      .send({
        weight: 80,
        height: 180,
        age: 25,
        gender: "male",
        activity: "high",
        goal: "gainMuscle",
        dietType: "vegan",
      });

    expect(res.status).toBe(200);
    expect(res.body.dietType).toBe("vegan");
  });

  it("return 404 wenn profile nicht existiert", async () => {
    await prisma.userProfile.deleteMany();

    const res = await request(app).get("/api/profile").set("Cookie", cookie);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("profile_not_found");
  });

  it("return 401 wenn nicht authenticated", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.status).toBe(401);
  });

  it("return 400 wenn validation fails", async () => {
    const res = await request(app)
      .post("/api/profile")
      .set("Cookie", cookie)
      .send({ weight: "not_a_number" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("validation_failed");
  });

  it("handle unexpected errors", async () => {
    jest
      .spyOn(PostgresUserProfileAdapter.prototype, "save")
      .mockImplementation(() => {
        throw new Error("Something went terribly wrong");
      });

    const res = await request(app)
      .post("/api/profile")
      .set("Cookie", cookie)
      .send({
        weight: 70,
        height: 175,
        age: 24,
        gender: "male",
        activity: "low",
        goal: "loseWeight",
        dietType: "vegetarian",
      });

    expect(res.status).toBe(500);
    expect(res.body.code).toBe("create_profile_failed");
  });

  it("return 500 wenn getProfile throws unexpected error", async () => {
    jest
      .spyOn(PostgresUserProfileAdapter.prototype, "findByUserId")
      .mockImplementationOnce(() => {
        throw new Error("DB read failed");
      });

    const res = await request(app).get("/api/profile").set("Cookie", cookie);

    expect(res.status).toBe(500);
    expect(res.body.code).toBe("get_profile_failed");
  });

  it("return 500 wenn updateProfile throws unknown error", async () => {
    jest
      .spyOn(PostgresUserProfileAdapter.prototype, "update")
      .mockImplementationOnce(() => {
        throw new Error("Unexpected update error");
      });

    const res = await request(app)
      .put("/api/profile")
      .set("Cookie", cookie)
      .send({
        weight: 85,
        height: 180,
        age: 26,
        gender: "male",
        activity: "high",
        goal: "gainMuscle",
        dietType: "vegan",
      });

    expect(res.status).toBe(500);
    expect(res.body.code).toBe("update_profile_failed");
  });

  it("404 if NotFoundError is thrown during update", async () => {
    const notFoundError = new Error("Profil nicht gefunden");
    notFoundError.name = "NotFoundError";

    jest
      .spyOn(PostgresUserProfileAdapter.prototype, "update")
      .mockImplementationOnce(() => {
        throw notFoundError;
      });

    const res = await request(app)
      .put("/api/profile")
      .set("Cookie", cookie)
      .send({
        weight: 85,
        height: 180,
        age: 26,
        gender: "male",
        activity: "high",
        goal: "gainMuscle",
        dietType: "vegan",
      });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("profile_not_found");
  });
});
