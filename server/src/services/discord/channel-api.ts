import { Service } from 'typedi';
import {
  DiscordChannel,
  DiscordEmbed,
  DiscordMessage,
  DiscordMessageDetails,
  DiscordMessagePost
} from '../../models';
import { DiscordApi } from './discord-api';

export interface IDiscordChannelApi {
  getChannel(channelId: string): Promise<DiscordChannel>;
  createDirectMessageChannel(userId: string): Promise<string>;
  getChannelMessages(channelId: string): Promise<DiscordMessage[]>;
  getChannelMessage(channelId: string, messageId: string): Promise<DiscordMessageDetails>;
  editEmbed(channelId: string, messageId: string, embed: DiscordEmbed): Promise<boolean>;
  addEmbed(channelId: string, embed: DiscordEmbed): Promise<boolean>;
  sendMessage(channelId: string, messageObject: DiscordMessagePost): Promise<boolean>;
}

@Service()
export class DiscordChannelApi implements IDiscordChannelApi {
  constructor(private readonly discordApi: DiscordApi) {}

  async getChannel(channelId: string): Promise<DiscordChannel> {
    return await this.discordApi.get(`channels/${channelId}`);
  }

  async createDirectMessageChannel(userId: string): Promise<string> {
    const channelObject: DiscordChannel = await this.discordApi.post(`/users/@me/channels`, {
      recipient_id: userId
    });
    return channelObject.id;
  }

  async getChannelMessages(channelId: string): Promise<DiscordMessage[]> {
    return await this.discordApi.get(`channels/${channelId}/messages`);
  }

  async getChannelMessage(channelId: string, messageId: string): Promise<DiscordMessageDetails> {
    return await this.discordApi.get(`channels/${channelId}/messages/${messageId}`);
  }

  async editEmbed(channelId: string, messageId: string, embed: DiscordEmbed): Promise<boolean> {
    const currentMessage = await this.getChannelMessage(channelId, messageId);

    // check there is a change before posting
    const areEmbedsTheSame = this.areEmbedsTheSame(embed, currentMessage.embeds[0]);
    if (!areEmbedsTheSame) {
      await this.discordApi.patch(`channels/${channelId}/messages/${messageId}`, {
        embeds: [embed]
      });
    }
    return true;
  }

  async addEmbed(channelId: string, embed: DiscordEmbed): Promise<boolean> {
    await this.sendMessage(channelId, { embeds: [embed] });
    return true;
  }

  async sendMessage(channelId: string, messageObject: DiscordMessagePost): Promise<boolean> {
    await this.discordApi.post(`channels/${channelId}/messages`, messageObject);
    return true;
  }

  private areEmbedsTheSame(newEmbed: DiscordEmbed, existingEmbed?: DiscordEmbed): boolean {
    if (!existingEmbed) return false;
    if (newEmbed.title !== existingEmbed.title) return false;
    if (parseInt(newEmbed.color) !== parseInt(existingEmbed.color)) return false;

    const embedAFields = newEmbed.fields || [];
    const embedBFields = existingEmbed.fields || [];
    const longerLength = Math.max(embedAFields.length, embedBFields.length);
    for (let i = 0; i < longerLength; i++) {
      const fieldA = embedAFields[i];
      const fieldB = embedBFields[i];

      if (!fieldA) return false;
      if (!fieldB) return false;

      if (fieldA.name !== fieldB.name) return false;
      if (fieldA.value !== fieldB.value) return false;
    }

    return true;
  }
}
