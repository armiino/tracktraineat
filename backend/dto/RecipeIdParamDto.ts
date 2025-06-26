import { IsInt, Min } from 'class-validator';

export class RecipeIdParamDto {
  @IsInt()
  @Min(1)
  id!: number;
}
