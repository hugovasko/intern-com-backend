// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import axios from 'axios';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async handleGitHubLogin(githubId: string, username: string, email: string) {
    // Check if the user already exists
    const existingUser = await this.usersService.findByGitHubId(githubId);
  
    if (existingUser) {
      const payload = { sub: existingUser.id, role: existingUser.role };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken, user: existingUser };
    }
  
    // Create a new user if one doesn't exist
    const newUser = await this.usersService.createUser(
      githubId,
      username,
      email,
    );
  
    const payload = { sub: newUser.id, role: newUser.role };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user: newUser };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByGitHubId(githubId);
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user with all possible fields
    const newUser = await this.usersService.createUser(githubId, username, email);
      ...registerDto,
      password: hashedPassword,
      role: registerDto.role || UserRole.CANDIDATE, // Default to CANDIDATE if not specified
    });

    await this.userRepository.save(user);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        companyCoordinates: user.companyCoordinates,
        phoneNumber: user.phoneNumber,
        cvFileName: user.cvFileName,
        cvMimeType: user.cvMimeType,
      },
    };  
  }
}
