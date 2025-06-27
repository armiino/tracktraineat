import { authService } from "../../../service/authService";
import { User } from "../../../model/User";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

const mockRepo = {
  findByEmail: jest.fn(),
  save: jest.fn(),
  deleteByEmail: jest.fn(),
};

jest.mock("../../../model/User", () => ({
  User: {
    create: jest.fn(),
  },
}));

describe("authService", () => {
  const service = authService(mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("fehler wenn user schon existiert", async () => {
      mockRepo.findByEmail.mockResolvedValue({ id: "u1" });

      await expect(
        service.register({ email: "test@mail.com", password: "123456" })
      ).rejects.toThrow("User already exists");
    });

    it("speichert neuen user und returned ihn", async () => {
      const fakeUser = { id: "newUser", email: "x@mail.com" };
      mockRepo.findByEmail.mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(fakeUser);
      mockRepo.save.mockResolvedValue(undefined);

      const result = await service.register({
        email: "x@mail.com",
        password: "pw",
      });
      expect(result).toBe(fakeUser);
      expect(mockRepo.save).toHaveBeenCalledWith(fakeUser);
    });

    it("error wenn speichern failed", async () => {
      const fakeUser = { id: "failUser" };
      mockRepo.findByEmail.mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(fakeUser);
      mockRepo.save.mockRejectedValue({ code: "fail_code" });

      try {
        await service.register({ email: "x@mail.com", password: "pw" });
      } catch (err: any) {
        expect(err.message).toBe("Registrierung fehlgeschlagen");
        expect(err.code).toBe("fail_code");
      }
    });
  });

  describe("login", () => {
    it("fehler wenn repo.findByEmail fehl schlägt", async () => {
      mockRepo.findByEmail.mockRejectedValue({});

      await expect(service.login("x@mail.com", "pw")).rejects.toThrow(
        "Fehler beim Login"
      );
    });

    it("falsche credentials", async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      await expect(service.login("x@mail.com", "pw")).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("password falsch", async () => {
      mockRepo.findByEmail.mockResolvedValue({
        checkPassword: () => false,
      });

      await expect(service.login("x@mail.com", "pw")).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("liefert jwt wenn login erfolgreich", async () => {
      const user = {
        checkPassword: () => true,
        getPublicProfile: () => ({ id: "id123", role: "user" }),
      };

      mockRepo.findByEmail.mockResolvedValue(user);
      (jwt.sign as jest.Mock).mockReturnValue("signed-token");

      const token = await service.login("x@mail.com", "pw");
      expect(token).toBe("signed-token");
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "id123", role: "user" },
        expect.any(String),
        { expiresIn: "2h" }
      );
    });
  });
});
