import { IsInt, Min } from "class-validator";

export class SaveRecipeRequestDto {
  @IsInt()
  @Min(1)
  spoonId!: number;
}
