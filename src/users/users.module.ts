// src/users/users.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { ApplicationsService } from '../applications/applications.service';
import { Application } from '../entities/application.entity';
import { Opportunity } from '../entities/opportunity.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Application, Opportunity]),
  forwardRef(() => AuthModule),],
  controllers: [UsersController],
  providers: [UsersService, ApplicationsService],
  exports: [UsersService], 
})
export class UsersModule {}
