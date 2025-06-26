import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "jwtsecrettest";

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ code: "no_token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded; //req objekt noch ein userfeld hinzufügn (aktuell nur mit any möglich TODO: lösung suchen um any zu umgehen)

    return next();
  } catch (err) {
    res.status(403).json({ code: "invalid_token" });
    return;
  }
};
