import { Authorized, Get, Header, JsonController } from 'routing-controllers';
import { Service } from 'typedi';
import { GW2GuildApi } from '../services/gw2/guildapi.gw2.service';
import { GW2LogFormatter } from '../services/gw2/logformatter.gw2.service';

@JsonController('/api/gw2')
@Authorized()
@Service()
export class GW2Controller {
  constructor(
    private readonly gw2GuildApi: GW2GuildApi,
    private readonly logFormatter: GW2LogFormatter
  ) {}

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
