import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { CalculateProfileController } from '../controller/calculateProfileController';

const router = express.Router();
const controller = new CalculateProfileController();

// GET /api/calculate/profile(nur für eingeloggte User desw require auth)
router.get('/calculate/profile', requireAuth, (req, res) => {
  controller.calculateFromProfile(req, res);
});

export default router;
