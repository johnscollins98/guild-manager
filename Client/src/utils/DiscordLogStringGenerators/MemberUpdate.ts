import { DiscordLogChange, DiscordLogUser } from '../../Interfaces/DiscordLog';
import { DiscordLogStringGenerator } from '../../Interfaces/DiscordLogStringGenerator';

export class MemberUpdate implements DiscordLogStringGenerator {
  constructor(
    private readonly user: DiscordLogUser,
    private readonly target: DiscordLogUser,
    private readonly changes: DiscordLogChange[]
  ) {}

  getEntry(): string {
    let str = `${this.user.username} updated ${this.target.username}.`;

    const nick = this.changes.find(c => c.key === "nick");
    if (nick) {
      str += ` Nickname: ${nick.new_value}`;
    }

    return str;
  }
}