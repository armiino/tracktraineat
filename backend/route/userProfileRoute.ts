import express from "express";
import { PostgresUserProfileAdapter } from "../adapter/PostgresUserProfileAdapter";
import { userProfileService } from "../service/userProfileService";
import { UserProfileController } from "../controller/UserProfileController";
import { requireAuth } from "../middleware/authMiddleware";
import { prisma } from "../prisma";

export const createUserProfileRoute = () => {
  const adapter = new PostgresUserProfileAdapter(prisma);
  const service = userProfileService(adapter);
  const controller = new UserProfileController(service);

  const router = express.Router();

  router.get("/profile", requireAuth, (req, res) =>
    controller.getProfile(req, res)
  );
  router.post("/profile", requireAuth, (req, res) =>
    controller.createProfile(req, res)
  );
  router.put("/profile", requireAuth, (req, res) =>
    controller.updateProfile(req, res)
  );

  return router;
};
