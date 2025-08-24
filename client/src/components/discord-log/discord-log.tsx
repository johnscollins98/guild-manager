import { Box, Button } from '@mui/material';
import { useSuspenseInfiniteQuery, useSuspenseQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { type DiscordLog } from 'server';
import {
  discordLeaversQuery,
  discordLogQuery,
  discordMembersQuery
} from '../../lib/apis/discord-api';
import { snowflakeToDate } from '../../lib/utils/helpers';
import { useFilterString } from '../../lib/utils/use-filter-string';
import LogEntry from '../common/log-entry';
import { getDiscordLogData } from './discord-log-formatter';

interface DiscordLogEntry {
  avatarUrl?: string;
  summary: string;
  details: string[];
  date: Date;
}

const DiscordLog = () => {
  const filterString = useFilterString();
  const [discordMembers, discordLeavers] = useSuspenseQueries({
    queries: [discordMembersQuery, discordLeaversQuery]
  });

  const discordLog = useSuspenseInfiniteQuery({
    initialPageParam: '',
    queryFn: discordLogQuery.queryFn,
    queryKey: discordLogQuery.queryKey,
    getNextPageParam: lastPage => {
      const lastEntry = lastPage.audit_log_entries[lastPage.audit_log_entries.length - 1];

      if (!lastEntry) return null;

      return lastEntry.id;
    },
    select: data =>
      data.pages.reduce(
        (t, p) => ({
          audit_log_entries: [...t.audit_log_entries, ...p.audit_log_entries],
          users: [...t.users, ...p.users]
        }),
        { audit_log_entries: [], users: [] }
      )
  });

  const logData: DiscordLogEntry[] | undefined = useMemo(() => {
    const auditData = discordLog.data.audit_log_entries
      .map(entry => getDiscordLogData(entry, discordMembers.data, discordLog.data.users))
      .filter(entry => entry !== null);

    const leaversData = discordLeavers.data
      .filter(l => {
        const leaverDate = new Date(l.time);
        const lastLog =
          discordLog.data.audit_log_entries[discordLog.data.audit_log_entries.length - 1]!;
        const lastLogDate = snowflakeToDate(lastLog.id);

        return leaverDate.getTime() >= lastLogDate.getTime();
      })
      .map(l => ({
        summary: `${l.displayName} left.`,
        details: [
          `Account Name: ${l.username ?? ''}`,
          `User Display Name: ${l.userDisplayName ?? ''}`,
          `Global Name: ${l.globalName ?? ''}`,
          ...(l.nickname ? [`Nickname: ${l.nickname}`] : [])
        ],
        date: new Date(l.time)
      }));

    return [...auditData, ...leaversData].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [discordLog.data, discordLeavers.data, discordMembers.data]);

  const filteredLogData = useMemo(() => {
    return logData.filter(
      entry =>
        entry.summary.toLowerCase().includes(filterString) ||
        entry.details?.some(detail => detail.toLowerCase().includes(filterString))
    );
  }, [logData, filterString]);

  return (
    <Box overflow="auto" sx={{ overflowAnchor: 'none' }}>
      {filteredLogData.map(entry => {
        return (
          <LogEntry
            details={entry.details}
            date={entry.date}
            avatarUrl={entry.avatarUrl}
            key={entry.date.toISOString()}
          >
            {entry.summary}
          </LogEntry>
        );
      })}
      <Box display="flex" justifyContent="center">
        <Button
          onClick={() => discordLog.fetchNextPage()}
          loadingPosition="end"
          loading={discordLog.isFetching}
        >
          Load More
        </Button>
      </Box>
    </Box>
  );
};

export default DiscordLog;
