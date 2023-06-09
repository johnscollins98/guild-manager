export default interface DiscordMember {
  user?: {
    id: string;
    username: string;
    avatar?: string;
    global_name?: string;
  };
  roles: string[];
  nick?: string;
  joined_at: string;
}

export interface DiscordMemberUpdate {
  nick?: string;
  roles?: string[];
}
