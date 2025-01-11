// src/opportunities/dto/create-opportunity.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateOpportunityDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsNumber()
  partnerId?: number;
}
