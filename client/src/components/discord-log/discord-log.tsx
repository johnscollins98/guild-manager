import { Box, Button } from '@mui/material';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { type DiscordLog } from 'server';
import { discordLogQuery, useDiscordLeavers } from '../../lib/apis/discord-api';
import {
  type LogDisplay,
  type LogDisplayGenerator
} from '../../lib/interfaces/log-string-generator';
import { DiscordLogDisplayFactory as DiscordLogEntryFactory } from '../../lib/utils/discord-log-string-factory';
import { snowflakeToDate } from '../../lib/utils/helpers';
import { useFilterString } from '../../lib/utils/use-filter-string';
import LogEntry from '../common/log-entry';
import './discord-log.scss';

interface DiscordLogEntry {
  discordDisplay: LogDisplay;
  date: Date;
}

const DiscordLog = () => {
  const filterString = useFilterString();
  const discordLeavers = useDiscordLeavers();

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
    const factory = new DiscordLogEntryFactory(discordLog.data);
    const auditData = discordLog.data.audit_log_entries
      .filter(entry => !!factory.getDiscordLogStringGenerator(entry.id))
      .map(entry => {
        const date = snowflakeToDate(entry.id);
        const generator = factory.getDiscordLogStringGenerator(entry.id) as LogDisplayGenerator;
        return {
          date: date,
          discordDisplay: generator.getEntry()
        };
      });

    const leaversData = discordLeavers.data
      .filter(l => {
        const leaverDate = new Date(l.time);
        const lastLog =
          discordLog.data.audit_log_entries[discordLog.data.audit_log_entries.length - 1]!;
        const lastLogDate = snowflakeToDate(lastLog.id);

        return leaverDate.getTime() >= lastLogDate.getTime();
      })
      .map(l => ({
        discordDisplay: {
          summary: `${l.displayName} left/kicked.`,
          details: [
            `Account Name: ${l.username ?? ''}`,
            `User Display Name: ${l.userDisplayName ?? ''}`,
            `Global Name: ${l.globalName ?? ''}`,
            ...(l.nickname ? [`Nickname: ${l.nickname}`] : [])
          ]
        },
        date: new Date(l.time)
      }));

    return [...auditData, ...leaversData].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [discordLog.data, discordLeavers.data]);

  const filteredLogData = useMemo(() => {
    return logData.filter(
      entry =>
        entry.discordDisplay.summary.toLowerCase().includes(filterString) ||
        entry.discordDisplay.details?.some(detail => detail.toLowerCase().includes(filterString))
    );
  }, [logData, filterString]);

  return (
    <div className="log-container">
      {filteredLogData.map(entry => {
        return (
          <LogEntry
            details={entry.discordDisplay.details}
            date={entry.date}
            key={entry.date.toISOString()}
          >
            {entry.discordDisplay.summary}
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
    </div>
  );
};

export default DiscordLog;
