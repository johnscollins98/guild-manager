import { GuildInfo } from 'passport-discord';

declare global {
  namespace Express {
    export interface User {
      guilds: GuildInfo[];
      id: string;
      username: string;
    }
  }
}