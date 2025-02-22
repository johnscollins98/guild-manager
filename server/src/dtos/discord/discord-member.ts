export interface DiscordUser {
  id: string;
  username: string;
  avatar?: string;
  global_name?: string;
}

export interface DiscordMember {
  user?: DiscordUser;
  roles: string[];
  nick?: string;
  joined_at: string;
}

export interface DiscordMemberUpdate {
  nick?: string;
  roles?: string[];
}
