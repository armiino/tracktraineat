import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoute from "../../../route/authRoute";
import calculateRoute from "../../../route/calculateRoute";
import calculateProfileRoute from "../../../route/calculateProfileRoute";
import { createRecipeRoute } from "../../../route/recipeRoute";
import { createUserProfileRoute } from "../../../route/userProfileRoute";
import { createSavedRecipeRoute } from "../../../route/savedRecipeRoute";

export function createAppWithCustomRecipeRoute(adapter: any) {
  const app = express();
  app.disable("x-powered-by");

  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.use("/auth", authRoute);
  app.use("/api", calculateRoute);
  app.use("/api", calculateProfileRoute);
  app.use("/api", createSavedRecipeRoute(adapter));
  app.use("/api", createRecipeRoute(adapter));
  app.use("/api", createUserProfileRoute());

  app.get("/", (_req, res) => {
    res.send("Testserver läuft");
  });

  return app;
}
