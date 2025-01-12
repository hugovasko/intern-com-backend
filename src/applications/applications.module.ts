import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from '../entities/application.entity';
import { User } from '../entities/user.entity';
import { Opportunity } from '../entities/opportunity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, User, Opportunity])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
