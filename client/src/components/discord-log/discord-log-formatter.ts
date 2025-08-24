import {
  DiscordActionType,
  type DiscordLogEntry,
  type DiscordLogUser,
  type DiscordMemberDTO
} from 'server';
import { getUserAvatar, getUserName, snowflakeToDate } from '../../lib/utils/helpers';

export const getDiscordLogData = (
  logEntry: DiscordLogEntry,
  members: DiscordMemberDTO[],
  users: DiscordLogUser[]
) => {
  const initiatingMember = members.find(m => m.id === logEntry.user_id);
  const targetMember = members.find(m => m.id === logEntry.target_id);

  const initiatingUser = users.find(u => u.id === logEntry.user_id);
  const targetUser = users.find(u => u.id === logEntry.target_id);

  const initiatingName = getUserName(initiatingMember, initiatingUser);
  const targetName = getUserName(targetMember, targetUser);

  const res = {
    avatarUrl: getUserAvatar(initiatingMember, initiatingUser),
    date: snowflakeToDate(logEntry.id),
    summary: '',
    details: [] as string[]
  };

  switch (logEntry.action_type) {
    case DiscordActionType.MEMBER_KICK:
      res.summary = `${initiatingName} kicked ${targetName}.`;
      break;
    case DiscordActionType.MEMBER_ROLE_UPDATE:
      res.summary = `${initiatingName} updated roles for ${targetName}.`;
      res.details = getRoleUpdateDetails(logEntry);
      break;
    case DiscordActionType.MEMBER_UPDATE:
      res.summary = `${initiatingName} updated ${targetName}.`;
      res.details = getMemberUpdateDetails(logEntry);
      break;
    default:
      return null;
  }

  return res;
};

const getRoleUpdateDetails = (logEntry: DiscordLogEntry) => {
  let details: string[] = [];

  const added = logEntry.changes?.find(c => c.key === '$add');
  if (added) {
    const values = added.new_value as { name: string; id: string }[];
    details = details.concat(values.map(v => `Added role ${v.name}`));
  }

  const removed = logEntry.changes?.find(c => c.key === '$remove');
  if (removed) {
    const values = removed.new_value as { name: string; id: string }[];
    details = details.concat(values.map(v => `Removed role ${v.name}`));
  }

  return details;
};

const getMemberUpdateDetails = (logEntry: DiscordLogEntry) => {
  const details: string[] = [];

  const nick = logEntry.changes?.find(c => c.key === 'nick');
  if (nick) {
    details.push(`Changed nickname to ${nick.new_value}`);
  }

  return details;
};
