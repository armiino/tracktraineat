import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { app } from "../../app";

const prisma = new PrismaClient();

describe("Auth Integration", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = "testsecret";
    console.log("TEST-DATABASE:", process.env.DATABASE_URL);
  });

  afterEach(async () => {
    await prisma.savedRecipe.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registriert einen neuen Nutzer erfolgreich", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "test@example.com",
      password: "secure123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      email: "test@example.com",
      role: "user",
    });

    const userInDb = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });

    expect(userInDb).not.toBeNull();
  });
});
