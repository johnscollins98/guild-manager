import { type DiscordLogUser } from 'server';
import { type LogDisplay, type LogDisplayGenerator } from '../../interfaces/log-string-generator';

export class MemberKicked implements LogDisplayGenerator {
  constructor(
    private readonly kicker: DiscordLogUser,
    private readonly kickee: DiscordLogUser
  ) {}

  getEntry(): LogDisplay {
    return { summary: `${this.kicker.username} kicked ${this.kickee.username}.` };
  }
}
