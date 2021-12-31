import { DiscordLogChange, DiscordLogUser } from '../../Interfaces/DiscordLog';
import {
  DiscordLogDisplay,
  DiscordLogDisplayGenerator
} from '../../Interfaces/DiscordLogStringGenerator';

export class MemberUpdate implements DiscordLogDisplayGenerator {
  constructor(
    private readonly user: DiscordLogUser,
    private readonly target: DiscordLogUser,
    private readonly changes: DiscordLogChange[]
  ) {}

  getEntry(): DiscordLogDisplay {
    const display: DiscordLogDisplay = {
      summary: `${this.user.username} updated ${this.target.username}.`,
      details: []
    };

    const nick = this.changes.find((c) => c.key === 'nick');
    if (nick && display.details) {
      display.details.push(`Changed nickname to ${nick.new_value}`);
    }

    return display;
  }
}
