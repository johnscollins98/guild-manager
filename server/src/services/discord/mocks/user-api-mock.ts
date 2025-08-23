import { Service } from 'typedi';
import { DiscordUser } from '../../../dtos';
import { IDiscordUserApi } from '../user-api';

@Service()
export class MockDiscordUserApi implements IDiscordUserApi {
  async getCurrentUser(): Promise<DiscordUser> {
    return {
      id: '1',
      username: 'Bot'
    };
  }

  async getUserById(id: string): Promise<DiscordUser> {
    return {
      id: id,
      username: 'User ' + id
    };
  }
}
