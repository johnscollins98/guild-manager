import { DiscordActionType } from './DiscordActionType';

export interface DiscordLogOptions {
  channel_id?: string;
  count?: string;
  delete_member_days?: string;
  id?: string;
  members_removed?: string;
  message_id?: string;
  role_name?: string;
  type?: string;
}

export interface DiscordLogChange {
  key: string;
  old_value?: any;
  new_value?: any;
}

export interface DiscordLogEntry {
  id: string;
  user_id?: string;
  target_id?: string;
  action_type: DiscordActionType;
  changes?: DiscordLogChange[];
  reason?: string;
  options?: DiscordLogOptions;
}

export interface DiscordLogUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
  bot?: boolean;
}

export interface DiscordLog {
  audit_log_entries: DiscordLogEntry[];
  users: DiscordLogUser[];
}
