import { Request, Response } from 'express';
import { calculateCalories, CalorieInput } from '../service/calculateService';

export const handleCalculate = (req: Request, res: Response): void => {
  const { weight, height, age, gender, activity, goal, burned } = req.body;

  // billo validierung einfach kurzer check - sind alle eingaben vorhanden? 
  // TODO im frontend dann richtige Validierung
  if (!weight || !height || !age || !gender || !activity || !goal) {
     res.status(400).json({ error: 'Missing required parameters' });
     return;
  }


  const input: CalorieInput = {
    weight: Number(weight),
    height: Number(height),
    age: Number(age),
    gender,
    activity,
    goal,
    burned: Number(burned) || 0,
  };

  const totalCalories = calculateCalories(input);

  res.status(200).json({ totalCalories });
};
