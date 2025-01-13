import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async getUserProfile(username: string) {
    try {
      const { data } = await this.octokit.users.getByUsername({ username });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch GitHub user profile: ${error.message}`);
    }
  }

  async listUserRepositories(username: string) {
    try {
      const { data } = await this.octokit.repos.listForUser({ username });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  }
}
