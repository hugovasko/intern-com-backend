// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { ApplicationsService } from '../applications/applications.service';
import { Application } from '../entities/application.entity';
import { Opportunity } from '../entities/opportunity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Application, Opportunity])],
  controllers: [UsersController],
  providers: [UsersService, ApplicationsService],
  exports: [UsersService], // Export if other modules need to use the service
})
export class UsersModule {}
