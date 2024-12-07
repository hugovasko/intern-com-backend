// src/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
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
}
