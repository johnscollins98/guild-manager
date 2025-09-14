import { MessageEditOptions } from 'discord.js';
import { Service } from 'typedi';
import {
  DiscordChannel,
  DiscordEmbed,
  DiscordMessage,
  DiscordMessageDetails,
  DiscordMessagePost
} from '../../dtos';
import { DiscordApi } from './discord-api';

export interface IDiscordChannelApi {
  getChannel(channelId: string): Promise<DiscordChannel>;
  createDirectMessageChannel(userId: string): Promise<string>;
  getChannelMessages(channelId: string): Promise<DiscordMessage[]>;
  getChannelMessage(channelId: string, messageId: string): Promise<DiscordMessageDetails>;
  editMessage(
    channelId: string,
    messageId: string,
    messageObject: MessageEditOptions
  ): Promise<boolean>;
  addEmbed(channelId: string, embed: DiscordEmbed): Promise<boolean>;
  sendMessage(channelId: string, messageObject: MessageEditOptions): Promise<boolean>;
}

@Service()
export class DiscordChannelApi implements IDiscordChannelApi {
  constructor(private readonly discordApi: DiscordApi) {}

  async getChannel(channelId: string): Promise<DiscordChannel> {
    return await this.discordApi.get(`/channels/${channelId}`);
  }

  async createDirectMessageChannel(userId: string): Promise<string> {
    const channelObject: DiscordChannel = await this.discordApi.post(`/users/@me/channels`, {
      recipient_id: userId
    });
    return channelObject.id;
  }

  async getChannelMessages(channelId: string): Promise<DiscordMessage[]> {
    return await this.discordApi.get(`/channels/${channelId}/messages`);
  }

  async getChannelMessage(channelId: string, messageId: string): Promise<DiscordMessageDetails> {
    return await this.discordApi.get(`/channels/${channelId}/messages/${messageId}`);
  }

  async editMessage(
    channelId: string,
    messageId: string,
    messageObject: DiscordMessagePost
  ): Promise<boolean> {
    console.log(`Updating embed in channel ${channelId}, message ${messageId}`);
    await this.discordApi.patch(`/channels/${channelId}/messages/${messageId}`, messageObject);
    return true;
  }

  async addEmbed(channelId: string, embed: DiscordEmbed): Promise<boolean> {
    await this.sendMessage(channelId, { embeds: [embed] });
    return true;
  }

  async sendMessage(channelId: string, messageObject: DiscordMessagePost): Promise<boolean> {
    await this.discordApi.post(`/channels/${channelId}/messages`, messageObject);
    return true;
  }
}
