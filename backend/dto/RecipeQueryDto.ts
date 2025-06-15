import { IsIn, IsInt, IsOptional, Min, ValidateIf, ArrayMinSize } from 'class-validator';

export class RecipeQueryDto {
  @IsOptional()
  @Min(0)
  burned?: number = 0; // optional -> später evtl durch strava oder manuell im frontend eingebar

  @IsInt()
  @Min(1)
  mealsPerDay!: number; // später im frontend wählbar wie viele mahlzeiten/rezepte auf den tag verteilt 

  @ArrayMinSize(1)
  mealDistribution!: number[]; //[0.3, 0.3, 0.4] -> damit klar ist wie viel % wnan gegessen wird -> frühstück 0.3, mittag 0.3 ..

  @IsOptional()
  @IsIn(['omnivore', 'vegetarian','pescetarian','vegan'])
  dietType?: 'omnivore' | 'vegetarian' | 'pescetarian' | 'vegan' ;
}
