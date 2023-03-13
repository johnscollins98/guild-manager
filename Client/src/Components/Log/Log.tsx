import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import GW2LogEntry from '../../Interfaces/GW2LogEntry';
import { useGW2Log } from '../../utils/apis/gw2-api';
import { filterLogByString } from '../../utils/Helpers';
import { useToast } from '../Common/ToastContext';
import LoaderPage from '../LoaderPage';
import './Log.scss';
import LogEntry from './LogEntry';

interface Props {
  filterString: string;
}

const Log = ({ filterString }: Props) => {
  const [filteredData, setFilteredData] = useState<GW2LogEntry[]>([]);
  const openToast = useToast();

  const { isLoading, data, error } = useGW2Log();

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
