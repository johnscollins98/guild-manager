import Container, { Service } from 'typedi';
import { config } from '../../config';
import { DiscordChannelApi, IDiscordChannelApi } from './channel-api';
import { DiscordGuildApi, IDiscordGuildApi } from './guild-api';
import { MockDiscordChannelApi } from './mocks/channel-api-mock';
import { MockDiscordGuildApi } from './mocks/guild-api-mock';
import { MockDiscordUserApi } from './mocks/user-api-mock';
import { DiscordUserApi, IDiscordUserApi } from './user-api';

@Service()
export class DiscordApiFactory {
  channelApi(): IDiscordChannelApi {
    return this.isDev() ? Container.get(MockDiscordChannelApi) : Container.get(DiscordChannelApi);
  }

  guildApi(): IDiscordGuildApi {
    return this.isDev() ? Container.get(MockDiscordGuildApi) : Container.get(DiscordGuildApi);
  }

  userApi(): IDiscordUserApi {
    return this.isDev() ? Container.get(MockDiscordUserApi) : Container.get(DiscordUserApi);
  }

  private isDev() {
    return process.env.NODE_ENV === 'development' && !config.discordGuildId;
  }
}
