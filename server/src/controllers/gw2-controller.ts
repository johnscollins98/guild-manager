import { Authorized, Get, Header, JsonController } from 'routing-controllers';
import { Service } from 'typedi';
import { GW2ApiFactory } from '../services/gw2/api-factory';
import { IGW2GuildApi } from '../services/gw2/guild-api';
import { GW2LogFormatter } from '../services/gw2/log-formatter';

@JsonController('/api/gw2')
@Authorized()
@Service()
export class GW2Controller {
  private readonly gw2GuildApi: IGW2GuildApi;

  constructor(gw2GuildApiFactory: GW2ApiFactory, private readonly logFormatter: GW2LogFormatter) {
    this.gw2GuildApi = gw2GuildApiFactory.guildApi();
  }

  @Get('/log')
  async getLog() {
    const unformattedLog = await this.gw2GuildApi.getLog();
    return this.logFormatter.formatLogEntries(unformattedLog);
  }

  @Get('/members')
  @Header('Cache-control', `public, max-age=0`)
  getMembers() {
    return this.gw2GuildApi.getMembers();
  }

  @Get('/ranks')
  getRanks() {
    return this.gw2GuildApi.getRanks();
  }
}
