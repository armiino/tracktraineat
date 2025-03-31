const express = require('express');
const router = express.Router();
const { handleCalculate } = require('../controller/calculateController');

// POST /api/calculate
router.post('/calculate', handleCalculate);

module.exports = router;
