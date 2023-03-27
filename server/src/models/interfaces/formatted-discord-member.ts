import DiscordRole from './discord-role';

export default interface FormattedDiscordMember {
  name?: string;
  nickname?: string;
  roles: DiscordRole[];
  id?: string;
  joined: string;
  avatar?: string;
}
