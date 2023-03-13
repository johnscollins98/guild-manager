import { useMemo } from 'react';
import { DiscordLogDisplayGenerator } from '../../Interfaces/DiscordLogStringGenerator';
import { useDiscordLog } from '../../utils/apis/discord-api';
import { DiscordLogDisplayFactory as DiscordLogEntryFactory } from '../../utils/DiscordLogStringFactory';
import { snowflakeToDate } from '../../utils/Helpers';
import { ErrorMessage } from '../Common/ErrorMessage';
import LoaderPage from '../LoaderPage';
import './DiscordLog.scss';
import DiscordLogEntry from './DiscordLogEntry';

const DiscordLog = () => {
  const filterString = '';
  const { isLoading, data, error } = useDiscordLog();

  const logData = useMemo(() => {
    if (!data) return undefined;
    const factory = new DiscordLogEntryFactory(data);
    return data.audit_log_entries
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
  }, [data]);

  const filteredLogData = useMemo(() => {
    if (!logData) return undefined;
    const lowerCaseFilterString = filterString.toLowerCase();
    return logData.filter(
      entry =>
        entry.discordDisplay.summary.toLowerCase().includes(lowerCaseFilterString) ||
        entry.discordDisplay.details?.some(detail =>
          detail.toLowerCase().includes(lowerCaseFilterString)
        )
    );
  }, [logData, filterString]);

  if (error) return <ErrorMessage>There was an error gathering log data.</ErrorMessage>;

  if (isLoading || !filteredLogData) return <LoaderPage />;

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
