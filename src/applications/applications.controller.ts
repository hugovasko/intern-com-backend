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
  ForbiddenException,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(UserRole.CANDIDATE)
  create(@Request() req, @Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto, req.user.id);
  }

  @Get('my-applications')
  @UseGuards(RoleGuard)
  @Roles(UserRole.CANDIDATE)
  findMyApplications(@Request() req) {
    return this.applicationsService.findByCandidate(req.user.id);
  }

  @Get('company-applications')
  @UseGuards(RoleGuard)
  @Roles(UserRole.PARTNER)
  findCompanyApplications(@Request() req) {
    return this.applicationsService.findByCompany(req.user.id);
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.applicationsService.findAll();
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.CANDIDATE)
  async findOne(@Request() req, @Param('id') id: string) {
    const application = await this.applicationsService.findOne(+id);

    // Check if user has permission to view this application
    if (
      req.user.role === UserRole.CANDIDATE &&
      application.candidateId !== req.user.id
    ) {
      throw new ForbiddenException('You can only view your own applications');
    }

    if (
      req.user.role === UserRole.PARTNER &&
      application.opportunity.company.id !== req.user.id
    ) {
      throw new ForbiddenException(
        'You can only view applications for your opportunities',
      );
    }

    return application;
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    const application = await this.applicationsService.findOne(+id);

    // Check if partner has permission to update this application
    if (
      req.user.role === UserRole.PARTNER &&
      application.opportunity.company.id !== req.user.id
    ) {
      throw new ForbiddenException(
        'You can only update applications for your opportunities',
      );
    }

    return this.applicationsService.update(+id, updateApplicationDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(+id);
  }
}
