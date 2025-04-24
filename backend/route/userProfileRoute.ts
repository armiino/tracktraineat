import express from 'express';
import { UserProfileController } from '../controller/UserProfileController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();
const controller = new UserProfileController();

// GET /api/profile -> Profil holen (nur eingeloggt)
router.get('/profile', requireAuth, (req, res) => {
  controller.getProfile(req, res);
});

// POST /api/profile -> Profil anlegen/aktualisieren (nur eingeloggt)
router.post('/profile', requireAuth, (req, res) => {
  controller.createProfile(req, res);
});

// PUT /api/profile -> Profil aktualisieren (nur eingeloggt)
router.put('/profile', requireAuth, (req, res) => {
    controller.updateProfile(req, res);
  });
  

export default router;
