import { Controller, Get, Param } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('user/:username')
  async getUserProfile(@Param('username') username: string) {
    return this.githubService.getUserProfile(username);
  }

  @Get('user/:username/repos')
  async listUserRepositories(@Param('username') username: string) {
    return this.githubService.listUserRepositories(username);
  }
}
