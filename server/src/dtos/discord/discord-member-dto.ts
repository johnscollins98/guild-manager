import { DiscordRole } from './discord-role';

export interface DiscordMemberDTO {
  name?: string;
  nickname?: string;
  roles: DiscordRole[];
  id?: string;
  joined: string;
  avatar?: string;
}
