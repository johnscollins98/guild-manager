import { useSuspenseQuery } from '@tanstack/react-query';
import { type DiscordLogUser, type MemberLeftDTO } from 'server';
import { getMemberOrUserQuery } from '../../lib/apis/discord-api';
import { getUserAvatar } from '../../lib/utils/helpers';
import LogEntry from '../common/log-entry';
import { useIsFiltered } from './hooks';

export type Leaver = MemberLeftDTO & { leaver: true; date: Date };

export const LeaverLogDisplay = ({ entry, users }: { entry: Leaver; users: DiscordLogUser[] }) => {
  const { data: leaver } = useSuspenseQuery(getMemberOrUserQuery(entry.userId, users));

  const entryCopy = { ...entry };

  let avatar: string | undefined = undefined;

  if (leaver.member || leaver.user) {
    avatar = getUserAvatar(leaver);

    if (leaver.user?.username) {
      entryCopy.username = leaver.user.username;
    }

    if (leaver.user?.global_name) {
      entryCopy.globalName = leaver.user.global_name;
    }
  }

  const details = [
    `Account Name: ${entryCopy.username ?? ''}`,
    `User Display Name: ${entryCopy.userDisplayName ?? ''}`,
    `Global Name: ${entryCopy.globalName ?? ''}`,
    ...(entryCopy.nickname ? [`Nickname: ${entryCopy.nickname}`] : [])
  ];

  const summary = `${entryCopy.displayName} left.`;

  if (!useIsFiltered(summary, details)) return null;

  return (
    <LogEntry date={entryCopy.date} details={details} avatarUrl={avatar}>
      {summary}
    </LogEntry>
  );
};
