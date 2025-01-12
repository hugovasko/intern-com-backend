import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @IsNumber()
  opportunityId: number;

  @IsOptional()
  @IsString()
  message?: string;
}
