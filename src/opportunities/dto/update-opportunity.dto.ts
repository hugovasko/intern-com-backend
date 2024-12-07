// src/opportunities/dto/update-opportunity.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateOpportunityDto } from './create-opportunity.dto';

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {}
