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

  // GitHub API URL and client details
  private githubTokenUrl = 'https://github.com/login/oauth/access_token';
  private githubUserUrl = 'https://api.github.com/user';
  private clientId = process.env.GITHUB_CLIENT_ID;
  private clientSecret = process.env.GITHUB_CLIENT_SECRET;

  // Exchange GitHub OAuth code for an access token
  private async getGitHubAccessToken(code: string): Promise<string> {
    try {
      const response = await axios.post(
        this.githubTokenUrl,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (response.data.error) {
        throw new UnauthorizedException('Failed to exchange GitHub code for access token');
      }

      return response.data.access_token;
    } catch (error) {
      throw new UnauthorizedException('GitHub token exchange failed');
    }
  }

  // Fetch user details from GitHub using the access token
  private async getGitHubUser(accessToken: string) {
    try {
      const response = await axios.get(this.githubUserUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Failed to fetch GitHub user details');
    }
  }

  // Handle GitHub login
  async handleGitHubLogin(code: string) {
    // Step 1: Exchange code for access token
    const accessToken = await this.getGitHubAccessToken(code);

    // Step 2: Fetch GitHub user details
    const { id: githubId, login: username, email } = await this.getGitHubUser(accessToken);

    // Step 3: Find or create user in the database
    let user = await this.usersService.findByGitHubId(githubId);

    if (!user) {
      // If the user does not exist, create a new user
      user = await this.usersService.createUser({
        githubId,
        email,
        password: null, // GitHub users do not have passwords
        role: UserRole.CANDIDATE,
      });
    }

    // Step 4: Generate JWT token
    const payload = { sub: user.id, role: user.role };
    const accessTokenJwt = this.jwtService.sign(payload);

    return { accessToken: accessTokenJwt, user };
  }

    // Register a new user
    async register(registerDto: RegisterDto) {
      const { email, password } = registerDto;
  
      // Check if a user with this email already exists
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = await this.usersService.createUser({
        email,
        password: hashedPassword,
        role: UserRole.CANDIDATE, // Default to CANDIDATE for registered users
      });
  
      // Remove sensitive data before returning
      const { password: _, ...result } = newUser;
      return result;
    }
  
    // Log in an existing user
    async login(loginDto: LoginDto) {
      const { email, password } = loginDto;
  
      // Find user by email
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }
  
      // Check the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }
  
      // Generate JWT token
      const payload = { sub: user.id, role: user.role };
      const accessToken = this.jwtService.sign(payload);
  
      return { accessToken, user };
  }
}
  
