// src/opportunities/opportunities.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { Opportunity } from '../entities/opportunity.entity';
import { User } from '../entities/user.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Opportunity, User])],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService, SubscriptionsService],
})
export class OpportunitiesModule {}
