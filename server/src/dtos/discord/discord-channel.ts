import { ChannelType } from 'discord.js';

export interface DiscordChannel {
  id: string;
  name: string;
  type: ChannelType;
  position: number;
}
