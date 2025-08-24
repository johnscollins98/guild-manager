import { Box, Button } from '@mui/material';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Suspense, useMemo } from 'react';
import { type DiscordLog, type DiscordLogUser } from 'server';
import { discordLogQuery, useDiscordLeavers } from '../../lib/apis/discord-api';
import { snowflakeToDate } from '../../lib/utils/helpers';
import { LoadingLogEntry } from '../common/log-loader';
import { DiscordLogDisplay, type Log } from './discord-log-display';
import { type Leaver, LeaverLogDisplay } from './leaver-log-display';

const DiscordLog = () => {
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

  const sortedAndFiltered = useMemo(() => {
    const auditData = discordLog.data.audit_log_entries.map(
      d => ({ ...d, date: snowflakeToDate(d.id), leaver: false }) as const
    );
    const leaversData = discordLeavers.data
      .filter(l => {
        const leaverDate = new Date(l.time);
        const lastLog = auditData[auditData.length - 1]!;
        const lastLogDate = lastLog.date;

        return leaverDate.getTime() >= lastLogDate.getTime();
      })
      .map(l => ({ ...l, date: new Date(l.time), leaver: true }) as const);

    return [...auditData, ...leaversData].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [discordLeavers.data, discordLog.data.audit_log_entries]);

  return (
    <Box overflow="auto" sx={{ overflowAnchor: 'none' }}>
      {sortedAndFiltered.map(entry => {
        return (
          <Suspense fallback={<LoadingLogEntry />} key={entry.id}>
            <LogSwitch entry={entry} users={discordLog.data.users} />
          </Suspense>
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

type Entry = Log | Leaver;

const LogSwitch = ({ entry, users }: { entry: Entry; users: DiscordLogUser[] }) => {
  return entry.leaver ? (
    <LeaverLogDisplay entry={entry} users={users} />
  ) : (
    <DiscordLogDisplay entry={entry} users={users} />
  );
};

export default DiscordLog;
