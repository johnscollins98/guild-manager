import { type DiscordLogChange, type DiscordLogUser } from 'server';
import { type LogDisplay, type LogDisplayGenerator } from '../../interfaces/log-string-generator';

export class MemberUpdate implements LogDisplayGenerator {
  constructor(
    private readonly user: DiscordLogUser,
    private readonly target: DiscordLogUser,
    private readonly changes: DiscordLogChange[]
  ) {}

  getEntry(): LogDisplay {
    const display: LogDisplay = {
      summary: `${this.user.username} updated ${this.target.username}.`,
      sourceUser: this.user,
      details: []
    };

    const nick = this.changes.find(c => c.key === 'nick');
    if (nick && display.details) {
      display.details.push(`Changed nickname to ${nick.new_value}`);
    }

    return display;
  }
}
