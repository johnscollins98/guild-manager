import { AlertColor } from '@mui/material/Alert';
import { useEffect, useMemo, useState } from 'react';
import {
  DiscordLogDisplay,
  DiscordLogDisplayGenerator
} from '../../Interfaces/DiscordLogStringGenerator';
import { useDiscordLog } from '../../utils/apis/discord-api';
import { DiscordLogDisplayFactory as DiscordLogEntryFactory } from '../../utils/DiscordLogStringFactory';
import { snowflakeToDate } from '../../utils/Helpers';
import { useToast } from '../Common/ToastContext';
import LoaderPage from '../LoaderPage';
import './DiscordLog.scss';
import DiscordLogEntry from './DiscordLogEntry';
interface Props {
  filterString: string;
}

const DiscordLog = ({ filterString }: Props) => {
  const { isLoading, data, error } = useDiscordLog();

  if (error) return <>There was an error gathering log data.</>;

  if (isLoading || !data) return <LoaderPage />;

  const logData = useMemo(() => {
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
    const lowerCaseFilterString = filterString.toLowerCase();
    return logData.filter(
      entry =>
        entry.discordDisplay.summary.toLowerCase().includes(lowerCaseFilterString) ||
        entry.discordDisplay.details?.some(detail =>
          detail.toLowerCase().includes(lowerCaseFilterString)
        )
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
