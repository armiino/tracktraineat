import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../prisma";

describe("Auth Integration", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = "testsecret";
    console.log("TEST-DATABASE:", process.env.DATABASE_URL);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(async () => {
    await prisma.savedRecipe.deleteMany();
    await prisma.userProfile.deleteMany();
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

  it("verhindert doppelte Registrierung", async () => {
    await request(app).post("/auth/register").send({
      email: "dupe@example.com",
      password: "123456",
    });

    const res = await request(app).post("/auth/register").send({
      email: "dupe@example.com",
      password: "123456",
    });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("email_taken");
  });

  it("verweigert Login mit falschem Passwort", async () => {
    await request(app).post("/auth/register").send({
      email: "wrongpass@example.com",
      password: "rightpass",
    });

    const res = await request(app).post("/auth/login").send({
      email: "wrongpass@example.com",
      password: "wrongpass",
    });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("invalid_credentials");
  });

  it("verweigert Login mit nicht existierender E-Mail", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "unknown@example.com",
      password: "whatever",
    });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("invalid_credentials");
  });

  it("loggt einen Nutzer erfolgreich ein", async () => {
    await request(app).post("/auth/register").send({
      email: "login@test.com",
      password: "secure123",
    });

    const response = await request(app).post("/auth/login").send({
      email: "login@test.com",
      password: "secure123",
    });

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("loggt den Nutzer erfolgreich aus", async () => {
    await request(app).post("/auth/register").send({
      email: "logout@test.com",
      password: "secure123",
    });

    const loginRes = await request(app).post("/auth/login").send({
      email: "logout@test.com",
      password: "secure123",
    });

    const cookies = loginRes.headers["set-cookie"];

    const response = await request(app)
      .post("/auth/logout")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ message: "Logout erfolgreich" });
  });

  it("verweigert validate ohne Token", async () => {
    const res = await request(app).get("/auth/validate");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ code: "no_token" });
  });

  it("validiert eingeloggten Nutzer", async () => {
    await request(app).post("/auth/register").send({
      email: "valid@test.com",
      password: "secure123",
    });

    const loginRes = await request(app).post("/auth/login").send({
      email: "valid@test.com",
      password: "secure123",
    });

    const cookies = loginRes.headers["set-cookie"];

    const response = await request(app)
      .get("/auth/validate")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      authenticated: true,
      user: expect.objectContaining({
        id: expect.any(String),
        role: "user",
      }),
    });
  });
});
