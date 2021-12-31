import { DiscordLogChange, DiscordLogUser } from '../../Interfaces/DiscordLog';
import { DiscordLogStringGenerator } from '../../Interfaces/DiscordLogStringGenerator';

export class MemberRoleUpdate implements DiscordLogStringGenerator {
  constructor(
    private readonly user: DiscordLogUser,
    private readonly target: DiscordLogUser,
    private readonly changes: DiscordLogChange[]
  ) {}

  getEntry(): string {
    let str = `${this.user.username} updated roles for ${this.target.username}.`;
    const added = this.changes.find(c => c.key === "$add");
    if (added) {
      const values = added.new_value as { name: string, id: string }[];
      str += ` Added ${values.map(v => `"${v.name}"`).join(", ")}.`;
    }

    const removed = this.changes.find(c => c.key === "$remove");
    if (removed) {
      const values = removed.new_value as { name: string, id: string }[];
      str += ` Removed ${values.map(v => `"${v.name}"`).join(", ")}.`;
    }

    return str;
  }
}
