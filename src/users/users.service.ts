// src/users/users.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { CvUploadDto } from './dto/cv-upload.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
          'phoneNumber',
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
        'phoneNumber',
      ],
    });
  }

  async getAllPartnersCoordinates() {
    return this.userRepository.find({
      where: { role: UserRole.PARTNER },
      select: [
        'id',
        'companyName',
        'companyCoordinates',
        'email',
        'phoneNumber',
      ],
    });
  }

  async uploadCv(userId: number, cvUploadDto: CvUploadDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const maxFileSizeBytes = 10 * 1024 * 1024; // 10MB
    const fileBuffer = Buffer.from(cvUploadDto.fileBase64, 'base64');

    if (fileBuffer.length > maxFileSizeBytes) {
      throw new BadRequestException('CV file size exceeds 10MB limit');
    }

    user.cv = fileBuffer;
    user.cvFileName = cvUploadDto.fileName;
    user.cvMimeType = cvUploadDto.mimeType;
    user.cvUploadedAt = new Date();

    return this.userRepository.save(user);
  }

  async downloadCv(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'cv', 'cvFileName', 'cvMimeType'],
    });

    if (!user || !user.cv) {
      throw new NotFoundException('CV not found');
    }

    return {
      cvFileName: user.cvFileName,
      cvMimeType: user.cvMimeType,
      cv: user.cv.toString('base64'),
    };
  }

  async removeCv(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.cv) {
      throw new NotFoundException('User does not have a CV');
    }

    // Clear CV-related fields
    user.cv = null;
    user.cvFileName = null;
    user.cvMimeType = null;
    user.cvUploadedAt = null;

    // Save and return the updated user
    const savedUser = await this.userRepository.save(user);

    // Remove sensitive data before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedUser;
    return result;
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
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['opportunities', 'applications'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use QueryRunner to ensure all operations are in a single transaction
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // If it's a partner, first delete all opportunities and applications
      if (user.role === UserRole.PARTNER) {
        // Delete all applications for this partner's opportunities
        if (user.opportunities) {
          const opportunityIds = user.opportunities.map((opp) => opp.id);
          if (opportunityIds.length > 0) {
            await queryRunner.manager.delete('applications', {
              opportunity: { id: In(opportunityIds) },
            });
          }
        }

        // Delete all opportunities
        await queryRunner.manager.delete('opportunities', {
          company: { id: user.id },
        });
      }

      // If it's a candidate, delete their applications
      if (user.role === UserRole.CANDIDATE) {
        await queryRunner.manager.delete('applications', {
          candidate: { id: user.id },
        });
      }

      // Finally delete the user
      await queryRunner.manager.remove(user);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      // If there's an error, rollback the changes
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update only the provided fields
    Object.assign(user, updateUserDto);

    // Save and return the updated user
    const savedUser = await this.userRepository.save(user);

    // Remove sensitive data before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, cv, ...result } = savedUser;
    return result;
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, cv, ...result } = user;
    return {
      ...result,
      subscriptionStatus: user.subscriptionStatus,
      stripeCustomerId: user.stripeCustomerId,
      subscriptionId: user.subscriptionId,
      subscriptionEndDate: user.subscriptionEndDate,
    };
  }
}
