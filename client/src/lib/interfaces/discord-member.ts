import DiscordRole from './discord-role';

export default interface DiscordMember {
  name: string;
  nickname?: string;
  id: string;
  roles: DiscordRole[];
  joined: string;
  avatar: string;
}
