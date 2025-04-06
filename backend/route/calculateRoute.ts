import { Router } from 'express';
import { handleCalculate } from '../controller/calculateController';

const router = Router();

router.post('/calculate', handleCalculate);

export default router;
