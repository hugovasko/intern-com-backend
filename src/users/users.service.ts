// src/users/users.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { CvUploadDto } from './dtoCV/cv-upload.dto';

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
  
  async uploadCv(userId: number, cvUploadDto: CvUploadDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const maxFileSizeBytes = 5 * 1024 * 1024; // 5MB
    const fileBuffer = Buffer.from(cvUploadDto.fileBase64, 'base64');
    
    if (fileBuffer.length > maxFileSizeBytes) {
      throw new BadRequestException('CV file size exceeds 5MB limit');}
    
      user.cv = fileBuffer;
      user.cvFileName = cvUploadDto.fileName;
      user.cvMimeType = cvUploadDto.mimeType;
      user.cvUploadedAt = new Date();
  
      return this.userRepository.save(user);
  }

  async downloadCv(userId: number) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'cv', 'cvFileName', 'cvMimeType'] 
    });

    if (!user || !user.cv) {
      throw new NotFoundException('CV not found');
    }

    return {
      fileName: user.cvFileName,
      mimeType: user.cvMimeType,
      file: user.cv.toString('base64')
    }
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
