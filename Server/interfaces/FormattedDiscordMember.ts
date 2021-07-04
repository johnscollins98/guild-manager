import DiscordRole from './DiscordRole';

export default interface FormattedDiscordMember {
  name?: string;
  roles: DiscordRole[];
  id?: string;
  joined: string;
  avatar?: string;
}