import express from 'express';
import { AuthController } from '../controller/authController';
import { PostgresUserAdapter } from '../adapter/PostgresUserAdapter';
import { authService as createAuthService } from '../service/authService';

const router = express.Router();
const userRepo = new PostgresUserAdapter();
const authSvc = createAuthService(userRepo);
const controller = new AuthController(authSvc);

router.post('/register', (req, res) => controller.register(req, res));
router.post('/login', (req, res) => controller.login(req, res));

export default router;
