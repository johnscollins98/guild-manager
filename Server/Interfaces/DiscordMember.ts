export default interface DiscordMember {
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
  roles: string[];
  nick?: string;
  joined_at: string;
}
