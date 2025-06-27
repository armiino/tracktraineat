import { requireAuth } from "../../../middleware/authMiddleware";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

jest.mock("jsonwebtoken");

describe("requireAuth Middleware", () => {
  const mockReq = (token?: string) =>
    ({
      cookies: token ? { token } : {},
    } as any as Request);

  const mockRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    return res as Response;
  };

  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("gibt 401 zurück wenn kein Token vorhanden ist", () => {
    const req = mockReq();
    const res = mockRes();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ code: "no_token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("gibt 403 zurück wenn das Token ungültig ist", () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("invalid");
    });

    const req = mockReq("fake.token.here");
    const res = mockRes();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ code: "invalid_token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("ruft next() auf wenn Token gültig ist", () => {
    const decodedUser = { id: "123", role: "user" };
    (jwt.verify as jest.Mock).mockReturnValue(decodedUser);

    const req = mockReq("valid.token");
    const res = mockRes();

    requireAuth(req, res, next);

    expect((req as any).user).toEqual(decodedUser);
    expect(next).toHaveBeenCalled();
  });
});
