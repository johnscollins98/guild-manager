import Container, { Service } from 'typedi';
import { config } from '../../config';
import { GW2GuildApi, IGW2GuildApi } from './guild-api';
import { MockGW2GuildApi } from './mocks/guild-api';

@Service()
export class GW2ApiFactory {
  guildApi(): IGW2GuildApi {
    return this.isDev() ? Container.get(MockGW2GuildApi) : Container.get(GW2GuildApi);
  }

  private isDev() {
    return process.env.NODE_ENV === 'development' && !config.gw2guildId;
  }
}
