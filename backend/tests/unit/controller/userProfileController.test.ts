import { UserProfileController } from "../../../controller/UserProfileController";
import { Response } from "express";
import { validate } from "class-validator";

jest.mock("class-validator", () => {
  const original = jest.requireActual("class-validator");
  return {
    ...original,
    validate: jest.fn().mockResolvedValue([]),
  };
});

const mockService = {
  getProfile: jest.fn(),
  createProfile: jest.fn(),
  updateProfile: jest.fn(),
};

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe("UserProfileController", () => {
  let controller: UserProfileController;

  beforeEach(() => {
    controller = new UserProfileController(mockService as any);
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("getProfile", () => {
    it("gibt 404 zurück, wenn kein Profil existiert", async () => {
      mockService.getProfile.mockResolvedValueOnce(null);
      const req = { user: { id: "user1" } } as any;
      const res = mockResponse();

      await controller.getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("gibt Profil zurück", async () => {
      const dummyProfile = { userId: "user1" };
      mockService.getProfile.mockResolvedValueOnce(dummyProfile);
      const req = { user: { id: "user1" } } as any;
      const res = mockResponse();

      await controller.getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(dummyProfile);
    });

    it("gibt 500 zurück bei Fehler", async () => {
      mockService.getProfile.mockRejectedValueOnce(new Error("fail"));
      const req = { user: { id: "user1" } } as any;
      const res = mockResponse();

      await controller.getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createProfile", () => {
    it("gibt 400 zurück bei ungültiger Eingabe", async () => {
      (validate as jest.Mock).mockResolvedValueOnce([{ property: "age" }]);
      const req = { body: {}, user: { id: "user1" } } as any;
      const res = mockResponse();

      await controller.createProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("gibt 201 zurück bei erfolgreicher Erstellung", async () => {
      mockService.createProfile.mockResolvedValueOnce({ userId: "user1" });
      const req = { body: { age: 25 }, user: { id: "user1" } } as any;
      const res = mockResponse();

      await controller.createProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("gibt 500 zurück bei Fehler", async () => {
      mockService.createProfile.mockRejectedValueOnce(new Error("fail"));
      const req = { body: { age: 25 }, user: { id: "user1" } } as any;
      const res = mockResponse();

      await controller.createProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateProfile", () => {
    it("gibt 400 zurück bei ungültiger Eingabe", async () => {
      (validate as jest.Mock).mockResolvedValueOnce([{ property: "goal" }]);
      const req = { body: {}, user: { id: "user1" } } as any;
      const res = mockResponse();

      await controller.updateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("gibt 200 zurück bei erfolgreichem Update", async () => {
      mockService.updateProfile.mockResolvedValueOnce({ success: true });
      const req = {
        body: { goal: "gainMuscle" },
        user: { id: "user1" },
      } as any;
      const res = mockResponse();

      await controller.updateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("gibt 404 zurück, wenn Profil nicht gefunden wird", async () => {
      const error = new Error("Profil nicht gefunden");
      error.name = "NotFoundError"; // <<< wichtig!
      mockService.updateProfile.mockRejectedValueOnce(error);
      const req = { body: {}, user: { id: "user1" } } as any;
      const res = mockResponse();
    
      await controller.updateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    
    it("gibt 500 zurück bei anderen Fehlern", async () => {
      const error = new Error("Sonstiger Fehler");
      mockService.updateProfile.mockRejectedValueOnce(error);
      const req = { body: {}, user: { id: "user1" } } as any;
      const res = mockResponse();

      await controller.updateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
    it("gibt 401 zurück, wenn userId fehlt (getProfile)", async () => {
      const req = {} as any;
      const res = mockResponse();

      await controller.getProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ code: "no_token" });
    });

    it("gibt 401 zurück, wenn userId fehlt (createProfile)", async () => {
      const req = { body: {} } as any;
      const res = mockResponse();

      await controller.createProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ code: "no_token" });
    });

    it("gibt 401 zurück, wenn userId fehlt (updateProfile)", async () => {
      const req = { body: {} } as any;
      const res = mockResponse();

      await controller.updateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ code: "no_token" });
    });
  });
});
