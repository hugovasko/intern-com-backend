// src/opportunities/opportunities.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from '../entities/opportunity.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Opportunity[]> {
    return this.opportunityRepository.find({
      relations: ['company'],
      select: {
        company: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          companyName: true,
        },
      },
    });
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
        },
      },
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
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
        role: UserRole.PARTNER, // Make sure the user is a partner
      },
    });

    if (!company) {
      throw new NotFoundException('Partner not found');
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
  ): Promise<Opportunity> {
    const opportunity = await this.findOne(id);

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
