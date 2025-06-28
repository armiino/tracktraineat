import express from 'express';
import { AuthController } from '../controller/authController';
import { PostgresUserAdapter } from '../adapter/PostgresUserAdapter';
import { authService as createAuthService } from '../service/authService';
import { requireAuth } from '../middleware/authMiddleware';
import { prisma } from "../prisma";

const router = express.Router();
const userRepo = new PostgresUserAdapter(prisma);
const authSvc = createAuthService(userRepo);
const controller = new AuthController(authSvc);

router.post('/register', (req, res) => controller.register(req, res));
router.post('/login', (req, res) => controller.login(req, res));
router.post('/logout', (req, res) => controller.logout(req, res));
router.get('/validate', requireAuth, (req, res) => controller.validate(req, res));

export default router;
