// src/opportunities/opportunities.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { query } from 'express';
//import { Query } from 'typeorm/driver/Query';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get('my-opportunities')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.PARTNER)
  async findUserOpportunities(@Request() req) {
    return this.opportunitiesService.findUserOpportunities(req.user.id);
  }

  @Get()
  async findAll(@Query('field') field?: string) {
    return this.opportunitiesService.findAll(field);
  }

  // LEFT THIS HERE IN CASE WE DECIDE TO PROCEED WITH FILTERING IN THE FRONTEND ONLY
  //@Get()
  //async findAll() {
  //  return this.opportunitiesService.findAll();
  //}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const opportunity = await this.opportunitiesService.findOne(+id);
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }
    return opportunity;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  async create(
    @Request() req,
    @Body() createOpportunityDto: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.create(
      createOpportunityDto,
      req.user.id,
      req.user.role === UserRole.ADMIN,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
  ) {
    const opportunity = await this.opportunitiesService.findOne(+id);

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    // Allow update if user is admin or owns the opportunity
    if (
      req.user.role !== UserRole.ADMIN &&
      opportunity.company.id !== req.user.id
    ) {
      throw new ForbiddenException(
        'You can only update your own opportunities',
      );
    }

    return this.opportunitiesService.update(+id, updateOpportunityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  async remove(@Request() req, @Param('id') id: string) {
    const opportunity = await this.opportunitiesService.findOne(+id);

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    // Allow deletion if user is admin or owns the opportunity
    if (
      req.user.role !== UserRole.ADMIN &&
      opportunity.company.id !== req.user.id
    ) {
      throw new ForbiddenException(
        'You can only delete your own opportunities',
      );
    }

    return this.opportunitiesService.remove(+id);
  }
}
