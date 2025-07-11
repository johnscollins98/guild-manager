import { DiscordActionType, type DiscordLog } from 'server';
import { type LogDisplayGenerator } from '../interfaces/log-string-generator';
import { MemberKicked } from './discord-log-string-generators/member-kicked';
import { MemberRoleUpdate } from './discord-log-string-generators/member-role-update';
import { MemberUpdate } from './discord-log-string-generators/member-update';

export class DiscordLogDisplayFactory {
  constructor(private readonly log: DiscordLog) {}

  getDiscordLogStringGenerator(id: string): LogDisplayGenerator | null {
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
