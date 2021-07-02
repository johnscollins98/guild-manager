import { GuildInfo } from 'passport-discord';
import { GuildMemberInterface } from './models/guildMember.model';

declare global {
  namespace Express {
    export interface Request {
      member: GuildMemberInterface;
    }
    export interface User {
      guilds: GuildInfo[];
      id: string;
      username: string;
      _id: string;
    }
  }
}