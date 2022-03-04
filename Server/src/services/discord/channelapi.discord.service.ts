import { Service } from 'typedi';
import { DiscordChannel } from '../../models/interfaces/discordchannel.interface';
import DiscordEmbed from '../../models/interfaces/discordembed.interface';
import DiscordMessage from '../../models/interfaces/discordmessage.interface';
import { DiscordApi } from './api.discord.service';

@Service()
export class DiscordChannelApi {
  constructor(private readonly discordApi: DiscordApi) {}

  async getChannel(channelId: string): Promise<DiscordChannel> {
    return await this.discordApi.get(`channels/${channelId}`);
  }

  async getChannelMessages(channelId: string): Promise<DiscordMessage[]> {
    return await this.discordApi.get(`channels/${channelId}/messages`);
  }

  async editEmbed(channelId: string, messageId: string, embed: DiscordEmbed): Promise<boolean> {
    await this.discordApi.patch(`channels/${channelId}/messages/${messageId}`, { embed });
    return true;
  }

  async addEmbed(channelId: string, embed: DiscordEmbed): Promise<boolean> {
    await this.discordApi.post(`channels/${channelId}/messages`, { embed });
    return true;
  }
}