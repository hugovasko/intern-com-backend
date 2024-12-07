// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(role?: UserRole) {
    if (role) {
      return this.userRepository.find({
        where: { role },
        select: [
          'id',
          'firstName',
          'lastName',
          'email',
          'companyName',
          'role',
          'createdAt',
        ],
      });
    }
    return this.userRepository.find({
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'companyName',
        'role',
        'createdAt',
      ],
    });
  }

  async updateRole(id: number, role: UserRole) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userRepository.remove(user);
  }
}
