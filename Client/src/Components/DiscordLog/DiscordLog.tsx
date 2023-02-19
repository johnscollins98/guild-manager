import { AlertColor } from '@mui/material/Alert';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import {
  DiscordLogDisplay,
  DiscordLogDisplayGenerator
} from '../../Interfaces/DiscordLogStringGenerator';
import { fetchDiscordLog } from '../../utils/DataRetrieval';
import { DiscordLogDisplayFactory as DiscordLogEntryFactory } from '../../utils/DiscordLogStringFactory';
import { snowflakeToDate } from '../../utils/Helpers';
import LoaderPage from '../LoaderPage';
import './DiscordLog.scss';
import DiscordLogEntry from './DiscordLogEntry';
interface Props {
  filterString: string;
  openToast: (msg: string, status: AlertColor) => void;
}

const DiscordLog = ({ filterString, openToast }: Props) => {
  const { isLoading, data, error } = useQuery('discordLog', fetchDiscordLog);
  const [logData, setLogData] = useState<{ discordDisplay: DiscordLogDisplay; date: Date }[]>([]);

  useEffect(() => {
    if (error) {
      return openToast('Error loading log data', 'error');
    }

    if (isLoading || !data) {
      return;
    }

    const factory = new DiscordLogEntryFactory(data);
    const generatedData = data.audit_log_entries
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

    setLogData(generatedData);
  }, [filterString, isLoading, data, error, openToast]);

  if (!logData) {
    return <LoaderPage />;
  }

  return (
    <div className="log-container">
      {logData.map(entry => {
        return <DiscordLogEntry displayEntry={entry.discordDisplay} date={entry.date} />;
      })}
    </div>
  );
};

export default DiscordLog;
