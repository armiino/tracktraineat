
import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

// GET request /test/testRequireAuth -> nur wenn eingeloggt
router.get('/testRequireAuth', requireAuth, (req, res) => {
  const user = (req as any).user;
  res.json({ message: 'INFO: login successfull', user }); // im postman als responsebody zu sehen
});
export default router;
