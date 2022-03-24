import DiscordEmbed from './discordembed.interface';

export interface DiscordMessageDetails {
  id: string;
  embeds: DiscordEmbed[];
}
