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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CvUploadDto } from './dtoCV/cv-upload.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('role') role?: UserRole) {
    return this.usersService.findAll(role);
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(+id, role);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post(':id/cv')
  @UseGuards(JwtAuthGuard)
  uploadCv(
    @Param('id') id: string, 
    @Body() cvUploadDto: CvUploadDto
  ) {
    return this.usersService.uploadCv(+id, cvUploadDto);
  }

  @Get(':id/cv')
  @UseGuards(JwtAuthGuard)
  downloadCv(@Param('id') id: string) {
    return this.usersService.downloadCv(+id);
  }
}
