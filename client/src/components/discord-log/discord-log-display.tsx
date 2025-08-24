import { useSuspenseQueries } from '@tanstack/react-query';
import { DiscordActionType, type DiscordLogEntry, type DiscordLogUser } from 'server';
import { getMemberOrUserQuery } from '../../lib/apis/discord-api';
import { getUserAvatar, getUserName } from '../../lib/utils/helpers';
import LogEntry from '../common/log-entry';
import { useIsFiltered } from './hooks';

export type Log = DiscordLogEntry & { leaver: false; date: Date };

export const DiscordLogDisplay = ({ entry, users }: { entry: Log; users: DiscordLogUser[] }) => {
  switch (entry.action_type) {
    case DiscordActionType.MEMBER_KICK:
    case DiscordActionType.MEMBER_ROLE_UPDATE:
    case DiscordActionType.MEMBER_UPDATE:
      return <MemberAction entry={entry} users={users} />;
    default:
      return null;
  }
};

const MemberAction = ({ entry, users }: { entry: Log; users: DiscordLogUser[] }) => {
  const [initiatingQuery, targetQuery] = useSuspenseQueries({
    queries: [
      getMemberOrUserQuery(entry.user_id, users),
      getMemberOrUserQuery(entry.target_id, users)
    ]
  });

  const initiating = {
    name: getUserName(initiatingQuery.data),
    avatar: getUserAvatar(initiatingQuery.data)
  };

  const target = {
    name: getUserName(targetQuery.data)
  };

  let summary = '';
  let details: string[] = [];
  switch (entry.action_type) {
    case DiscordActionType.MEMBER_KICK:
      summary = `${initiating?.name} kicked ${target?.name}`;
      break;
    case DiscordActionType.MEMBER_ROLE_UPDATE:
      summary = `${initiating?.name} updated roles for ${target?.name}`;
      details = getRoleUpdateDetails(entry);
      break;
    case DiscordActionType.MEMBER_UPDATE:
      summary = `${initiating?.name} updated ${target?.name}`;
      details = getMemberUpdateDetails(entry);
      break;
  }

  if (!useIsFiltered(summary, details)) return null;

  return (
    <LogEntry date={entry.date} avatarUrl={initiating?.avatar} details={details}>
      {summary}
    </LogEntry>
  );
};

const getRoleUpdateDetails = (logEntry: Log) => {
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

const getMemberUpdateDetails = (logEntry: Log) => {
  const details: string[] = [];

  const nick = logEntry.changes?.find(c => c.key === 'nick');
  if (nick) {
    details.push(`Changed nickname to ${nick.new_value}`);
  }

  return details;
};
