import { Service } from 'typedi';
import { DiscordUser } from '../../dtos';
import { DiscordApi } from './discord-api';

export interface IDiscordUserApi {
  getCurrentUser(): Promise<DiscordUser>;
  getUserById(id: string): Promise<DiscordUser | undefined>;
}

@Service()
export class DiscordUserApi implements IDiscordUserApi {
  constructor(private readonly discordApi: DiscordApi) {}

  async getCurrentUser(): Promise<DiscordUser> {
    return this.discordApi.get('/users/@me');
  }

  async getUserById(id: string): Promise<DiscordUser | undefined> {
    return this.discordApi.get(`/users/${id}`);
  }
}
