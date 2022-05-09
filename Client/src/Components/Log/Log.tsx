import { AlertColor } from '@mui/material';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import GW2LogEntry from '../../Interfaces/GW2LogEntry';
import { fetchGW2Log } from '../../utils/DataRetrieval';
import { filterLogByString } from '../../utils/Helpers';
import LoaderPage from '../LoaderPage';
import './Log.scss';
import LogEntry from './LogEntry';

interface Props {
  filterString: string;
  openToast: (msg: string, status: AlertColor) => void;
}

const Log = ({ filterString, openToast }: Props) => {
  const [filteredData, setFilteredData] = useState<GW2LogEntry[]>([]);

  const { isLoading, data, error } = useQuery('gw2log', () => fetchGW2Log());

  useEffect(() => {
    if (!data) return;
    setFilteredData(filterLogByString(data, filterString));
  }, [data, filterString]);

  if (error) {
    openToast('There was an error getting the log', 'error');
    console.error(error);
    return null;
  }
  if (isLoading) return <LoaderPage />;
  return (
    <div className="log-container">
      {filteredData.map(entry => (
        <LogEntry entryData={entry} key={`${entry.date}${entry.time}`} />
      ))}
    </div>
  );
};

export default Log;
