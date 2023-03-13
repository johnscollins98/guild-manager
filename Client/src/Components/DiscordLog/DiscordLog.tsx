import { AlertColor } from '@mui/material/Alert';
import { useEffect, useState } from 'react';
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
  const [logData, setLogData] = useState<{ discordDisplay: DiscordLogDisplay; date: Date }[]>([]);
  const openToast = useToast();

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
