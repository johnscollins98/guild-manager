import { useQuery } from '@tanstack/react-query';
import { Suspense, use, useMemo } from 'react';
import {
  WarningTypeLabels,
  type DiscordMemberDTO,
  type DiscordUser,
  type WarningDTO
} from 'server';
import { discordUserQuery, useDiscordMembers } from '../../lib/apis/discord-api';
import { useWarnings } from '../../lib/apis/warnings-api';
import { useFilterString } from '../../lib/utils/use-filter-string';
import LogEntry from '../common/log-entry';
import { LoadingLogEntry } from '../common/log-loader';
import { FilterContext, SortContext } from './log-setting-context';

export const WarningList = () => {
  const warnings = useWarnings();
  const { sortAscending } = use(SortContext);
  const { warningTypesToDisplay } = use(FilterContext);

  const sorted = useMemo(
    () =>
      warnings.data.toSorted((a, b) => {
        const aDate = new Date(a.timestamp).valueOf();
        const bDate = new Date(b.timestamp).valueOf();
        return sortAscending ? aDate - bDate : bDate - aDate;
      }),
    [warnings.data, sortAscending]
  );

  const filteredByType = useMemo(
    () => sorted.filter(w => warningTypesToDisplay[w.type]),
    [sorted, warningTypesToDisplay]
  );

  return filteredByType.map(e => (
    <Suspense fallback={<LoadingLogEntry />} key={e.id}>
      <Entry warning={e} />
    </Suspense>
  ));
};

const Entry = ({ warning }: { warning: WarningDTO }) => {
  const filterStringLowerCase = useFilterString().toLowerCase();

  const discordMembers = useDiscordMembers();

  const givenToMember = discordMembers.data.find(m => m.id === warning.givenTo);
  const givenByMember = discordMembers.data.find(m => m.id === warning.givenBy);
  const lastUpdatedByMember = warning.lastUpdatedBy
    ? discordMembers.data.find(m => m.id === warning.lastUpdatedBy)
    : undefined;

  const givenByUser = useQuery({
    ...discordUserQuery(warning.givenBy),
    enabled: !givenByMember
  });

  const givenToUser = useQuery({
    ...discordUserQuery(warning.givenTo),
    enabled: !givenToMember
  });

  const lastUpdatedByUser = useQuery({
    ...discordUserQuery(warning.lastUpdatedBy ?? ''),
    enabled: !!warning.lastUpdatedBy && !lastUpdatedByMember
  });

  if (givenByUser.isLoading || givenToUser.isLoading || lastUpdatedByUser.isLoading) {
    return <LoadingLogEntry />;
  }

  const givenToName = getUserName(givenToMember, givenToUser.data);
  const givenByName = getUserName(givenByMember, givenByUser.data);

  const summary = `[${WarningTypeLabels[warning.type]}] Given to ${givenToName} by ${givenByName}.`;

  if (!summary.toLowerCase().includes(filterStringLowerCase)) {
    return null;
  }

  const details = [warning.reason];

  if (warning.lastUpdatedBy) {
    const updatedMember = getUserName(lastUpdatedByMember, lastUpdatedByUser.data);
    const updatedDate = new Date(warning.lastUpdatedTimestamp);
    details.push(`Last updated on ${updatedDate.toLocaleString()} by ${updatedMember}.`);
  }

  const avatarUrl =
    givenToMember?.avatar ??
    (givenToUser.data?.avatar
      ? `https://cdn.discordapp.com/avatars/${givenToUser.data?.id}/${givenToUser.data?.avatar}.png`
      : undefined);

  return (
    <LogEntry
      date={new Date(warning.timestamp)}
      key={warning.id}
      details={details}
      avatarUrl={avatarUrl}
    >
      {summary}
    </LogEntry>
  );
};

const getUserName = (member: DiscordMemberDTO | undefined, user: DiscordUser | undefined) => {
  if (member?.nickname) return member.nickname;
  if (member?.name) return member.name;
  if (user?.username) return user.username;
  if (user?.global_name) return user.global_name;
  return 'Unknown User';
};
