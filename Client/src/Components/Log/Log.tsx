import { useGW2Log } from '../../utils/apis/gw2-api';
import { useFilterString } from '../../utils/useFilterString';
import { ErrorMessage } from '../Common/ErrorMessage';
import LoaderPage from '../LoaderPage';
import './Log.scss';
import LogEntry from './LogEntry';

const Log = () => {
  const filterString = useFilterString();
  const { isLoading, data, error } = useGW2Log();

  if (error) {
    return <ErrorMessage>There was an error loading log data.</ErrorMessage>;
  }

  if (isLoading || !data) return <LoaderPage />;

  const filteredData = data.filter(entry => entry.message.toLowerCase().includes(filterString));

  return (
    <div className="log-container">
      {filteredData.map(entry => (
        <LogEntry entryData={entry} key={`${entry.date}${entry.time}`} />
      ))}
    </div>
  );
};

export default Log;
