import express from "express";
import { CalculateProfileController } from "../controller/calculateProfileController";
import { PostgresUserProfileAdapter } from "../adapter/PostgresUserProfileAdapter";
import { userProfileService } from "../service/userProfileService";
import { requireAuth } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

const adapter = new PostgresUserProfileAdapter(prisma);
const service = userProfileService(adapter);
const controller = new CalculateProfileController(service);

router.get("/calculate/from-profile", requireAuth, (req, res) =>
  controller.calculateFromProfile(req, res)
);
router.post("/calculateProfile", requireAuth, (req, res) =>
  controller.calculateFromProfile(req, res)
);

export default router;
