import { handleCalculate } from '../../../controller/calculateController';
import { Request, Response } from 'express';

//faken weil hier teste ich nicht die validator logik.. 
jest.mock('class-validator', () => {
    return {
      validate: jest.fn().mockResolvedValue([]),
      IsNumber: () => () => {},
      Min: () => () => {},
      Max: () => () => {},
      IsIn: () => () => {},
      IsOptional: () => () => {},
      IsInt: () => () => {},
      ArrayMinSize: () => () => {},
      ArrayMaxSize: () => () => {},
      IsArray: () => () => {},
    };
  });
  

jest.mock('../../../service/calculateService', () => ({
  calculateCalories: jest.fn(() => 2222),
}));

describe('handleCalculate', () => {
  const mockRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res as Response;
  };

  it('return 400 wenn validation fails', async () => {
    const { validate } = require('class-validator');
    validate.mockResolvedValueOnce([
      { property: 'age', constraints: { min: 'too young' } },
    ]);

    const req = { body: {} } as Request;
    const res = mockRes();

    await handleCalculate(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      code: 'validation_failed',
      details: [{ field: 'age', constraints: { min: 'too young' } }],
    });
  });

  it('kcal und 200er', async () => {
    const req = {
      body: {
        weight: 70,
        height: 175,
        age: 25,
        gender: 'male',
        activity: 'medium',
        goal: 'gainMuscle',
        burned: 200,
      },
    } as Request;
    const res = mockRes();

    await handleCalculate(req, res);

    const { calculateCalories } = require('../../../service/calculateService');
    expect(calculateCalories).toHaveBeenCalledWith(expect.objectContaining(req.body));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ totalCalories: 2222 });
  });
});
