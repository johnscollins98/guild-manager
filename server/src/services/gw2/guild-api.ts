import { Service } from 'typedi';
import { config } from '../../config';
import GW2LogEntry from '../../models/interfaces/gw2-log-entry';
import GW2Member from '../../models/interfaces/gw2-member';
import GW2Rank from '../../models/interfaces/gw2-rank';
import { GW2Api } from './gw2-api';

@Service()
export class GW2GuildApi {
  private readonly guildId: string;

  constructor(private readonly gw2Api: GW2Api) {
    this.guildId = config.gw2guildId;
  }

  async getMembers(): Promise<GW2Member[]> {
    return await this.get<GW2Member[]>('members');
  }

  async getLog(): Promise<GW2LogEntry[]> {
    return await this.get<GW2LogEntry[]>('log');
  }

  async getRanks(): Promise<GW2Rank[]> {
    return await this.get<GW2Rank[]>('ranks');
  }

  private async get<T>(endpoint: string): Promise<T> {
    return await this.gw2Api.get(`guild/${this.guildId}/${endpoint}`);
  }
}

