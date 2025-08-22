import { type DiscordUser } from 'server';

export interface LogDisplay {
  summary: string;
  sourceUser?: DiscordUser;
  details?: string[];
}

export interface LogDisplayGenerator {
  getEntry(): LogDisplay;
}
