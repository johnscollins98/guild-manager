import { Service } from 'typedi';
import { DiscordChannel } from '../../models/interfaces/discordchannel.interface';
import DiscordEmbed from '../../models/interfaces/discordembed.interface';
import DiscordMessage from '../../models/interfaces/discordmessage.interface';
import { DiscordMessageDetails } from '../../models/interfaces/discordmessagedetails.interface';
import { DiscordMessagePost } from '../../models/interfaces/discordmessagepost.interface';
import { DiscordApi } from './api.discord.service';

@Service()
export class DiscordChannelApi {
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
    const areEmbedsTheSame = this.areEmbedsTheSame(currentMessage.embeds[0], embed);
    if (!areEmbedsTheSame) {
      await this.discordApi.patch(`channels/${channelId}/messages/${messageId}`, { embed });
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

  private areEmbedsTheSame(embedA: DiscordEmbed, embedB: DiscordEmbed): boolean {
    if (!embedA && !embedB) return false;
    if (embedA && !embedB) return false;
    if (!embedA && embedB) return false;

    if (embedA.title !== embedB.title) return false;
    if (parseInt(embedA.color) !== parseInt(embedB.color)) return false;

    const embedAFields = embedA.fields || [];
    const embedBFields = embedB.fields || [];
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
