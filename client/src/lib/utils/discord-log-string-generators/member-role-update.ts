import { type DiscordLogChange, type DiscordLogUser } from 'server';
import { type LogDisplay, type LogDisplayGenerator } from '../../interfaces/log-string-generator';

export class MemberRoleUpdate implements LogDisplayGenerator {
  constructor(
    private readonly user: DiscordLogUser,
    private readonly target: DiscordLogUser,
    private readonly changes: DiscordLogChange[]
  ) {}

  getEntry(): LogDisplay {
    const summary = `${this.user.username} updated roles for ${this.target.username}.`;
    let details: string[] = [];

    const added = this.changes.find(c => c.key === '$add');
    if (added) {
      const values = added.new_value as { name: string; id: string }[];
      details = details.concat(values.map(v => `Added role ${v.name}`));
    }

    const removed = this.changes.find(c => c.key === '$remove');
    if (removed) {
      const values = removed.new_value as { name: string; id: string }[];
      details = details.concat(values.map(v => `Removed role ${v.name}`));
    }

    return { summary, details };
  }
}
