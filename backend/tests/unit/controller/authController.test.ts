import { AuthController } from "../../../controller/authController";
import { Request, Response } from "express";

jest.mock("class-validator", () => ({
  validate: jest.fn().mockResolvedValue([]),
  IsEmail: () => () => {},
  Length: () => () => {},
}));

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.cookie = jest.fn().mockReturnThis();
  res.clearCookie = jest.fn().mockReturnThis();
  return res as Response;
};

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController(mockAuthService as any);
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("400 wenn validation fails", async () => {
      const { validate } = require("class-validator");
      validate.mockResolvedValueOnce([
        { property: "email", constraints: { isEmail: "invalid" } },
      ]);
      const req = { body: {} } as Request;
      const res = mockResponse();

      await controller.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Validation failed" })
      );
    });

    it("authService.register und respond mit 201", async () => {
      const userMock = {
        getPublicProfile: () => ({ id: "1", email: "test", role: "user" }),
      };
      mockAuthService.register.mockResolvedValueOnce(userMock);
      const req = {
        body: { email: "test@test.de", password: "123456" },
      } as Request;
      const res = mockResponse();

      await controller.register(req, res);

      expect(mockAuthService.register).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(userMock.getPublicProfile());
    });

    it("email_taken error", async () => {
      const err = new Error("exists") as any;
      err.code = "email_taken";
      mockAuthService.register.mockRejectedValueOnce(err);

      const req = { body: { email: "x", password: "y" } } as Request;
      const res = mockResponse();

      await controller.register(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe("login", () => {
    it("400 wenn validation fails", async () => {
      const { validate } = require("class-validator");
      validate.mockResolvedValueOnce([
        { property: "password", constraints: { minLength: "too short" } },
      ]);

      const req = { body: {} } as Request;
      const res = mockResponse();

      await controller.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("authService.login und set cookie", async () => {
      mockAuthService.login.mockResolvedValueOnce("token123");
      const req = {
        body: { email: "test@test.de", password: "123456" },
      } as Request;
      const res = mockResponse();

      await controller.login(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "token123",
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("invalid_credentials", async () => {
      const err = new Error("fail") as any;
      err.code = "invalid_credentials";
      mockAuthService.login.mockRejectedValueOnce(err);

      const req = { body: { email: "x", password: "y" } } as Request;
      const res = mockResponse();

      await controller.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe("logout", () => {
    it("clears token und responds 200", async () => {
      const req = {} as Request;
      const res = mockResponse();

      await controller.logout(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith("token", expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("validate", () => {
    it("401 wenn kein user", async () => {
      const req = {} as Request;
      const res = mockResponse();

      await controller.validate(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 200 und user data wenn user existiert", async () => {
      const req = { user: { id: "1", role: "user" } } as any;
      const res = mockResponse();

      await controller.validate(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        authenticated: true,
        user: req.user,
      });
    });
    it("login error mit 500", async () => {
      const err = new Error("Some DB error") as any;
      mockAuthService.login.mockRejectedValueOnce(err);

      const req = {
        body: { email: "fail@test.de", password: "secret" },
      } as Request;
      const res = mockResponse();

      await controller.login(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ code: "login_failed" });
    });
    it("register error mit 500", async () => {
      const err = new Error("Something failed") as any;
      mockAuthService.register.mockRejectedValueOnce(err);

      const req = {
        body: { email: "fail@test.de", password: "secret" },
      } as Request;
      const res = mockResponse();

      await controller.register(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ code: "register_failed" });
    });
    it("error logout", async () => {
      const req = {} as Request;
      const res = mockResponse();

      res.clearCookie = jest.fn(() => {
        throw new Error("Fail");
      });

      await controller.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ code: "logout_failed" });
    });
  });
});
