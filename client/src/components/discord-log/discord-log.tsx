import { useSuspenseQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { discordLeaversQuery, discordLogQuery } from '../../lib/apis/discord-api';
import {
  type DiscordLogDisplay,
  type DiscordLogDisplayGenerator
} from '../../lib/interfaces/discord-log-string-generator';
import { DiscordLogDisplayFactory as DiscordLogEntryFactory } from '../../lib/utils/discord-log-string-factory';
import { snowflakeToDate } from '../../lib/utils/helpers';
import { useFilterString } from '../../lib/utils/use-filter-string';
import DiscordLogEntry from './discord-log-entry';
import './discord-log.scss';

interface DiscordLogEntry {
  discordDisplay: DiscordLogDisplay;
  date: Date;
}

const DiscordLog = () => {
  const filterString = useFilterString();
  const [discordLog, discordLeavers] = useSuspenseQueries({
    queries: [discordLogQuery, discordLeaversQuery]
  });

  const logData: DiscordLogEntry[] | undefined = useMemo(() => {
    const factory = new DiscordLogEntryFactory(discordLog.data);
    const auditData = discordLog.data.audit_log_entries
      .filter(entry => !!factory.getDiscordLogStringGenerator(entry.id))
      .map(entry => {
        const date = snowflakeToDate(entry.id);
        const generator = factory.getDiscordLogStringGenerator(
          entry.id
        ) as DiscordLogDisplayGenerator;
        return {
          date: date,
          discordDisplay: generator.getEntry()
        };
      });

    const leaversData = discordLeavers.data.map(l => ({
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
          <DiscordLogEntry
            displayEntry={entry.discordDisplay}
            date={entry.date}
            key={entry.date.toISOString()}
          />
        );
      })}
    </div>
  );
};

export default DiscordLog;
