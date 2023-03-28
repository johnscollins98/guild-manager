import { DiscordActionType } from '../interfaces/DiscordActionType';
import { DiscordLog } from '../interfaces/DiscordLog';
import { DiscordLogDisplayGenerator } from '../interfaces/DiscordLogStringGenerator';
import { MemberKicked } from './DiscordLogStringGenerators/MemberKicked';
import { MemberRoleUpdate } from './DiscordLogStringGenerators/MemberRoleUpdate';
import { MemberUpdate } from './DiscordLogStringGenerators/MemberUpdate';

export class DiscordLogDisplayFactory {
  constructor(private readonly log: DiscordLog) {}

  getDiscordLogStringGenerator(id: string): DiscordLogDisplayGenerator | null {
    const logEntry = this.log.audit_log_entries.find(entry => entry.id === id);

    if (!logEntry) {
      throw new Error(`Could not find log entry with id: ${id}`);
    }

    const initiatingUser = this.log.users.find(u => u.id === logEntry.user_id);
    const targetUser = this.log.users.find(u => u.id === logEntry.target_id);

    switch (logEntry.action_type) {
      case DiscordActionType.MEMBER_KICK:
        if (initiatingUser && targetUser) {
          return new MemberKicked(initiatingUser, targetUser);
        }
        break;
      case DiscordActionType.MEMBER_ROLE_UPDATE:
        if (
          initiatingUser &&
          targetUser &&
          logEntry.changes &&
          initiatingUser.username !== 'YAGPDB.xyz'
        ) {
          return new MemberRoleUpdate(initiatingUser, targetUser, logEntry.changes);
        }
        break;
      case DiscordActionType.MEMBER_UPDATE:
        if (initiatingUser && targetUser && logEntry.changes) {
          return new MemberUpdate(initiatingUser, targetUser, logEntry.changes);
        }
        break;
    }

    return null;
  }
}
