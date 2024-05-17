import { useMemo } from 'react';
import { useDiscordLeavers, useDiscordLog } from '../../lib/apis/discord-api';
import {
  type DiscordLogDisplay,
  type DiscordLogDisplayGenerator
} from '../../lib/interfaces/discord-log-string-generator';
import { DiscordLogDisplayFactory as DiscordLogEntryFactory } from '../../lib/utils/discord-log-string-factory';
import { snowflakeToDate } from '../../lib/utils/helpers';
import { useFilterString } from '../../lib/utils/use-filter-string';
import { ErrorMessage } from '../common/error-message';
import LoaderPage from '../common/loader-page';
import DiscordLogEntry from './discord-log-entry';
import './discord-log.scss';

interface DiscordLogEntry {
  discordDisplay: DiscordLogDisplay;
  date: Date;
}

const DiscordLog = () => {
  const filterString = useFilterString();
  const { isLoading, data, error } = useDiscordLog();
  const { isLoading: isLeaversLoading, data: leavers, error: leaversError } = useDiscordLeavers();

  const logData: DiscordLogEntry[] | undefined = useMemo(() => {
    if (!data) return undefined;
    if (!leavers) return undefined;

    const factory = new DiscordLogEntryFactory(data);
    const auditData = data.audit_log_entries
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

    const leaversData = leavers.map(l => ({
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
  }, [data, leavers]);

  const filteredLogData = useMemo(() => {
    if (!logData) return undefined;
    return logData.filter(
      entry =>
        entry.discordDisplay.summary.toLowerCase().includes(filterString) ||
        entry.discordDisplay.details?.some(detail => detail.toLowerCase().includes(filterString))
    );
  }, [logData, filterString]);

  if (error || leaversError)
    return <ErrorMessage>There was an error gathering log data.</ErrorMessage>;

  if (isLoading || isLeaversLoading || !filteredLogData) return <LoaderPage />;

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
