// src/opportunities/opportunities.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from '../entities/opportunity.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findAll(): Promise<Opportunity[]> {
    return this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.company', 'company')
      .where('company.subscriptionStatus = :status', { status: 'active' })
      .select([
        'opportunity',
        'company.id',
        'company.firstName',
        'company.lastName',
        'company.email',
        'company.companyName',
      ])
      .getMany();
  }

  async findOne(id: number): Promise<Opportunity> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id },
      relations: ['company'],
      select: {
        company: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          companyName: true,
          subscriptionStatus: true,
        },
      },
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }

    // Check if company has active subscription
    if (opportunity.company.subscriptionStatus !== 'active') {
      throw new NotFoundException(
        'This opportunity is not currently available',
      );
    }

    return opportunity;
  }

  async findUserOpportunities(userId: number): Promise<Opportunity[]> {
    return this.opportunityRepository.find({
      where: {
        company: { id: userId },
      },
      relations: ['company'],
      select: {
        company: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          subscriptionStatus: true,
        },
      },
    });
  }

  async create(
    createOpportunityDto: CreateOpportunityDto,
    userId: number,
    isAdmin: boolean = false,
  ): Promise<Opportunity> {
    const partnerId = isAdmin ? createOpportunityDto.partnerId : userId;

    // Find the company/partner and explicitly check their role
    const company = await this.userRepository.findOne({
      where: {
        id: partnerId,
        role: UserRole.PARTNER,
      },
    });

    if (!company) {
      throw new NotFoundException('Partner not found');
    }

    if (!isAdmin) {
      const hasActiveSubscription =
        await this.subscriptionsService.hasActiveSubscription(partnerId);
      if (!hasActiveSubscription) {
        throw new ForbiddenException(
          'Active subscription required to create opportunities',
        );
      }
    }

    const opportunity = this.opportunityRepository.create({
      ...createOpportunityDto,
      company,
    });

    return this.opportunityRepository.save(opportunity);
  }

  async update(
    id: number,
    updateOpportunityDto: UpdateOpportunityDto,
    userId: number,
    isAdmin: boolean = false,
  ): Promise<Opportunity> {
    const opportunity = await this.findOne(id);

    // Check subscription status if not admin and is the company owner
    if (!isAdmin && opportunity.company.id === userId) {
      const hasActiveSubscription =
        await this.subscriptionsService.hasActiveSubscription(userId);
      if (!hasActiveSubscription) {
        throw new ForbiddenException(
          'Active subscription required to update opportunities',
        );
      }
    }

    const updatedOpportunity = Object.assign(opportunity, updateOpportunityDto);
    return this.opportunityRepository.save(updatedOpportunity);
  }

  async remove(id: number): Promise<void> {
    const result = await this.opportunityRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }
  }
}
