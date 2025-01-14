// src/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  ForbiddenException,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CvUploadDto } from './dto/cv-upload.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApplicationsService } from '../applications/applications.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly applicationsService: ApplicationsService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query('role') role?: UserRole) {
    return this.usersService.findAll(role);
  }

  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(+id, role);
  }

  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // User profile management routes
  @Get('me')
  async getCurrentUser(@Req() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Allow if user is updating their own profile or is an admin
    if (req.user.id !== +id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(+id, updateUserDto);
  }

  @Post(':id/cv')
  async uploadCv(
    @Req() req,
    @Param('id') id: string,
    @Body() cvUploadDto: CvUploadDto,
  ) {
    if (req.user.id !== +id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only upload CV to your own profile',
      );
    }
    return this.usersService.uploadCv(+id, cvUploadDto);
  }

  @Get(':id/cv')
  async downloadCv(@Req() req, @Param('id') id: string) {
    const userId = +id;
    const requestingUser = req.user;

    if (
      requestingUser.id === userId ||
      requestingUser.role === UserRole.ADMIN
    ) {
      return this.usersService.downloadCv(userId);
    }

    if (requestingUser.role === UserRole.PARTNER) {
      const hasApplication =
        await this.applicationsService.hasApplicationForCompany(
          userId,
          requestingUser.id,
        );

      if (hasApplication) {
        return this.usersService.downloadCv(userId);
      }
    }

    throw new ForbiddenException(
      'You do not have permission to download this CV',
    );
  }

  @Delete(':id/cv')
  async removeCv(@Req() req, @Param('id') id: string) {
    if (req.user.id !== +id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only remove your own CV');
    }
    return this.usersService.removeCv(+id);
  }

  @Public()
  @Get('all-partnes-coordinates')
  getAllPartnersCoordinates() {
    return this.usersService.getAllPartnersCoordinates();
  }

  @Post('auth/github')
  async githubLogin(@Body('code') code: string) {
    if (!code) {
      throw new BadRequestException('GitHub OAuth code is required');
    }

    return this.authService.handleGitHubLogin(code);
  }
}

