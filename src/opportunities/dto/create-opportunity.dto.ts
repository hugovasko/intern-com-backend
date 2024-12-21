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
  @IsString()
  salary?: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsNumber()
  partnerId?: number;

  @IsNotEmpty()
  @IsString()
  field: string; 
}
