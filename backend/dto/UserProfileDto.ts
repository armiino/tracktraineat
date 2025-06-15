import { IsInt, IsIn, IsNumber, Min, Max, IsOptional, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class UserProfileDto {
    @IsNumber()
    weight!: number; 
  
    @IsNumber()
    height!: number; 
  
    @IsInt()
    @Min(10)
    @Max(120)
    age!: number; 
  
    @IsIn(['male', 'female'])
    gender!: 'male' | 'female';
  
    @IsIn(['low', 'medium', 'high', 'superhigh'])
    activity!: 'low' | 'medium' | 'high' | 'superhigh';
  
    @IsIn(['loseWeight', 'gainMuscle', 'noChange'])
    goal!: 'loseWeight' | 'gainMuscle' | 'noChange';
  
    @IsOptional()
    @IsIn(['omnivore', 'vegetarian', 'vegan'])
    dietType: 'omnivore' | 'vegetarian' | 'vegan' = 'omnivore';
  }
  
