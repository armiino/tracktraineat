import { Request, Response } from "express";
import { validate } from "class-validator";
import { CalorieCalculationDto } from "../dto/CalorieCalculationDto";
import { calculateCalories } from "../service/calculateService";

export const handleCalculate = async (
  req: Request,
  res: Response
): Promise<void> => {
  const dto = new CalorieCalculationDto();
  Object.assign(dto, req.body);

  const errors = await validate(dto);
  if (errors.length > 0) {
    res.status(400).json({
      code: "validation_failed",
      details: errors.map((e) => ({
        field: e.property,
        constraints: e.constraints,
      })),
    });
    return;
  }

  const totalCalories = calculateCalories(dto);
  res.status(200).json({ totalCalories });
};
