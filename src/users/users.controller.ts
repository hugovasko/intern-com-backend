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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CvUploadDto } from './dto/cv-upload.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    if (req.user.id !== +id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only download your own CV');
    }
    return this.usersService.downloadCv(+id);
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
}
