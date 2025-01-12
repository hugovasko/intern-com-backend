import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApplicationStatus } from '../../entities/application.entity';

export class UpdateApplicationDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
