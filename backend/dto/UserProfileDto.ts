import { IsInt, IsIn, IsNumber, Min, Max, IsOptional } from 'class-validator';

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
    @IsNumber()
    burned?: number; //verbrannte kalorien optional.. wird ja dann in der calculate funktion verwendet aber muss nicht wirklich geliefert werden..
  }
  
