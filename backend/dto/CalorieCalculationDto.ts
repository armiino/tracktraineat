import { IsNumber, IsIn, IsOptional, Min } from "class-validator";

export class CalorieCalculationDto {
  @IsNumber()
  @Min(1)
  weight!: number;

  @IsNumber()
  @Min(1)
  height!: number;

  @IsNumber()
  @Min(1)
  age!: number;

  @IsIn(["male", "female"])
  gender!: "male" | "female";

  @IsIn(["low", "medium", "high", "superhigh"])
  activity!: "low" | "medium" | "high" | "superhigh";

  @IsIn(["loseWeight", "gainMuscle", "noChange"])
  goal!: "loseWeight" | "gainMuscle" | "noChange";

  @IsOptional()
  @IsNumber()
  burned?: number = 0;
}
