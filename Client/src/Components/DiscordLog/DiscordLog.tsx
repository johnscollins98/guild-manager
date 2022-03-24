import React, { useEffect, useState } from 'react';
import { Color } from '@material-ui/lab/Alert';
import { useQuery } from 'react-query';
import { fetchDiscordLog } from '../../utils/DataRetrieval';
import LoaderPage from '../LoaderPage';
import { DiscordLogDisplayFactory as DiscordLogEntryFactory } from '../../utils/DiscordLogStringFactory';

import './DiscordLog.scss';
import { snowflakeToDate } from '../../utils/Helpers';
import {
  DiscordLogDisplay,
  DiscordLogDisplayGenerator
} from '../../Interfaces/DiscordLogStringGenerator';
import DiscordLogEntry from './DiscordLogEntry';

interface Props {
  filterString: string;
  openToast: (msg: string, status: Color) => void;
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
