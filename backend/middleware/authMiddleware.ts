import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RequestWithUser } from "../globalTypes/RequestWithUser";

const JWT_SECRET = process.env.JWT_SECRET ?? "jwtsecrettest";

export const requireAuth = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ code: "no_token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email?: string;
    };
    req.user = decoded;
    return next();
  } catch (err) {
    console.log("Token ist invalide", err);
    res.status(403).json({ code: "invalid_token" });
  }
};
