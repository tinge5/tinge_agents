import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class WorkoutSetResultInputDto {
  @IsString()
  exerciseName!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sets!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reps!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight!: number;
}

export class SaveWorkoutSetResultDto extends WorkoutSetResultInputDto {}
