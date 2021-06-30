import DiscordRole from './DiscordRole';

export default interface DiscordMember {
  name: string;
  id: string;
  roles: DiscordRole[];
  joined: string;
  avatar: string;
}
