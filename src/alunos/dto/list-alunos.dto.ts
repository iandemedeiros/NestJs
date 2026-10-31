import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ListAlunosDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  curso?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nome?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
