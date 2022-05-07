import DiscordEmbed from './discordembed.interface';

export interface DiscordMessagePost {
  content?: string;
  embeds?: DiscordEmbed[];
}
