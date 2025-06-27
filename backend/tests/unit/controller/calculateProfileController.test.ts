import { CalculateProfileController } from "../../../controller/calculateProfileController";
import { Request, Response } from "express";

const mockService = {
  getProfile: jest.fn(),
};

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe("CalculateProfileController", () => {
  let controller: CalculateProfileController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CalculateProfileController(mockService as any);
  });

  it("404 wenn profile not found", async () => {
    mockService.getProfile.mockResolvedValueOnce(null);
    const req = { user: { id: "user123" } } as any as Request;
    const res = mockResponse();

    await controller.calculateFromProfile(req, res);

    expect(mockService.getProfile).toHaveBeenCalledWith("user123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ code: "profile_not_found" });
  });

  it("wenn profil existiert -> berrechnete werte", async () => {
    const mockProfile = {
      calculateCaloriesProfile: jest.fn().mockReturnValue(2500),
      proteinTarget: 120,
      getCalorieAnalysis: jest.fn().mockReturnValue({ bmr: 1600, tdee: 2500 }),
    };
    mockService.getProfile.mockResolvedValueOnce(mockProfile);

    const req = { user: { id: "user123" } } as any as Request;
    const res = mockResponse();

    await controller.calculateFromProfile(req, res);

    expect(mockProfile.calculateCaloriesProfile).toHaveBeenCalled();
    expect(mockProfile.getCalorieAnalysis).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      bmr: 1600,
      tdee: 2500,
      totalCalories: 2500,
      totalProtein: 120,
    });
  });

  it("500 wenn error", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {}); 
    mockService.getProfile.mockRejectedValueOnce(new Error("fail"));

    const req = { user: { id: "user123" } } as any as Request;
    const res = mockResponse();

    await controller.calculateFromProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ code: "calculate_profile_failed" });
  });
  it("gibt 401 zurück wenn kein userId vorhanden ist", async () => {
    const req = {} as any as Request;
    const res = mockResponse();
  
    await controller.calculateFromProfile(req, res);
  
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ code: "get_profile_failed" });
  });
  
});
