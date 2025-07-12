import { DiscordUser } from './discord-member';

export interface DiscordMessage {
  id: string;
  author: DiscordUser;
  timestamp: string;
}
