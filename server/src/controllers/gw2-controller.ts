import { Authorized, Get, Header, JsonController } from 'routing-controllers';
import { Service } from 'typedi';
import { FormattedLogEntry, GW2Member, GW2Rank } from '../dtos';
import { GW2ApiFactory } from '../services/gw2/api-factory';
import { IGW2GuildApi } from '../services/gw2/guild-api';
import { GW2LogFormatter } from '../services/gw2/log-formatter';
import { IGW2Controller } from './interfaces/gw2-interface';

@JsonController('/api/gw2')
@Authorized()
@Service()
export class GW2Controller implements IGW2Controller {
  private readonly gw2GuildApi: IGW2GuildApi;

  constructor(
    gw2GuildApiFactory: GW2ApiFactory,
    private readonly logFormatter: GW2LogFormatter
  ) {
    this.gw2GuildApi = gw2GuildApiFactory.guildApi();
  }

  @Get('/log')
  async getLog(): Promise<FormattedLogEntry[]> {
    const unformattedLog = await this.gw2GuildApi.getLog();
    return this.logFormatter.formatLogEntries(unformattedLog);
  }

  @Get('/members')
  @Header('Cache-control', `public, max-age=0`)
  getMembers(): Promise<GW2Member[]> {
    return this.gw2GuildApi.getMembers();
  }

  @Get('/ranks')
  getRanks(): Promise<GW2Rank[]> {
    return this.gw2GuildApi.getRanks();
  }
}
