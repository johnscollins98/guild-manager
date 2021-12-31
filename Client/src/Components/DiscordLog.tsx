import React, { useEffect, useState } from 'react';
import { Color } from '@material-ui/lab/Alert';
import { useQuery } from 'react-query';
import { fetchDiscordLog } from '../utils/DataRetrieval';
import LoaderPage from './LoaderPage';
import { DiscordLogStringFactory as DiscordLogEntryFactory } from '../utils/DiscordLogStringFactory';

import './DiscordLog.scss';
import LogEntry from './LogEntry';
import GW2LogEntry from '../Interfaces/GW2LogEntry';
import { snowflakeToDate } from '../utils/Helpers';

interface Props {
  filterString: string;
  openToast: (msg: string, status: Color) => void;
}

const DiscordLog = ({ filterString, openToast }: Props) => {
  const { isLoading, data, error } = useQuery('discordLog', fetchDiscordLog);
  const [logData, setLogData] = useState<GW2LogEntry[]>([]);

  useEffect(() => {
    if (error) {
      return openToast('Error loading log data', 'error');
    }

    if (isLoading || !data) {
      return;
    }

    const factory = new DiscordLogEntryFactory(data);
    const generatedData = data.audit_log_entries
      .filter((entry) => !!factory.getDiscordLogStringGenerator(entry.id))
      .map((entry) => {
        const date = snowflakeToDate(entry.id);
        const generator = factory.getDiscordLogStringGenerator(entry.id);
        return {
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
          message: generator?.getEntry() || "not found"
        }
      });

    setLogData(generatedData);
  }, [filterString, isLoading, data, error, openToast]);

  if (!logData) {
    return <LoaderPage />;
  }

  return (
    <div className="log-container">
      {logData.map((entry) => {
        return <LogEntry entryData={entry} key={`${entry.date}${entry.time}${entry.message}`} />;
      })}
    </div>
  );
};

export default DiscordLog;
