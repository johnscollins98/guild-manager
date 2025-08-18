import { Service } from 'typedi';
import { DiscordUser } from '../../dtos';
import { DiscordApi } from './discord-api';

export interface IDiscordUserApi {
  getCurrentUser(): Promise<DiscordUser>;
}

@Service()
export class DiscordUserApi implements IDiscordUserApi {
  constructor(private readonly discordApi: DiscordApi) {}

  async getCurrentUser(): Promise<DiscordUser> {
    return this.discordApi.get('/users/@me');
  }
}
