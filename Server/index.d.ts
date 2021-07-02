import { GuildInfo } from 'passport-discord';
import MemberInfo from './Interfaces/MemberInfo';

declare global {
  namespace Express {
    export interface Request {
      member: MemberInfo;
    }
    export interface User {
      guilds: GuildInfo[];
      id: string;
      username: string;
      _id: string;
    }
  }
}