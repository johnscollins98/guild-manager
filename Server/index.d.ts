import { GuildInfo } from 'passport-discord';
import { GuildMemberInterface } from './models/warnings';

declare global {
  namespace Express {
    export interface User {
      guilds?: GuildInfo[];
      id: string;
      username: string;
      _id: string;
    }
  }
}
