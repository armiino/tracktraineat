import express from 'express';
import { CalculateProfileController } from '../controller/calculateProfileController';
import { PostgresUserProfileAdapter } from '../adapter/PostgresUserProfileAdapter';
import { userProfileService } from '../service/userProfileService';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

const adapter = new PostgresUserProfileAdapter();
const service = userProfileService(adapter);
const controller = new CalculateProfileController(service);

router.get('/calculate/from-profile', requireAuth, (req, res) => controller.calculateFromProfile(req, res));

export default router;
